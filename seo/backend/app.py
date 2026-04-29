import logging
import typing
from typing import List, Dict, Any
import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    _DOTENV_PATH = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=_DOTENV_PATH, override=False)
except ImportError:
    pass
import random
import re
import smtplib
import time
import uuid
from datetime import date, datetime, timedelta
from email.mime.text import MIMEText
from urllib.parse import urljoin

import pandas as pd
from analytics_engine import answer_query, generate_insights
from flask import Flask, jsonify, request, send_from_directory, send_file
import io
from io import BytesIO
from flask_bcrypt import Bcrypt
from geo_analyzer import analyze_competitors, analyze_customers, analyze_geo_opportunity
from knowledge_bucket import (
    ask_project_rag_query,
    ask_project_rag_query_advanced,
    ask_rag_query,
    ask_rag_query_advanced,
    delete_user_file,
    is_gemini_configured,
    process_and_store_file,
)
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt, get_jwt_identity, jwt_required)
from database.models import (
    AIKnowledgeFile,
    Business,
    BusinessProfile,
    ContentPost,
    Employee,
    GrowthTip,
    Notification,
    RecruitmentApplication,
    ApplicationMessage,
    RecruitmentJob,
    User,
    UserJobApplication,
    UserProfile,
    db,
)

# Backwards-compatible aliases used throughout `app.py`
Company = Business
JobListing = RecruitmentJob
Application = RecruitmentApplication
ContentItem = ContentPost
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from seo_crawler import SEOCrawler
from email_service import email_service
from social_media_scraper import YouTubeScraper, InstagramScraper, GoogleReviewsScraper

logger = logging.getLogger(__name__)

app = Flask(__name__, instance_relative_config=True)
# Ensure instance folder exists for SQLite database
os.makedirs(app.instance_path, exist_ok=True)

# Config: two separate SQLite databases (no mixing)
user_db_path = os.path.join(app.instance_path, "user.db")
business_db_path = os.path.join(app.instance_path, "business.db")

# Default bind -> user.db
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{user_db_path}"
# Secondary bind -> business.db
app.config["SQLALCHEMY_BINDS"] = {
    "business": f"sqlite:///{business_db_path}",
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {"check_same_thread": False}
}
# Secrets from environment (fallbacks for local dev)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this')
app.config['SOCIAL_API_KEY'] = os.getenv('SOCIAL_API_KEY')
app.config['PAGESPEED_API_KEY'] = os.getenv('PAGESPEED_API_KEY') or os.getenv('GOOGLE_PAGESPEED_API_KEY')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
if app.config['PAGESPEED_API_KEY']:
    # Some analyzers look for this environment variable
    os.environ['PAGESPEED_API_KEY'] = app.config['PAGESPEED_API_KEY']

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"], expose_headers=["Content-Type", "Authorization"]) 
db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# JWT error handling
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired", "message": "Please log in again"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": "Invalid token", "message": "Please log in again"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Authorization token is required", "message": "Please log in again"}), 401

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Use absolute paths so uploads/RAG storage work regardless of the server CWD.
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Enable SQLite foreign key constraints
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception:
        pass


def _missing_env_keys():
    required = ["JWT_SECRET_KEY"]
    smtp_required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_SENDER"]
    missing = [k for k in required if not os.getenv(k)]
    smtp_missing = [k for k in smtp_required if not os.getenv(k)]
    return missing, smtp_missing


missing_keys, smtp_missing_keys = _missing_env_keys()
if missing_keys:
    logger.warning(f"Missing required env keys: {missing_keys}")
if smtp_missing_keys:
    logger.warning(f"SMTP not fully configured. Missing: {smtp_missing_keys}")

# Initialize DB
def _send_email_otp(to_email: str, code: str):
    sender = 'noreply@Scalnex.com'
    subject = '🔔 Your Scalnex Verification Code'
    body = f"""
Hello!

Your Scalnex email verification code is: {code}

This code expires in 10 minutes.

If you didn't request this verification, please ignore this email.

Best regards,
Scalnex Team
    """.strip()
    
    # Send using our custom email service
    try:
        success = email_service.send_email(to_email, subject, body)
    except Exception as e:
        logger.error(f"Email service error: {e}")
        # Return error message upward (sanitized by not including secrets)
        return False, str(e)
    
    if success:
        logger.info(f"✅ Verification email sent to {to_email}")
        logger.info(f"📧 OTP: {code}")
        return True, None
    else:
        logger.error(f"❌ Failed to send verification email to {to_email}")
        return False, "Unknown email sending failure"

with app.app_context():
    # Create tables in both databases.
    # NOTE: Cross-database foreign keys are intentionally avoided.
    db.create_all()
    db.create_all(bind_key="business")

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    # Supports nested storage: /uploads/{business_id}/...
    return send_from_directory(UPLOAD_FOLDER, filename)

# --- EMAIL OTP VERIFICATION ROUTES ---

# Temporary storage for registration OTPs (Email -> {otp, expires_at})
PENDING_REGISTRATION_OTPS = {}

@app.route('/api/auth/send-otp', methods=['POST'])
def send_registration_otp():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first() or Company.query.filter_by(email=email).first():
        return jsonify({"error": "Account already exists with this email"}), 400
        
    otp = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    PENDING_REGISTRATION_OTPS[email] = {
        'otp': otp,
        'expires_at': expires_at
    }
    
    email_sent, err = _send_email_otp(email, otp)
    if not email_sent:
        return jsonify({"error": "Failed to send OTP email", "details": err}), 500
    return jsonify({"message": "Verification code sent to your email"}), 200

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_registration_otp():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    
    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400
        
    pending = PENDING_REGISTRATION_OTPS.get(email)
    if not pending:
        return jsonify({"error": "No verification pending for this email"}), 400
        
    if datetime.utcnow() > pending['expires_at']:
        del PENDING_REGISTRATION_OTPS[email]
        return jsonify({"error": "Code expired. Please request a new one."}), 400
        
    if code != pending['otp']:
        return jsonify({"error": "Invalid verification code"}), 400
        
    # Mark as verified (we can keep it in memory briefly or just trust the frontend for next step)
    # For a simple flow, we'll just return success.
    # In a production app, we might return a one-time token to authorize the /register call.
    return jsonify({"message": "OTP verified successfully"}), 200

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    existing = User.query.filter_by(email=email).first()
    if existing:
        if password and bcrypt.check_password_hash(existing.password_hash, password):
            token = create_access_token(identity=existing.id)
            user_data = existing.to_dict()
            if existing.profile:
                user_data.update(existing.profile.to_dict())
            return jsonify({"message": "Logged in", "token": token, "user": user_data}), 200
        return jsonify({"error": "Account already exists. Please login with correct password."}), 401
        
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        email=email, 
        password_hash=hashed_pw,
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        email_verified=True,  # Set to True by default
        otp_attempts=0
    )
    # Generate OTP (kept for backend model consistency but not required for flow)
    otp = f"{random.randint(0, 999999):06d}"
    new_user.email_otp = otp
    new_user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    db.session.add(new_user)
    db.session.commit()
    
    # Bypass OTP verification for a simpler flow as requested
    token = create_access_token(identity=str(new_user.id), additional_claims={"role": "user"})
    user_data = new_user.to_dict()
    
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": user_data
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Email verification check removed as requested
        token = create_access_token(identity=str(user.id), additional_claims={"role": "user"})
        # Merge profile data if exists
        user_data = user.to_dict()
        if user.profile:
            user_data.update(user.profile.to_dict())
        return jsonify({"token": token, "user": user_data}), 200
    return jsonify({"error": "Invalid credentials"}), 401

# --- EMAIL OTP VERIFICATION ROUTES ---
@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    if not email or not code or len(code) != 6 or not code.isdigit():
        return jsonify({"error": "Invalid verification request"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Account not found"}), 404
    if getattr(user, 'email_verified', False):
        return jsonify({"message": "Already verified"}), 200
    # Check attempts
    attempts = getattr(user, 'otp_attempts', 0) or 0
    if attempts >= 5:
        return jsonify({"error": "Too many attempts. Please request a new code."}), 429
    # Validate OTP and expiry
    now = datetime.utcnow()
    if not user.email_otp or not user.otp_expires_at or now > user.otp_expires_at:
        return jsonify({"error": "Code expired. Please request a new code."}), 400
    if code != user.email_otp:
        user.otp_attempts = attempts + 1
        db.session.commit()
        return jsonify({"error": "Invalid code"}), 400
    # Success
    user.email_verified = True
    user.email_otp = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    db.session.commit()
    return jsonify({"message": "Email verified successfully"}), 200

@app.route('/api/company/register', methods=['POST'])
def company_register():
    data = request.json
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    company_name = data.get('companyName') or ''
    
    if not email or not password or not company_name:
        return jsonify({"error": "Email, password, and company name are required"}), 400
    
    existing = Company.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Company account already exists"}), 409
        
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_company = Company(
        email=email,
        password_hash=hashed_pw,
        company_name=company_name,
        industry=data.get('industry'),
        location=data.get('location'),
        description=data.get('description', f"Leading provider in {data.get('industry', 'their industry')}")
    )
    
    db.session.add(new_company)
    db.session.flush() # Get ID before commit
    
    # Auto-create BusinessProfile for Marketplace visibility
    marketplace_profile = BusinessProfile(
        company_id=new_company.id,
        business_category=data.get('industry', 'Other'),
        website_url=data.get('website', ''),
        # Optional socials can be added later via update endpoints
    )
    db.session.add(marketplace_profile)
    db.session.commit()
    
    token = create_access_token(identity=str(new_company.id), additional_claims={"role": "company"})
    return jsonify({
        "message": "Company registered successfully",
        "token": token,
        "company": new_company.to_dict()
    }), 201

@app.route('/api/company/login', methods=['POST'])
def company_login():
    data = request.json
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    company = Company.query.filter_by(email=email).first()
    if company and bcrypt.check_password_hash(company.password_hash, password):
        # Use string subject for JWT
        token = create_access_token(identity=str(company.id), additional_claims={"role": "company"})
        return jsonify({
            "token": token, 
            "company": company.to_dict()
        }), 200
        
    return jsonify({"error": "Invalid company credentials"}), 401

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    user = User.query.filter_by(email=email).first()
    company = None
    if not user:
        company = Company.query.filter_by(email=email).first()
    account = user or company
    if not account:
        return jsonify({"message": "If that email is registered, we have sent a verification code."}), 200
    otp = f"{random.randint(0, 999999):06d}"
    account.email_otp = otp
    account.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    account.otp_attempts = 0
    db.session.commit()
    email_sent = _send_email_otp(email, otp)
    payload = {"message": "If that email is registered, we have sent a verification code."}
    if app.debug or not email_sent:
        payload["dev_otp"] = otp
    return jsonify(payload), 200

@app.route('/api/auth/verify-password-otp', methods=['POST'])
def verify_password_otp():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400
    user = User.query.filter_by(email=email).first()
    company = None
    if not user:
        company = Company.query.filter_by(email=email).first()
    account = user or company
    if not account:
        return jsonify({"error": "Invalid request"}), 400
    attempts = getattr(account, 'otp_attempts', 0) or 0
    if attempts >= 5:
        return jsonify({"error": "Too many attempts. Please request a new code."}), 429
    now = datetime.utcnow()
    if not account.email_otp or not account.otp_expires_at or now > account.otp_expires_at:
        return jsonify({"error": "Code expired. Please request a new code."}), 400
    if code != account.email_otp:
        account.otp_attempts = attempts + 1
        db.session.commit()
        return jsonify({"error": "Invalid code"}), 400
    return jsonify({"message": "OTP verified successfully. You may now reset your password."}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()
    new_password = data.get('newPassword') or ''
    if not email or not code or not new_password:
        return jsonify({"error": "Email, code, and new password are required"}), 400
    user = User.query.filter_by(email=email).first()
    company = None
    if not user:
        company = Company.query.filter_by(email=email).first()
    account = user or company
    if not account:
        return jsonify({"error": "Invalid request"}), 400
    now = datetime.utcnow()
    if not account.email_otp or not account.otp_expires_at or now > account.otp_expires_at or code != account.email_otp:
        return jsonify({"error": "Invalid or expired code"}), 400
    hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
    account.password_hash = hashed_pw
    account.email_otp = None
    account.otp_expires_at = None
    account.otp_attempts = 0
    db.session.commit()
    return jsonify({"message": "Password reset successfully. You can now log in."}), 200

# Legacy job routes removed

@app.route('/api/goals', methods=['GET', 'POST'])
def manage_goals():
    user_id = request.args.get('userId')
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
        
    if request.method == 'POST':
        data = request.json
        new_goal = Goal(
            user_id=user_id,
            title=data.get('title'),
            progress=data.get('progress', 0),
            deadline=data.get('deadline'),
            completed=data.get('completed', False)
        )
        db.session.add(new_goal)
        db.session.commit()
        return jsonify({"success": True, "goal": new_goal.to_dict()}), 201
    
    # GET
    goals = Goal.query.filter_by(user_id=user_id).all()
    return jsonify({"goals": [g.to_dict() for g in goals]}), 200

@app.route('/api/goals/<int:goal_id>', methods=['PUT', 'DELETE'])
def update_goal(goal_id):
    user_id = request.args.get('userId')
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    goal = Goal.query.get(goal_id)
    if not goal or goal.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    if request.method == 'DELETE':
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"success": True}), 200
        
    data = request.json
    if 'progress' in data: goal.progress = data['progress']
    if 'completed' in data: goal.completed = data['completed']
    if 'title' in data: goal.title = data['title']
    
    db.session.commit()
    return jsonify({"success": True, "goal": goal.to_dict()}), 200

# Legacy application status route removed

@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Account not found"}), 404
    if getattr(user, 'email_verified', False):
        return jsonify({"message": "Email already verified"}), 200
    # Generate new OTP and expiry
    otp = f"{random.randint(0, 999999):06d}"
    user.email_otp = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.otp_attempts = 0
    db.session.commit()
    email_sent = _send_email_otp(user.email, otp)
    payload = {"message": "A new verification code has been sent"}
    try:
        if app.debug or not email_sent:
            payload["dev_otp"] = otp
    except Exception:
        pass
    return jsonify(payload), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    # Convert string identity back to integer for database query
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 401
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user_data = user.to_dict()
    if user.profile:
        user_data.update(user.profile.to_dict())
    return jsonify({"user": user_data})

@app.route('/api/auth/exists', methods=['GET'])
def auth_exists():
    email = (request.args.get('email') or '').strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    exists = User.query.filter_by(email=email).first() is not None
    return jsonify({"exists": exists}), 200

@app.route('/api/auth/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request payload"}), 400
    
    # Update Basic Info
    if 'firstName' in data: user.first_name = data['firstName']
    if 'lastName' in data: user.last_name = data['lastName']
    if 'email' in data:
        new_email = (data.get('email') or '').strip().lower()
        if not new_email:
            return jsonify({"error": "Email cannot be empty"}), 400
        if new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                return jsonify({"error": "Email already in use"}), 400
            user.email = new_email
    
    # Update Business Profile (Upsert)
    if any(k in data for k in ['businessName', 'websiteUrl', 'businessCategory', 'description', 'linkedinPage', 'instagramProfile']):
        if not user.profile:
            user.profile = BusinessProfile(user_id=user.id)
        
        if 'businessName' in data: user.profile.business_name = data['businessName']
        if 'websiteUrl' in data: user.profile.website_url = data['websiteUrl']
        if 'businessCategory' in data: user.profile.business_category = data['businessCategory']
        if 'description' in data: user.profile.description = data['description']
        if 'linkedinPage' in data: user.profile.linkedin = data['linkedinPage']
        if 'instagramProfile' in data: user.profile.instagram = data['instagramProfile']

    db.session.commit()
    
    # Return full updated object
    user_data = user.to_dict()
    if user.profile:
        user_data.update(user.profile.to_dict())
        
    return jsonify({"message": "Updated successfully", "user": user_data})

@app.route('/api/platform-stats', methods=['GET'])
def platform_stats():
    """
    Platform stats used by Homepage counters.
    Uses the split-db schema (user.db + business.db) and avoids legacy columns.
    """
    try:
        # user.db
        total_users = User.query.count()
        # business.db
        business_count = Company.query.count()

        # A simple real metric based on rows that reflect platform activity.
        # (Can be replaced by dedicated analytics events later.)
        jobs_count = JobListing.query.count()
        apps_count = Application.query.count()
        kb_files_count = AIKnowledgeFile.query.count()
        total_keywords = max(0, (jobs_count * 15) + (apps_count * 5) + (kb_files_count * 25))

        return jsonify({
            "active_users": int(total_users),
            "business_accounts": int(business_count),
            "keywords_tracked": int(total_keywords),
            "uptime": 99.9,
            "support": "24/7",
            "real_time": True,
        })
    except Exception as e:
        logger.error(f"platform_stats error: {e}", exc_info=True)
        return jsonify({
            "active_users": 0,
            "business_accounts": 0,
            "keywords_tracked": 0,
            "uptime": 99.9,
            "support": "24/7",
            "real_time": False,
            "error": "Could not load live stats",
        }), 200

from advanced_analytics_engine import AdvancedAnalyticsEngine
# --- ANALYTICS ROUTES ---
from analytics_engine import answer_query, generate_insights

_bi_engine = None

try:
    from marketing_engine import MarketingEngine
except Exception as e:
    logger.warning(f"Could not import MarketingEngine: {e}")
    MarketingEngine = None  # type: ignore

_marketing_engine = None

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_data():
    # In future, fetch usage stats from DB user.analytics_data
    return jsonify({
        "sales_trend": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "data": [12000, 19000, 3000, 5000, 20000, 30000]
        },
        "seo_performance": {
            "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
            "data": [65, 59, 80, 81]
        },
        "kpis": {
            "total_revenue": "$45,231",
            "active_users": "1,203",
            "conversion_rate": "3.5%"
        }
    })

@app.route('/api/upload-csv', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        try:
            # Basic insights for legacy frontend
            insights = generate_insights(filepath)
            
            # BI analysis for new frontend
            global _bi_engine
            if _bi_engine is None:
                _bi_engine = AdvancedAnalyticsEngine()
            bi_results = _bi_engine.analyze(filepath)
            insights['bi_results'] = bi_results
            
            return jsonify({
                "message": "File processed successfully",
                "filename": file.filename,
                "insights": insights,
                "bi_results": bi_results,
                "pdf_url": f"http://127.0.0.1:5001/uploads/{insights.get('pdf_filename')}" if insights.get('pdf_filename') else None
            })
        except Exception as e:
            logger.error(f"Upload processing error: {e}", exc_info=True)
            return jsonify({"error": str(e)}), 500

@app.route('/api/geo/analyze', methods=['POST'])
def geo_analyze():
    mode = request.form.get('mode', 'competitor')
    business_type = request.form.get('business_type', 'Retail')
    location = request.form.get('location')
    radius = float(request.form.get('radius', 5))
    
    filters = {
        'country': request.form.get('country'),
        'state': request.form.get('state'),
        'city': request.form.get('city'),
        'area': request.form.get('area')
    }
    
    try:
        if mode == 'customer':
            if 'file' not in request.files or request.files['file'].filename == '':
                return jsonify({"error": "No CSV file uploaded for customer analysis"}), 400
            file = request.files['file']
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            
            results = analyze_customers(
                file_path=filepath,
                center_loc_str=location,
                radius_km=radius,
                filters=filters,
                uploads_dir=UPLOAD_FOLDER
            )
        else:
            if not location:
                return jsonify({"error": "Location is required for competitor analysis"}), 400
            results = analyze_competitors(
                center_loc_str=location,
                radius_km=radius,
                business_type=business_type,
                uploads_dir=UPLOAD_FOLDER
            )
            
        host_url = request.host_url.rstrip('/')
        if not host_url.endswith('5001'):
            host_url = "http://127.0.0.1:5001"

        results['map_url'] = f"{host_url}/uploads/{results['map_filename']}"
        
        return jsonify(results)
    except Exception as e:
        logger.error(f"Geo analyzer error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/bi-analyze', methods=['POST'])
def bi_analyze():
    data = request.json
    filename = data.get('filename')
    if not filename:
        return jsonify({"error": "Filename is required"}), 400
        
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
        
    try:
        global _bi_engine
        if _bi_engine is None:
            _bi_engine = AdvancedAnalyticsEngine()
        results = _bi_engine.analyze(filepath)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

VECTOR_DIR = os.path.join(BASE_DIR, "vector_db")
PROJECT_RAG_FILE = os.path.join(BASE_DIR, "rag_data", "project_info.txt")

os.makedirs(VECTOR_DIR, exist_ok=True)
os.makedirs(os.path.dirname(PROJECT_RAG_FILE), exist_ok=True)

@app.route('/api/knowledge/upload', methods=['POST'])
@jwt_required()
def knowledge_upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    if additional_claims.get("role") != "company":
        return jsonify({"error": "Only businesses can use the knowledge bucket"}), 403
    business_id = str(identity)
    
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    allowed_ext = {".pdf", ".csv", ".xlsx", ".xls", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_ext:
        return jsonify({"error": "Unsupported file type. Allowed: PDF, CSV, XLSX, XLS, TXT"}), 400
        
    business_upload_dir = os.path.join(UPLOAD_FOLDER, business_id)
    os.makedirs(business_upload_dir, exist_ok=True)

    safe_name = re.sub(r"[^A-Za-z0-9_.-]", "_", file.filename)
    file_path = os.path.join(business_upload_dir, safe_name)
    file.save(file_path)
    
    try:
        success, result = process_and_store_file(file_path, file.filename, business_id, VECTOR_DIR)
        if success:
            # Store metadata only in business.db
            try:
                db.session.add(
                    AIKnowledgeFile(
                        business_id=int(business_id),
                        file_id=result.get("file_id"),
                        original_filename=file.filename,
                        storage_path=file_path.replace("\\", "/"),
                    )
                )
                db.session.commit()
            except Exception as db_err:
                logger.error(f"Knowledge file DB save error (file still indexed in vector_db): {db_err}", exc_info=True)
                db.session.rollback()
            return jsonify({"message": "File processed and added to your knowledge bucket", "data": result}), 200
        else:
            return jsonify({"error": result}), 400
    except Exception as e:
        logger.error(f"Knowledge upload error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/knowledge/files', methods=['GET'])
@jwt_required()
def list_knowledge_files():
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    if additional_claims.get("role") != "company":
        return jsonify({"error": "Only businesses can use the knowledge bucket"}), 403
    business_id = str(identity)
    try:
        rows = (
            AIKnowledgeFile.query.filter_by(business_id=int(business_id))
            .order_by(AIKnowledgeFile.created_at.desc())
            .all()
        )

        # If DB is empty, check vector_db for any files uploaded before DB table existed
        # and sync them back into DB so future queries work
        if not rows:
            from knowledge_bucket import get_user_files as _get_vdb_files
            vdb_files = _get_vdb_files(business_id, VECTOR_DIR)
            for vf in vdb_files:
                fid = vf.get("file_id")
                fname = vf.get("filename", "unknown")
                if not fid:
                    continue
                existing = AIKnowledgeFile.query.filter_by(file_id=fid).first()
                if not existing:
                    try:
                        db.session.add(AIKnowledgeFile(
                            business_id=int(business_id),
                            file_id=fid,
                            original_filename=fname,
                            storage_path=os.path.join(UPLOAD_FOLDER, business_id, fname).replace("\\", "/"),
                        ))
                        db.session.commit()
                    except Exception as sync_err:
                        logger.warning(f"KB sync insert failed: {sync_err}")
                        db.session.rollback()
            # Re-query after sync
            rows = (
                AIKnowledgeFile.query.filter_by(business_id=int(business_id))
                .order_by(AIKnowledgeFile.created_at.desc())
                .all()
            )

        files = [row.to_dict() for row in rows]
        return jsonify({"files": files}), 200
    except Exception as e:
        logger.error(f"list_knowledge_files error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/knowledge/files/<file_id>', methods=['DELETE'])
@jwt_required()
def delete_knowledge_file(file_id):
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    if additional_claims.get("role") != "company":
        return jsonify({"error": "Only businesses can use the knowledge bucket"}), 403
    business_id = str(identity)
    try:
        db_row = AIKnowledgeFile.query.filter_by(file_id=file_id, business_id=int(business_id)).first()
        vector_deleted = delete_user_file(business_id, file_id, VECTOR_DIR)
        if db_row:
            try:
                if db_row.storage_path and os.path.exists(db_row.storage_path):
                    os.remove(db_row.storage_path)
            except Exception:
                pass
            AIKnowledgeFile.query.filter_by(file_id=file_id, business_id=int(business_id)).delete()
            db.session.commit()
            return jsonify({"message": "File removed from knowledge bucket."}), 200
        if vector_deleted:
            return jsonify({"message": "File removed from knowledge bucket."}), 200
        return jsonify({"error": "File not found or could not be deleted"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/knowledge/ask', methods=['POST'])
@jwt_required()
def ask_knowledge():
    data = request.json
    query = data.get('query')
    answer_type = data.get('answer_type', 'detailed')  # short, long, or detailed
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
        
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    if additional_claims.get("role") != "company":
        return jsonify({"error": "Only businesses can use the knowledge bucket"}), 403
    business_id = str(identity)
    try:
        if not is_gemini_configured():
            return jsonify({
                "error": "Gemini API key is not configured on the backend. Set GEMINI_API_KEY in seo/backend/.env and restart the backend."
            }), 503
        
        # Use advanced RAG query for rich response
        result = ask_rag_query_advanced(business_id, query, VECTOR_DIR, answer_type)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Knowledge ask error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/platform_bot/ask", methods=["POST"])
def platform_bot_ask():
    data = request.json or {}
    query = (data.get("query") or "").strip()
    answer_type = data.get("answer_type", "short")  # short or detailed
    if not query:
        return jsonify({"error": "Query is required"}), 400
    try:
        result = ask_project_rag_query_advanced(query, VECTOR_DIR, PROJECT_RAG_FILE, answer_type)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Platform bot error: {e}", exc_info=True)
        return jsonify({"error": f"Platform assistant unavailable: {e}"}), 500

@app.route('/api/analytics/export', methods=['POST'])
def export_data():
    data = request.json
    filename = data.get('filename')
    format = data.get('format', 'csv')
    
    if not filename:
        return jsonify({"error": "Filename is required"}), 400
        
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
        
    try:
        if format == 'csv':
            return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
        # For simplicity, we just return the CSV for now. 
        # PDF export is already handled by generate_insights usually.
        return jsonify({"error": "Format not supported"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/marketing/analyze', methods=['POST'])
def marketing_analyze():
    data = request.json
    # usage tracking disabled for final run stability
    topic = data.get('topic', 'SEO Services') if data else 'SEO Services'
    audience = data.get('audience', 'Small Business Owners') if data else 'Small Business Owners'
    budget = float(data.get('budget', 1000)) if data and data.get('budget') else 1000.0
    url = data.get('url', '')
    
    try:
        if MarketingEngine is None:
            return jsonify({"error": "Marketing engine is unavailable on this server"}), 503
        global _marketing_engine
        if _marketing_engine is None:
            _marketing_engine = MarketingEngine()
        results = _marketing_engine.analyze_campaign(topic, audience, budget, url)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/marketing/generate-copy', methods=['POST'])
def marketing_generate_copy():
    data = request.json
    topic = data.get('topic')
    audience = data.get('audience')
    platform = data.get('platform', 'Google Ads')
    goal = data.get('goal', 'Conversion')
    
    try:
        if MarketingEngine is None:
            return jsonify({"error": "Marketing engine is unavailable on this server"}), 503
        global _marketing_engine
        if _marketing_engine is None:
            _marketing_engine = MarketingEngine()
        variants = _marketing_engine.generate_ad_copy(topic, audience, platform, goal)
        return jsonify({"variants": variants})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/marketing/ab-test', methods=['POST'])
def marketing_ab_test():
    data = request.json
    variants = data.get('variants', [])
    
    try:
        if MarketingEngine is None:
            return jsonify({"error": "Marketing engine is unavailable on this server"}), 503
        global _marketing_engine
        if _marketing_engine is None:
            _marketing_engine = MarketingEngine()
        test_results = _marketing_engine.simulate_ab_test(variants)
        return jsonify(test_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ask-data', methods=['POST'])
def ask_data():
    data = request.json
    query = data.get('query')
    filename = data.get('filename')
    
    if not query or not filename:
        return jsonify({"error": "Missing query or filename"}), 400
        
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
        
    try:
        answer = answer_query(filepath, query)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from advanced_seo_analyzer import AdvancedSEOAnalyzer
from backlink_checker import BacklinkChecker
from keyword_research import KeywordResearch
from meta_generator import MetaGenerator
# --- SEO TOOL ROUTES ---
from seo_analyzer import SEOAnalyzer

# --- AD INSIGHTS ROUTES ---
try:
    from ad_insights_fetcher import AdInsightsFetcher
except (ImportError, Exception) as e:
    logger.warning(f"Could not import AdInsightsFetcher: {e}")
    AdInsightsFetcher = None

# --- SOCIAL MEDIA ANALYTICS ROUTES ---
try:
    from social_media_scraper import SocialMediaAnalytics
except (ImportError, Exception) as e:
    logger.warning(f"Could not import SocialMediaAnalytics: {e}")
    SocialMediaAnalytics = None

@app.route('/api/seo/analyze', methods=['POST'])
def analyze_seo():
    data = request.json
    url = data.get('url')
    advanced = data.get('advanced', False)  # Flag for advanced analysis
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    # Basic URL validation
    url = url.strip()
    if not url:
        return jsonify({"error": "URL cannot be empty"}), 400
    
    try:
        if advanced:
            # Use advanced analyzer for comprehensive audit
            analyzer = AdvancedSEOAnalyzer(url)
        else:
            # Use basic analyzer for quick analysis
            analyzer = SEOAnalyzer(url)
        
        # Run analysis
        report = analyzer.analyze()
        
        # Check if analysis had errors
        if 'error' in report and report['error']:
            return jsonify(report), 400
        
        # Generate PDF (don't fail if PDF generation fails)
        try:
            pdf_filename = f"seo_report_{analyzer.domain.replace(':', '_').replace('/', '_')}_{int(time.time())}.pdf"
            pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
            if analyzer.generate_pdf(pdf_path):
                report['pdf_url'] = f"http://127.0.0.1:5001/uploads/{pdf_filename}"
            else:
                logger.warning("PDF generation failed, but continuing with report")
        except Exception as pdf_error:
            logger.error(f"PDF generation error: {pdf_error}")
            # Continue without PDF - don't fail the entire request
        
        return jsonify(report)
    except Exception as e:
        logger.error(f"SEO analysis error: {e}", exc_info=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/seo/keywords', methods=['POST'])
def keyword_research():
    """Keyword research endpoint"""
    data = request.json
    seed_keyword = data.get('keyword')
    url = data.get('url')
    
    if not seed_keyword:
        return jsonify({"error": "Keyword is required"}), 400
    
    try:
        kw_research = KeywordResearch(url)
        suggestions = kw_research.suggest_keywords(seed_keyword, max_results=20)
        
        return jsonify({
            "keyword": seed_keyword,
            "suggestions": suggestions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/seo/meta-generate', methods=['POST'])
def generate_meta():
    """Generate meta tags endpoint"""
    data = request.json
    title = data.get('title')
    description = data.get('description')
    url = data.get('url')
    image_url = data.get('image_url')
    keywords = data.get('keywords')
    
    if not title or not description or not url:
        return jsonify({"error": "Title, description, and URL are required"}), 400
    
    try:
        meta_gen = MetaGenerator()
        meta_tags = meta_gen.generate_meta_tags(title, description, url, image_url, keywords)

        html_tags = meta_gen.generate_html_meta_tags(meta_tags)
        
        return jsonify({
            "meta_tags": meta_tags,
            "html": html_tags
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/seo/backlinks', methods=['POST'])
def check_backlinks():
    """Backlink checker endpoint"""
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        backlink_checker = BacklinkChecker(url)
        backlink_data = backlink_checker.check_backlinks()
        link_profile = backlink_checker.analyze_link_profile(backlink_data)
        
        return jsonify({
            "backlinks": backlink_data,
            "link_profile": link_profile
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- SOCIAL MEDIA ROUTES ---
from social_analyzer import SocialAnalyzer

_social_analyzer_service = None

@app.route('/api/social/insights', methods=['POST'])
def social_insights():
    data = request.json
    url = data.get('url', '')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
        
    try:
        global _social_analyzer_service
        if _social_analyzer_service is None:
            _social_analyzer_service = SocialAnalyzer()
        report = _social_analyzer_service.analyze(url)
        if "error" in report:
            return jsonify(report), 400
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


from advanced_content_engine import AdvancedContentGenerator
# --- CONTENT ENGINE ROUTES ---
from content_engine import ContentGenerator

_content_engine_service = None
_advanced_content_service = None

@app.route('/api/content/generate', methods=['POST'])
def generate_ai_content():
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        result = _advanced_content_service.generate(
            topic=data.get('topic'),
            content_type=data.get('type', 'blog'),
            tone=data.get('tone', 'professional'),
            audience=data.get('audience', 'general'),
            language=data.get('language', 'English')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/improve', methods=['POST'])
def improve_content():
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        result = _advanced_content_service.rewrite(
            text=data.get('text'),
            topic=data.get('topic'),
            improvement_type=data.get('type', 'seo')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/score', methods=['POST'])
def score_content():
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        result = _advanced_content_service.calculate_seo_score(
            text=data.get('text'),
            target_keyword=data.get('topic')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/headlines', methods=['POST'])
def generate_headlines():
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        result = _advanced_content_service.generate_headlines(
            topic=data.get('topic'),
            audience=data.get('audience', 'general')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/blog', methods=['POST'])
def generate_blog():
    # Backward compatibility: mapping to advanced engine
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        result = _advanced_content_service.generate(
            topic=data.get('topic'),
            content_type='blog',
            tone=data.get('tone', 'professional')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/social', methods=['POST'])
def generate_social():
    data = request.json
    try:
        # Legacy response structure
        global _content_engine_service
        if _content_engine_service is None:
            _content_engine_service = ContentGenerator()
        posts = _content_engine_service.generate_social_posts(
            data.get('platform', 'twitter'),
            data.get('topic')
        )
        return jsonify({"posts": posts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/video-ideas', methods=['POST'])
def generate_video_ideas():
    data = request.json
    try:
        global _content_engine_service
        if _content_engine_service is None:
            _content_engine_service = ContentGenerator()
        ideas = _content_engine_service.generate_video_ideas(data.get('niche'))
        return jsonify({"ideas": ideas})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/keywords', methods=['POST'])
def suggest_keywords():
    data = request.json
    try:
        global _content_engine_service
        if _content_engine_service is None:
            _content_engine_service = ContentGenerator()
        suggestions = _content_engine_service.suggest_keywords(data.get('seed'))
        return jsonify({"keywords": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/content/analyze-seo', methods=['POST'])
def analyze_content_seo():
    data = request.json
    try:
        global _advanced_content_service
        if _advanced_content_service is None:
            _advanced_content_service = AdvancedContentGenerator()
        analysis = _advanced_content_service.calculate_seo_score(
            data.get('text'),
            data.get('topic', 'keyword')
        )
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- AD INSIGHTS ROUTES ---

@app.route('/api/ad-insights', methods=['POST'])
def get_ad_insights():
    """Get public ad campaign insights for a website URL"""
    if AdInsightsFetcher is None:
        return jsonify({"error": "Ad insights module not available"}), 503
    
    data = request.json
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    # Basic URL validation
    url = url.strip()
    if not url:
        return jsonify({"error": "URL cannot be empty"}), 400
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        fetcher = AdInsightsFetcher(url)
        insights = fetcher.fetch_all_insights()
        
        # Always return 200 with insights, even if there are errors (they're in the response)
        return jsonify(insights), 200
        
    except Exception as e:
        logger.error(f"Ad insights error: {e}", exc_info=True)
        import traceback
        error_details = traceback.format_exc() if app.debug else None
        return jsonify({
            "error": f"Failed to fetch ad insights: {str(e)}",
            "details": error_details,
            "url": url if 'url' in locals() else None,
            "total_ads": 0,
            "platforms": {},
            "ads": [],
            "summary": {
                "total_ads": 0,
                "active_ads": 0,
                "inactive_ads": 0,
                "platforms": [],
                "date_range": {}
            }
        }), 200  # Return 200 so frontend can handle the error gracefully

@app.route('/api/analyze-ads', methods=['POST'])
def analyze_ads():
    """Legacy endpoint for ad analysis (compatibility)"""
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        # Basic ad analysis (ads.txt, ad tags, etc.)
        import requests
        from bs4 import BeautifulSoup
        
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Check for ads.txt
        ads_txt_url = urljoin(url, '/ads.txt')
        ads_txt_response = requests.get(ads_txt_url, headers=headers, timeout=5)
        ads_txt = ads_txt_response.text if ads_txt_response.status_code == 200 else None
        
        # Find ad scripts
        ad_scripts = []
        scripts = soup.find_all('script', src=True)
        for script in scripts:
            src = script.get('src', '')
            if any(network in src.lower() for network in ['google', 'adsense', 'doubleclick', 'advertising', 'ad']):
                ad_scripts.append(src)
        
        # Find ad tags
        ad_tags = []
        ad_divs = soup.find_all(['div', 'ins'], class_=re.compile(r'ad|advertisement|banner', re.I))
        for div in ad_divs[:10]:
            ad_tags.append({
                'selector': f"{div.name}.{div.get('class', [])[0] if div.get('class') else ''}",
                'html': str(div)[:200]
            })
        
        result = {
            'url': url,
            'httpStatus': response.status_code,
            'adsTxt': ads_txt,
            'adsTxtInfo': {
                'status': 'Valid' if ads_txt else 'Missing',
                'errors': [],
                'warnings': []
            },
            'adScripts': ad_scripts[:20],
            'adTags': ad_tags,
            'networksFound': list(set([s.split('/')[2] for s in ad_scripts if s.startswith('http')]))[:10],
            'healthScore': 75 if ads_txt else 50,
            'issues': [] if ads_txt else ['ads.txt file not found'],
            'suggestions': ['Consider adding ads.txt file for better monetization'] if not ads_txt else []
        }
        
        return jsonify(result)
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during ad analysis: {e}", exc_info=True)
        return jsonify({
            "error": f"Failed to fetch website: {str(e)}",
            "url": url if 'url' in locals() else None,
            "httpStatus": None,
            "adsTxt": None,
            "adsTxtInfo": {"status": "Error", "errors": [str(e)], "warnings": []},
            "adScripts": [],
            "adTags": [],
            "networksFound": [],
            "healthScore": 0,
            "issues": [f"Network error: {str(e)}"],
            "suggestions": ["Check if the URL is accessible", "Verify your internet connection"]
        }), 200
    except Exception as e:
        logger.error(f"Ad analysis error: {e}", exc_info=True)
        import traceback
        return jsonify({
            "error": f"Analysis failed: {str(e)}",
            "details": traceback.format_exc() if app.debug else None,
            "url": url if 'url' in locals() else None,
            "httpStatus": None,
            "adsTxt": None,
            "adsTxtInfo": {"status": "Error", "errors": [str(e)], "warnings": []},
            "adScripts": [],
            "adTags": [],
            "networksFound": [],
            "healthScore": 0,
            "issues": [str(e)],
            "suggestions": []
        }), 200

# --- SOCIAL MEDIA ANALYTICS ROUTES ---

@app.route('/api/social-media/analyze', methods=['POST'])
def analyze_social_media():
    """Analyze social media profiles (Instagram, Facebook, YouTube)"""
    if SocialMediaAnalytics is None:
        return jsonify({"error": "Social media analytics module not available"}), 503
    
    # Optional API key protection: if SOCIAL_API_KEY is set, require X-API-Key header to match
    configured_key = app.config.get('SOCIAL_API_KEY')
    if configured_key:
        client_key = request.headers.get('X-API-Key')
        if not client_key or client_key != configured_key:
            return jsonify({"error": "Unauthorized: invalid API key"}), 401

    try:
        data = request.json
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        # Accept either URL or platform+identifier
        url = data.get('url', '').strip()
        platform = data.get('platform', '').lower()
        identifier = data.get('identifier', '').strip()
        
        # If URL is provided, extract platform and identifier
        if url:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            if 'instagram.com' in domain:
                platform = 'instagram'
                # Extract username from URL (e.g., instagram.com/username/)
                path_parts = [p for p in parsed.path.split('/') if p]
                identifier = path_parts[0] if path_parts else ''
            elif 'facebook.com' in domain:
                platform = 'facebook'
                # Extract page name from URL (e.g., facebook.com/pagename)
                path_parts = [p for p in parsed.path.split('/') if p]
                identifier = path_parts[0] if path_parts else ''
            elif 'youtube.com' in domain or 'youtu.be' in domain:
                platform = 'youtube'
                # Extract channel ID or username
                path_parts = [p for p in parsed.path.split('/') if p]
                if 'channel' in path_parts:
                    idx = path_parts.index('channel')
                    identifier = path_parts[idx + 1] if idx + 1 < len(path_parts) else ''
                elif 'c' in path_parts:
                    idx = path_parts.index('c')
                    identifier = path_parts[idx + 1] if idx + 1 < len(path_parts) else ''
                elif 'user' in path_parts:
                    idx = path_parts.index('user')
                    identifier = path_parts[idx + 1] if idx + 1 < len(path_parts) else ''
                elif path_parts:
                    # Could be @username format
                    identifier = path_parts[0].replace('@', '')
                else:
                    identifier = ''
            else:
                return jsonify({"error": "Unsupported platform URL. Please use Instagram, Facebook, or YouTube URLs."}), 400
        
        if not platform or not identifier:
            return jsonify({"error": "Platform and identifier are required. Provide either a URL or platform+identifier."}), 400
        
        result = {}
        
        if platform == 'instagram':
            result = SocialMediaAnalytics.analyze_instagram(identifier)
        elif platform == 'facebook':
            result = SocialMediaAnalytics.analyze_facebook(identifier)
        elif platform == 'youtube':
            yt_api_key = request.headers.get('X-YT-API-Key')
            result = SocialMediaAnalytics.analyze_youtube(identifier, api_key=yt_api_key)
        else:
            return jsonify({"error": f"Unsupported platform: {platform}"}), 400
        
        # Calculate engagement metrics
        engagement = SocialMediaAnalytics.calculate_engagement(result)
        result['engagement'] = engagement
        
        # Add audience data for frontend display
        if 'audience' not in result:
            platform_lower = platform.lower()
            if platform_lower == 'instagram':
                result['audience'] = {
                    'age_distribution': {'18-24': 30, '25-34': 45, '35-44': 15, '45+': 10},
                    'gender_split': {'Male': 40, 'Female': 60},
                    'top_countries': ['USA', 'Canada', 'UK']
                }
            elif platform_lower == 'facebook':
                result['audience'] = {
                    'age_distribution': {'18-24': 20, '25-34': 40, '35-44': 25, '45+': 15},
                    'gender_split': {'Male': 55, 'Female': 45},
                    'top_countries': ['USA', 'India', 'Brazil']
                }
            elif platform_lower == 'youtube':
                result['audience'] = {
                    'age_distribution': {'18-24': 25, '25-34': 35, '35-44': 20, '45+': 20},
                    'gender_split': {'Male': 60, 'Female': 40},
                    'top_countries': ['USA', 'Germany', 'UK']
                }
        
        # Add success flag and ensure platform is set
        result['success'] = True
        if 'error' not in result or not result.get('error'):
            result['success'] = True
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Social media analysis error: {e}", exc_info=True)
        import traceback
        return jsonify({
            "success": False,
            "error": f"Failed to analyze social media profile: {str(e)}",
            "details": traceback.format_exc() if app.debug else None
        }), 200  # Return 200 so frontend can handle gracefully

@app.route('/api/social-media/batch-analyze', methods=['POST'])
def batch_analyze_social_media():
    """Analyze multiple social media profiles at once"""
    if SocialMediaAnalytics is None:
        return jsonify({"error": "Social media analytics module not available"}), 503
    
    # Optional API key protection: if SOCIAL_API_KEY is set, require X-API-Key header to match
    configured_key = app.config.get('SOCIAL_API_KEY')
    if configured_key:
        client_key = request.headers.get('X-API-Key')
        if not client_key or client_key != configured_key:
            return jsonify({"error": "Unauthorized: invalid API key"}), 401

    try:
        data = request.json
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        profiles = data.get('profiles', [])
        if not profiles:
            return jsonify({"error": "Profiles list is required"}), 400
        
        results = []
        
        for profile in profiles:
            platform = profile.get('platform', '').lower()
            identifier = profile.get('identifier', '').strip()
            
            if not platform or not identifier:
                continue
            
            try:
                if platform == 'instagram':
                    result = SocialMediaAnalytics.analyze_instagram(identifier)
                elif platform == 'facebook':
                    result = SocialMediaAnalytics.analyze_facebook(identifier)
                elif platform == 'youtube':
                    result = SocialMediaAnalytics.analyze_youtube(identifier)
                else:
                    result = {"error": f"Unsupported platform: {platform}"}
                
                # Calculate engagement
                if 'error' not in result:
                    engagement = SocialMediaAnalytics.calculate_engagement(result)
                    result['engagement'] = engagement
                
                results.append(result)
            except Exception as e:
                logger.error(f"Error analyzing {platform}/{identifier}: {e}")
                results.append({
                    "platform": platform,
                    "identifier": identifier,
                    "error": str(e)
                })
        
        return jsonify({"results": results}), 200
        
    except Exception as e:
        logger.error(f"Batch analysis error: {e}", exc_info=True)
        return jsonify({"error": f"Failed to analyze profiles: {str(e)}"}), 201

@app.route('/api/company/me', methods=['GET'])
@jwt_required()
def get_company_me():
    """Get current company information"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        # Check if this is a company account
        if additional_claims.get('role') != 'company':
            return jsonify({"error": "Not a company account"}), 403
        
        # Identity should be a string company ID
        company_id = int(identity)
        
        company = Company.query.get(company_id)
        if not company:
            return jsonify({"error": "Company not found"}), 404
        
        return jsonify({
            "company": company.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching company info: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# --- COMPANY DASHBOARD ROUTES ---

@app.route('/api/company/update', methods=['PUT'])
@jwt_required()
def update_company():
    """Update company profile"""
    identity = get_jwt_identity()
    
    if not str(identity).startswith('c_'):
        return jsonify({"error": "Not a company account"}), 403
    
    company_id = int(str(identity).replace('c_', ''))
    company = Company.query.get(company_id)
    
    if not company:
        return jsonify({"error": "Company not found"}), 404
    
    data = request.json
    
    try:
        if 'companyName' in data: company.company_name = data['companyName']
        if 'description' in data: company.description = data['description']
        if 'website' in data: company.website = data['website']
        if 'industry' in data: company.industry = data['industry']
        if 'location' in data: company.location = data['location']
        
        db.session.commit()
        return jsonify({"message": "Company updated successfully", "company": company.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating company: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


# --- JOB LISTING ROUTES ---

@app.route('/api/jobs/company', methods=['GET'])
@jwt_required()
def get_company_jobs():
    """Get all job listings for the current company"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        # Check if this is a company account
        if additional_claims.get('role') != 'company':
            return jsonify({"error": "Not a company account"}), 403
        
        # Identity should be a string company ID
        company_id = int(identity)
        
        # Get all jobs posted by this company
        jobs = JobListing.query.filter_by(company_id=company_id).all()
        
        return jsonify({
            "success": True,
            "data": [job.to_dict() for job in jobs]
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching company jobs: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """Get all active job listings (public)"""
    try:
        # Query parameters for filtering
        company_id = request.args.get('company_id')
        location = request.args.get('location')
        job_type = request.args.get('job_type')
        status = request.args.get('status', 'active')
        
        query = JobListing.query
        
        if company_id:
            query = query.filter_by(company_id=int(company_id))
        if location:
            query = query.filter(JobListing.location.ilike(f'%{location}%'))
        if job_type:
            query = query.filter_by(job_type=job_type)
        if status:
            query = query.filter_by(status=status)
        
        jobs = query.order_by(JobListing.created_at.desc()).all()
        return jsonify({"jobs": [job.to_dict() for job in jobs]}), 200
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    """Create a new job listing (company only)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    
    # Verify this is a company account
    if additional_claims.get('role') != 'company':
        return jsonify({"error": "Only companies can create job listings"}), 403
    
    company_id = int(identity)
    data = request.json
    
    # Validate required fields
    if not data.get('title') or not data.get('description'):
        return jsonify({"error": "Title and description are required"}), 400
    
    try:
        new_job = JobListing(
            company_id=company_id,
            title=data['title'],
            description=data['description'],
            requirements=data.get('requirements'),
            location=data.get('location'),
            job_type=data.get('job_type'),  # Use correct field name
            salary_range=data.get('salary_range'),  # Use correct field name
            status='active'
        )
        
        db.session.add(new_job)
        db.session.commit()
        
        return jsonify({"message": "Job created", "job": new_job.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating job: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Get specific job listing details"""
    job = JobListing.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"job": job.to_dict()}), 200

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    """Update job listing (company only, must own the listing)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    
    # Determine company_id and validate role or entity existence
    try:
        company_id = int(identity)
    except Exception:
        return jsonify({"error": "Invalid company identity"}), 401

    if additional_claims.get('role') != 'company':
        # Fallback: allow if identity maps to an existing Company (legacy tokens)
        try:
            from database.models import Company
            if Company.query.get(company_id) is None:
                return jsonify({"error": "Only companies can update job listings"}), 403
        except Exception:
            return jsonify({"error": "Only companies can update job listings"}), 403
    job = JobListing.query.get(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    if job.company_id != company_id:
        return jsonify({"error": "You can only update your own job listings"}), 403
    
    data = request.json
    
    try:
        if 'title' in data: job.title = data['title']
        if 'description' in data: job.description = data['description']
        if 'requirements' in data: job.requirements = data['requirements']
        if 'location' in data: job.location = data['location']
        if 'jobType' in data: job.job_type = data['jobType']
        if 'salaryRange' in data: job.salary_range = data['salaryRange']
        if 'status' in data: job.status = data['status']
        
        db.session.commit()
        return jsonify({"message": "Job updated", "job": job.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating job: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    """Delete job listing (company only, must own the listing)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    
    # Determine company_id and validate role or entity existence
    try:
        company_id = int(identity)
    except Exception:
        return jsonify({"error": "Invalid company identity"}), 401

    if additional_claims.get('role') != 'company':
        # Fallback: allow if identity maps to an existing Company (legacy tokens)
        try:
            from database.models import Company
            if Company.query.get(company_id) is None:
                return jsonify({"error": "Only companies can delete job listings"}), 403
        except Exception:
            return jsonify({"error": "Only companies can delete job listings"}), 403
    job = JobListing.query.get(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    if job.company_id != company_id:
        return jsonify({"error": "You can only delete your own job listings"}), 403
    
    try:
        db.session.delete(job)
        db.session.commit()
        return jsonify({"message": "Job deleted"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting job: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# --- APPLICATION ROUTES ---

@app.route('/api/applications', methods=['POST'])
@jwt_required()
def create_application():
    """Submit a job application (user only)"""
    identity = get_jwt_identity()
    
    # Verify this is a user account (not company)
    if str(identity).startswith('c_'):
        return jsonify({"error": "Companies cannot apply for jobs"}), 403
    
    user_id = int(identity)
    
    # Support both JSON and multipart form submissions
    cover_letter = None
    resume_url = None
    job_id = None
    
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Parse multipart form data
        job_id = request.form.get('jobId', type=int)
        cover_letter = request.form.get('coverLetter')
        resume_file = request.files.get('resume')
        
        # Save resume if provided (store under /uploads/{business_id}/)
        if resume_file and getattr(resume_file, 'filename', ''):
            filename = resume_file.filename
            # Ensure unique filename
            timestamp = int(time.time())
            safe_name = re.sub(r'[^A-Za-z0-9_.-]', '_', filename)
            saved_name = f"resume_{user_id}_{timestamp}_{safe_name}"
            business_id = int(JobListing.query.get(job_id).company_id) if job_id else None
            business_dir = os.path.join(UPLOAD_FOLDER, str(business_id or "unknown"))
            os.makedirs(business_dir, exist_ok=True)
            filepath = os.path.join(business_dir, saved_name)
            resume_file.save(filepath)
            resume_url = f"/uploads/{business_id}/{saved_name}" if business_id else f"/uploads/{saved_name}"
    else:
        # JSON payload fallback
        data = request.get_json(silent=True) or {}
        job_id = data.get('jobId')
        cover_letter = data.get('coverLetter')
        resume_url = data.get('resumeUrl')
        
        # Handle resume sent as base64 data in JSON
        resume_data = data.get('resume')
        if resume_data and isinstance(resume_data, dict) and resume_data.get('data'):
            # Save base64 resume as file
            import base64
            try:
                # Decode base64 data
                file_data = base64.b64decode(resume_data['data'])
                filename = resume_data.get('name', 'resume.pdf')
                
                # Ensure unique filename
                timestamp = int(time.time())
                safe_name = re.sub(r'[^A-Za-z0-9_.-]', '_', filename)
                saved_name = f"resume_{user_id}_{timestamp}_{safe_name}"
                business_id = int(JobListing.query.get(job_id).company_id) if job_id else None
                business_dir = os.path.join(UPLOAD_FOLDER, str(business_id or "unknown"))
                os.makedirs(business_dir, exist_ok=True)
                filepath = os.path.join(business_dir, saved_name)
                
                # Save file
                with open(filepath, 'wb') as f:
                    f.write(file_data)
                
                resume_url = f"/uploads/{business_id}/{saved_name}" if business_id else f"/uploads/{saved_name}"
            except Exception as e:
                logger.error(f"Error saving resume from base64: {e}", exc_info=True)
                # Continue without resume if there's an error
    
    if not job_id:
        return jsonify({"error": "Job ID is required"}), 400
    
    # Check if job exists
    job = JobListing.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    if job.status != 'active':
        return jsonify({"error": "This job is no longer accepting applications"}), 400
    
    # Check if user already applied (user.db)
    existing = UserJobApplication.query.filter_by(job_id=job_id, user_id=user_id, business_id=job.company_id).first()
    if existing:
        return jsonify({"error": "You have already applied for this job"}), 409
    
    try:
        application_uuid = str(uuid.uuid4())

        applicant = User.query.get(user_id)
        applicant_name = None
        applicant_email = None
        if applicant:
            applicant_email = applicant.email
            applicant_name = f"{(applicant.first_name or '').strip()} {(applicant.last_name or '').strip()}".strip() or None

        # business.db record (recruitment-side)
        business_app = RecruitmentApplication(
            application_uuid=application_uuid,
            company_id=job.company_id,
            job_id=job_id,
            applicant_user_id=user_id,
            applicant_name=applicant_name,
            applicant_email=applicant_email,
            cover_letter=cover_letter,
            resume_path=resume_url,
            status="pending",
        )

        # user.db record (user-side tracking)
        user_app = UserJobApplication(
            application_uuid=application_uuid,
            user_id=user_id,
            business_id=job.company_id,
            job_id=job_id,
            cover_letter=cover_letter,
            resume_path=resume_url,
            status="pending",
        )

        db.session.add(business_app)
        db.session.add(user_app)
        db.session.commit()

        return jsonify(
            {
                "message": "Application submitted",
                "application": {
                    **user_app.to_dict(),
                    "job": {"id": job.id, "title": job.title},
                },
            }
        ), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating application: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/user', methods=['GET'])
@jwt_required()
def get_user_applications():
    """Get all applications for current user"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        # Check if this is a user account (not company)
        if additional_claims.get('role') == 'company':
            return jsonify({"error": "Companies cannot access user applications endpoint"}), 403
        
        # Identity should be a string user ID
        user_id = int(identity)
        
        applications = (
            UserJobApplication.query.filter_by(user_id=user_id)
            .order_by(UserJobApplication.applied_at.desc())
            .all()
        )
        
        result = []
        for app in applications:
            item = {**app.to_dict()}
            # Job info
            if app.job_id:
                job_rec = JobListing.query.get(app.job_id)
                item["job"] = {"id": app.job_id, "title": job_rec.title if job_rec else None}
            else:
                item["job"] = None

            # Try to fetch company-side messages from business DB via application_uuid
            try:
                business_app = RecruitmentApplication.query.filter_by(application_uuid=app.application_uuid).first()
                if business_app:
                    item["messages"] = [m.to_dict() for m in getattr(business_app, 'messages', [])]
                else:
                    item["messages"] = []
            except Exception as me:
                logger.error(f"Error fetching business messages for application uuid {app.application_uuid}: {me}")
                item["messages"] = []

            result.append(item)

        return jsonify({"success": True, "data": result}), 200
        
    except Exception as e:
        logger.error(f"Error fetching user applications: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/company', methods=['GET'])
@jwt_required()
def get_company_applications():
    """Get all applications for company's job listings"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        # Check if this is a company account
        if additional_claims.get('role') != 'company':
            return jsonify({"error": "Not a company account"}), 403
        
        # Identity should be a string company ID
        company_id = int(identity)
        
        applications = (
            RecruitmentApplication.query.join(JobListing, RecruitmentApplication.job_id == JobListing.id)
            .filter(JobListing.company_id == company_id)
            .order_by(RecruitmentApplication.applied_at.desc())
            .all()
        )
        
        return jsonify({
            "applications": [app.to_dict() for app in applications],
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching company applications: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<int:app_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    """Update application status (company only)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()

    if additional_claims.get("role") != "company":
        return jsonify({"error": "Only companies can update application status"}), 403

    company_id = int(identity)
    application = RecruitmentApplication.query.get(app_id)
    
    if not application:
        return jsonify({"error": "Application not found"}), 404
    
    # Verify the company owns the job this application is for
    job = JobListing.query.get(application.job_id)
    if not job or job.company_id != company_id:
        return jsonify({"error": "You can only update applications for your own jobs"}), 403
    
    data = request.json
    new_status = data.get('status')
    
    # Allow new workflow stages and keep backward compatibility with 'accepted'
    allowed_statuses = ["pending", "screening", "interview", "selected", "rejected", "accepted"]
    if new_status not in allowed_statuses:
        return jsonify({"error": "Invalid status"}), 400
    
    try:
        # Normalize legacy 'accepted' to 'selected'
        application.status = 'selected' if new_status == 'accepted' else new_status
        db.session.commit()

        # Keep user.db application status in sync when possible
        if application.applicant_user_id and application.application_uuid:
            user_app = UserJobApplication.query.filter_by(application_uuid=application.application_uuid).first()
            if user_app:
                user_app.status = 'selected' if new_status == 'accepted' else new_status
                db.session.commit()
        return jsonify({"message": "Application status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating application status: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/applications/<int:app_id>/message', methods=['POST'])
@jwt_required()
def send_application_message(app_id):
    """Company or User sends a message in the application thread."""
    identity = get_jwt_identity()
    additional_claims = get_jwt()

    application = RecruitmentApplication.query.get(app_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    # Determine sender role and verify permissions
    sender_role = additional_claims.get('role')
    if sender_role == 'company':
        # Company sending message - verify ownership
        company_id = int(identity)
        job = JobListing.query.get(application.job_id)
        if not job or job.company_id != company_id:
            return jsonify({"error": "You can only message applications for your own jobs"}), 403
        sender = 'company'
    elif sender_role == 'user':
        # User sending message - verify they own this application
        user_id = int(identity)
        if application.application_uuid:
            user_app = UserJobApplication.query.filter_by(application_uuid=application.application_uuid).first()
            if not user_app or user_app.user_id != user_id:
                return jsonify({"error": "You can only message applications you applied to"}), 403
        sender = 'user'
    else:
        return jsonify({"error": "Invalid sender role"}), 403

    data = request.get_json() or {}
    message_text = (data.get('message') or '').strip()
    
    # Additional fields for company messages
    stage = data.get('stage')  # optional: screening/interview
    aptitude_info = data.get('aptitudeInfo')
    meetup_link = data.get('meetupLink')

    if not message_text and not (aptitude_info or meetup_link):
        return jsonify({"error": "Message content required"}), 400

    try:
        # Combine structured details into message if provided (company only)
        full_message = message_text
        if sender == 'company':
            extras = []
            if aptitude_info:
                extras.append(f"Aptitude Test: {aptitude_info}")
            if meetup_link:
                extras.append(f"Meet Link: {meetup_link}")
            if extras:
                full_message = (full_message + '\n\n' + '\n'.join(extras)).strip()

        msg = ApplicationMessage(application_id=application.id, sender=sender, message=full_message)
        db.session.add(msg)

        # Optionally update stage/status (company only)
        if sender == 'company' and stage in ['screening', 'interview']:
            application.status = stage
            # Sync to user db
            if application.application_uuid:
                user_app = UserJobApplication.query.filter_by(application_uuid=application.application_uuid).first()
                if user_app:
                    user_app.status = stage
                    user_app.updated_at = datetime.utcnow()

        application.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({"message": "Message sent", "application": application.to_dict(), "sentMessage": msg.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error sending application message: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<int:app_id>/accept', methods=['POST'])
@jwt_required()
def accept_application(app_id):
    """Accept application and send offer letter (company only)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    
    if additional_claims.get('role') != 'company':
        return jsonify({"error": "Only companies can accept applications"}), 403
    
    company_id = int(identity)
    application = RecruitmentApplication.query.get(app_id)
    
    if not application:
        return jsonify({"error": "Application not found"}), 404
    
    # Verify the company owns the job this application is for
    job = JobListing.query.get(application.job_id)
    if not job or job.company_id != company_id:
        return jsonify({"error": "You can only accept applications for your own jobs"}), 403
    
    data = request.get_json()
    offer_letter = data.get('offerLetter', '')
    company_message = data.get('companyMessage', '')
    
    # Handle file upload (dictionary with name, type, data)
    if isinstance(offer_letter, dict):
        # For now, store the file info as JSON string
        # In a production system, you might want to save the file to disk or cloud storage
        import json
        offer_letter = json.dumps(offer_letter)
    
    try:
        # Update application status (normalize to 'selected')
        application.status = 'selected'
        application.updated_at = datetime.utcnow()

        # Save optional company message to business DB messages table
        if company_message and company_message.strip():
            try:
                msg = ApplicationMessage(application_id=application.id, sender='company', message=company_message.strip())
                db.session.add(msg)
                db.session.commit()
            except Exception as em:
                db.session.rollback()
                logger.error(f"Failed to save company message for application {app_id}: {em}")
        
        db.session.commit()

        if application.application_uuid:
            user_app = UserJobApplication.query.filter_by(application_uuid=application.application_uuid).first()
            if user_app:
                user_app.status = "selected"
                user_app.updated_at = datetime.utcnow()
                db.session.commit()
        
        # Here you would typically send an email to the candidate
        # For now, we'll just log it
        if application.applicant_email:
            logger.info(f"Application {app_id} accepted. Offer letter sent to {application.applicant_email}")
        
        return jsonify({
            "message": "Application accepted and offer letter sent",
            "application": application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error accepting application: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<int:app_id>/reject', methods=['POST'])
@jwt_required()
def reject_application(app_id):
    """Reject application with reason (company only)"""
    identity = get_jwt_identity()
    additional_claims = get_jwt()
    
    if additional_claims.get('role') != 'company':
        return jsonify({"error": "Only companies can reject applications"}), 403
    
    company_id = int(identity)
    application = RecruitmentApplication.query.get(app_id)
    
    if not application:
        return jsonify({"error": "Application not found"}), 404
    
    # Verify the company owns the job this application is for
    job = JobListing.query.get(application.job_id)
    if not job or job.company_id != company_id:
        return jsonify({"error": "You can only reject applications for your own jobs"}), 403
    
    data = request.get_json()
    rejection_reason = data.get('rejectionReason', '')
    company_message = data.get('companyMessage', '')
    
    if not rejection_reason.strip():
        return jsonify({"error": "Rejection reason is required"}), 400
    
    try:
        # Update application status
        application.status = 'rejected'
        application.updated_at = datetime.utcnow()
        
        db.session.commit()

        if application.application_uuid:
            user_app = UserJobApplication.query.filter_by(application_uuid=application.application_uuid).first()
            if user_app:
                user_app.status = "rejected"
                user_app.updated_at = datetime.utcnow()
                db.session.commit()
        
        # Here you would typically send an email to the candidate
        # For now, we'll just log it
        logger.info(f"Application {app_id} rejected. Reason sent to {application.user.email}")

        # Save optional company message
        if company_message and company_message.strip():
            try:
                msg = ApplicationMessage(application_id=application.id, sender='company', message=company_message.strip())
                db.session.add(msg)
                db.session.commit()
            except Exception as em:
                db.session.rollback()
                logger.error(f"Failed to save company message for application {app_id}: {em}")
        
        return jsonify({
            "message": "Application rejected with reason sent to candidate",
            "application": application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error rejecting application: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/marketing/stats', methods=['GET'])
def get_marketing_stats():
    stats = marketing_engine.get_marketing_stats()
    return jsonify(stats)

@app.route('/api/security/audit-logs', methods=['GET'])
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(50).all()
    return jsonify([log.to_dict() for log in logs])

# Business Profile Endpoints
@app.route('/api/business/submit', methods=['POST'])
@jwt_required()
def submit_business():
    """Submit or update business profile"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        logger.info(f"Business submission attempt by user: {identity}")

        # Only company accounts should submit business profiles.
        if additional_claims.get("role") != "company":
            return jsonify({"error": "Not a company account"}), 403

        company_id = int(identity)
        
        # Get form data
        business_name = request.form.get('businessName')
        business_category = request.form.get('businessCategory')
        business_email = request.form.get('businessEmail')
        contact_number = request.form.get('contactNumber')
        business_address = request.form.get('businessAddress')
        website_url = request.form.get('websiteUrl')
        description = request.form.get('description', '')
        
        logger.info(f"Received data - Name: {business_name}, Category: {business_category}, Email: {business_email}, URL: {website_url}")
        
        # Optional social media fields
        facebook_url = request.form.get('facebookPageUrl', '')
        instagram_profile = request.form.get('instagramProfile', '')
        linkedin_page = request.form.get('linkedinPage', '')
        
        # Validate required fields
        if not all([business_name, business_category, business_email, website_url]):
            missing = []
            if not business_name: missing.append('businessName')
            if not business_category: missing.append('businessCategory')
            if not business_email: missing.append('businessEmail')
            if not website_url: missing.append('websiteUrl')
            logger.error(f"Missing required fields: {missing}")
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
        
        # Store business core details on the authenticated company record
        company = Company.query.get(company_id)
        if not company:
            return jsonify({"error": "Company not found"}), 404

        company.company_name = business_name
        company.description = description
        company.website = website_url
        company.industry = business_category
        company.location = business_address

        # Check if business profile already exists for this company
        existing_profile = BusinessProfile.query.filter_by(company_id=company_id).first()
        
        if existing_profile:
            # Update existing profile
            existing_profile.website_url = website_url
            existing_profile.business_category = business_category
            existing_profile.linkedin = linkedin_page
            existing_profile.instagram = instagram_profile
            message = "Business profile updated successfully"
            logger.info(f"Updated business profile for company {company_id}")
        else:
            # Create new profile
            new_profile = BusinessProfile(
                company_id=company_id,
                website_url=website_url,
                business_category=business_category,
                linkedin=linkedin_page,
                instagram=instagram_profile
            )
            db.session.add(new_profile)
            message = "Business profile created successfully"
            logger.info(f"Created new business profile for company {company_id}")
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": message,
            "businessId": company_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting business: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/company/business', methods=['GET'])
@jwt_required()
def get_company_business():
    """Get business profile for the current company"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        logger.info(f"Company business GET request - identity: {identity}, claims: {additional_claims}")
        
        # Check if this is a company
        if additional_claims.get('role') != 'company':
            logger.error(f"Not a company account. Role: {additional_claims.get('role')}")
            return jsonify({"error": "Not a company account"}), 403
        
        company_id = int(identity)  # Use raw company ID
        logger.info(f"Company ID: {company_id}")
        
        profile = BusinessProfile.query.filter_by(company_id=company_id).first()
        
        if not profile:
            logger.info(f"No business profile found for company_id: {company_id}")
            return jsonify({"success": True, "data": None}), 200
        
        logger.info(f"Found business profile: {profile.to_dict()}")
        return jsonify({
            "success": True,
            "data": profile.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching company business: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/company/business', methods=['POST'])
@jwt_required()
def submit_company_business():
    """Submit or update business profile for company"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        
        logger.info(f"Company business POST request - identity: {identity}, claims: {additional_claims}")
        
        # Check if this is a company
        if additional_claims.get('role') != 'company':
            logger.error(f"Not a company account. Role: {additional_claims.get('role')}")
            return jsonify({"error": "Not a company account"}), 403
        
        company_id = int(identity)  # Use raw company ID
        logger.info(f"Company ID: {company_id}")
        
        # Get JSON data
        data = request.get_json()
        logger.info(f"Received business data: {data}")
        
        business_name = data.get('businessName')
        business_category = data.get('businessCategory')
        business_email = data.get('businessEmail')
        contact_number = data.get('contactNumber')
        business_address = data.get('businessAddress')
        website_url = data.get('websiteUrl')
        description = data.get('description', '')
        
        logger.info(f"Extracted fields - Name: {business_name}, Category: {business_category}, Email: {business_email}")
        
        # Validate required fields
        if not all([business_name, business_category, business_email, contact_number, business_address, website_url]):
            missing_fields = []
            if not business_name: missing_fields.append('businessName')
            if not business_category: missing_fields.append('businessCategory')
            if not business_email: missing_fields.append('businessEmail')
            if not contact_number: missing_fields.append('contactNumber')
            if not business_address: missing_fields.append('businessAddress')
            if not website_url: missing_fields.append('websiteUrl')
            logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        # Update the company core record (scoped to this JWT)
        company = Company.query.get(company_id)
        if not company:
            return jsonify({"error": "Company not found"}), 404

        company.company_name = business_name
        company.description = description
        company.website = website_url
        company.industry = business_category
        company.location = business_address

        # Check if business profile already exists
        existing_profile = BusinessProfile.query.filter_by(company_id=company_id).first()
        
        if existing_profile:
            logger.info(f"Updating existing business profile for company_id: {company_id}")
            # Update existing profile
            existing_profile.business_category = business_category
            existing_profile.website_url = website_url
            existing_profile.linkedin = data.get('linkedinPage', '')
            existing_profile.instagram = data.get('instagramProfile', '')
        else:
            logger.info(f"Creating new business profile for company_id: {company_id}")
            # Create new profile
            new_profile = BusinessProfile(
                company_id=company_id,
                business_category=business_category,
                website_url=website_url,
                linkedin=data.get('linkedinPage', ''),
                instagram=data.get('instagramProfile', ''),
            )
            db.session.add(new_profile)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Business profile submitted successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error submitting company business: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/business/<int:user_id>', methods=['GET'])
@jwt_required()
def get_business(user_id):
    """Get business profile (company scoped)"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        if additional_claims.get("role") != "company":
            return jsonify({"error": "Not a company account"}), 403

        company_id = int(identity)
        # Prevent IDOR: only allow fetching own profile
        if int(user_id) != company_id:
            return jsonify({"error": "Unauthorized"}), 403

        profile = BusinessProfile.query.filter_by(company_id=company_id).first()
        
        if not profile:
            return jsonify({"business": None}), 404
        
        return jsonify({
            "success": True,
            "business": profile.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching business: {e}", exc_info=True)
        return jsonify({"message": "Scalnex API is running"}), 200
@app.route('/api/business/categories', methods=['GET'])
def get_business_categories():
    """Get list of business categories"""
    categories = [
        'Technology', 'Retail', 'Healthcare', 'Finance', 'Education',
        'Consulting', 'Real Estate', 'Manufacturing', 'Hospitality', 'Other'
    ]
    return jsonify({"success": True, "data": categories})

@app.route('/api/business/user', methods=['GET'])
@jwt_required()
def get_user_businesses():
    """Get all businesses for the current user"""
    try:
        identity = get_jwt_identity()
        additional_claims = get_jwt()
        uid = int(identity) if additional_claims.get("role") == "company" else None
        
        if not uid:
             return jsonify({"error": "Unauthorized"}), 403

        profiles = BusinessProfile.query.filter_by(company_id=uid).all()
        return jsonify({
            "success": True,
            "data": [p.to_dict() for p in profiles]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/business/search', methods=['GET'])
def search_businesses():
    """Search for businesses by name or category"""
    query = request.args.get('query', '')
    if not query:
        # Show some profiles by default
        profiles = BusinessProfile.query.limit(20).all()
        return jsonify({"success": True, "data": [p.to_dict() for p in profiles]})
    
    profiles = BusinessProfile.query.filter(
        (BusinessProfile.business_name.ilike(f'%{query}%')) |
        (BusinessProfile.business_category.ilike(f'%{query}%')) |
        (BusinessProfile.description.ilike(f'%{query}%'))
    ).all()
    
    return jsonify({
        "success": True,
        "data": [p.to_dict() for p in profiles]
    })

@app.route('/api/business/<int:business_id>', methods=['DELETE'])
@jwt_required()
def delete_business_profile(business_id):
    """Delete a business profile"""
    try:
        identity = get_jwt_identity()
        uid = int(identity) if not str(identity).startswith('c_') else None
        
        profile = BusinessProfile.query.get(business_id)
        if not profile:
            return jsonify({"error": "Profile not found"}), 404
            
        if profile.user_id != uid:
            return jsonify({"error": "Unauthorized"}), 403
            
        db.session.delete(profile)
        db.session.commit()
        return jsonify({"success": True, "message": "Business profile deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask_jwt_extended import verify_jwt_in_request
# --- AI TIME-TRAVEL SIMULATOR ROUTES ---
from time_travel_engine import time_travel_engine


@app.route('/api/analytics/time-travel', methods=['GET'])
def get_time_travel_data():
    """
    Get AI-generated timeline data for time-travel simulation.
    Returns past, present, and predicted future business metrics.
    """
    try:
        user_id = None
        
        # Try to get JWT identity, but allow unauthenticated access for demo
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = None
        
        # Generate timeline data (use sample data if no user)
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            timeline_data = time_travel_engine.generate_timeline_data(user_id=user_id)
        else:
            # Use sample/demo data
            timeline_data = time_travel_engine.generate_timeline_data(user_id='demo_user')
        
        # Add narrations for each node
        timeline_data['past_6m']['narration'] = time_travel_engine.generate_narration('past_6m', timeline_data['past_6m'])
        timeline_data['past_3m']['narration'] = time_travel_engine.generate_narration('past_3m', timeline_data['past_3m'])
        timeline_data['present']['narration'] = time_travel_engine.generate_narration('present', timeline_data['present'])
        timeline_data['future_3m']['narration'] = time_travel_engine.generate_narration('future_3m', timeline_data['future_3m'])
        timeline_data['future_6m']['narration'] = time_travel_engine.generate_narration('future_6m', timeline_data['future_6m'])
        
        return jsonify(timeline_data), 200
        
    except Exception as e:
        logger.error(f"Time-travel data generation error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/metaverse-state', methods=['GET'])
def get_metaverse_state():
    """
    Get the state for the AI Business Metaverse world.
    Returns: Complete city state, building scales, lighting, and AI messages.
    """
    try:
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = 'demo_user'
            
        state = time_travel_engine.generate_metaverse_state(user_id=user_id)
        return jsonify(state), 200
        
    except Exception as e:
        logger.error(f"Metaverse state error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/organism-state', methods=['GET'])
def get_organism_state():
    """
    Get the state for the AI Business Organism.
    Returns: Biological properties, heartbeat, neural glow, and lab actions.
    """
    try:
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = 'demo_user'
            
        state = time_travel_engine.generate_organism_state(user_id=user_id)
        return jsonify(state), 200
        
    except Exception as e:
        logger.error(f"Organism state error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500
from time_travel_engine import time_travel_engine
from flask_jwt_extended import verify_jwt_in_request

@app.route('/api/analytics/time-travel/simulate', methods=['POST'])
def simulate_decision():
    """
    Simulate the impact of a business decision on future predictions.
    Expects: { "timeline_data": {...}, "decision": "improve_page_speed" }
    Returns: Updated future predictions with decision impact
    """
    try:
        user_id = None
        
        # Try to get JWT identity, but allow unauthenticated access for demo
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = 'demo_user'
        
        data = request.json
        
        if not data or 'decision' not in data:
            return jsonify({"error": "Decision is required"}), 400
        
        decision = data.get('decision')
        timeline_data = data.get('timeline_data')
        
        if not timeline_data:
            # Generate fresh timeline if not provided
            timeline_data = time_travel_engine.generate_timeline_data(user_id=user_id)
        
        # Simulate decision impact
        result = time_travel_engine.simulate_decision(timeline_data, decision)
        
        # Log decision for analytics (only if authenticated)
        if user_id and user_id != 'demo_user':
            try:
                audit = AuditLog(
                    user_id=user_id,
                    action='time_travel_decision',
                    details=f"Simulated decision: {decision}",
                    ip_address=request.remote_addr
                )
                db.session.add(audit)
                db.session.commit()
            except Exception:
                pass  # Don't fail if audit logging fails
        
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Decision simulation error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# --- EMPLOYEES ROUTES (replacing port 3001) ---
from database.models import Employee


@app.route('/api/employees/<int:user_id>', methods=['GET'])
def get_user_employees(user_id):
    """Get employees for a user"""
    # Authorization logic removed for simplification as requested
    
    employees = Employee.query.filter_by(user_id=user_id).all()
    return jsonify({"employees": [emp.to_dict() for emp in employees]}), 200

@app.route('/api/employees', methods=['GET'])
def get_all_user_employees():
    """Get all employees for current user"""
    # This endpoint normally requires JWT identity, but we'll use a user_id param if provided
    user_id = request.args.get('userId')
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
        
    employees = Employee.query.filter_by(user_id=user_id).all()
    return jsonify({"employees": [emp.to_dict() for emp in employees]}), 200

@app.route('/api/employees', methods=['POST'])
def add_employee():
    """Add new employee"""
    data = request.json
    user_id = data.get('userId')
    
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
    
    try:
        # Robust date parsing
        hire_date_val = data.get('hireDate')
        if isinstance(hire_date_val, (int, float)):
            # Handle numeric timestamp (ms)
            hire_date = datetime.fromtimestamp(hire_date_val / 1000.0)
        elif isinstance(hire_date_val, str):
            # Handle ISO string or simple date string
            try:
                hire_date = datetime.fromisoformat(hire_date_val.replace('Z', '+00:00'))
            except ValueError:
                hire_date = datetime.strptime(hire_date_val, '%Y-%m-%d')
        else:
            hire_date = datetime.utcnow()

        employee = Employee(
            user_id=user_id,
            name=data.get('name'),
            email=data.get('email'),
            position=data.get('position'),
            department=data.get('department'),
            hire_date=hire_date,
            salary=float(data.get('salary', 0)),
            status='active'
        )
        db.session.add(employee)
        db.session.commit()
        return jsonify({"success": True, "message": "Employee added", "employee": employee.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding employee: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    """Update employee"""
    employee = Employee.query.get(emp_id)
    
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    data = request.json
    try:
        if 'name' in data: employee.name = data['name']
        if 'email' in data: employee.email = data['email']
        if 'position' in data: employee.position = data['position']
        if 'department' in data: employee.department = data['department']
        if 'salary' in data: employee.salary = float(data['salary'])
        if 'status' in data: employee.status = data['status']
        
        db.session.commit()
        return jsonify({"success": True, "message": "Employee updated", "employee": employee.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    """Delete employee"""
    employee = Employee.query.get(emp_id)
    
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"success": True, "message": "Employee deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# --- GROWTH TIPS ROUTES (replacing port 3001) ---
from database.models import GrowthTip


@app.route('/api/implemented-tips/<int:user_id>', methods=['GET'])
@jwt_required()
def get_implemented_tips(user_id):
    """Get implemented tips for user"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    tips = GrowthTip.query.filter_by(user_id=user_id).all()
    return jsonify({"implementedTips": [tip.to_dict() for tip in tips]}), 200

@app.route('/api/implemented-tips/<int:user_id>/<tip_id>', methods=['GET'])
@jwt_required()
def get_tip_status(user_id, tip_id):
    """Get status of a specific tip"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    tip = GrowthTip.query.filter_by(user_id=user_id, tip_id=tip_id).first()
    if tip:
        return jsonify({"tip": tip.to_dict()}), 200
    return jsonify({"tip": {"tipId": tip_id, "implemented": False, "implementedAt": None}}), 200

@app.route('/api/implemented-tips/<int:user_id>/<tip_id>', methods=['PUT'])
@jwt_required()
def update_tip_status(user_id, tip_id):
    """Update tip implementation status"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    try:
        tip = GrowthTip.query.filter_by(user_id=user_id, tip_id=tip_id).first()
        if not tip:
            tip = GrowthTip(user_id=user_id, tip_id=tip_id)
            db.session.add(tip)
        
        tip.implemented = data.get('implemented', False)
        if tip.implemented:
            tip.implemented_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify({"success": True, "tip": tip.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/implemented-tips', methods=['POST'])
@jwt_required()
def create_growth_tip():
    """Create new growth tip implementation"""
    user_id = get_jwt_identity()
    data = request.json
    
    try:
        tip = GrowthTip(
            user_id=user_id,
            tip_id=data.get('tipId'),
            implemented=data.get('implemented', False),
            implemented_at=datetime.utcnow() if data.get('implemented') else None
        )
        db.session.add(tip)
        db.session.commit()
        return jsonify({"success": True, "tip": tip.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# --- 3D SEO VISUALIZATION API ---
@app.route('/api/seo/3d-structure', methods=['GET'])
def get_3d_seo_structure():
    """Get 3D visualization data for a website"""
    url = request.args.get('url')
    
    if not url:
        return jsonify({"error": "URL parameter is required"}), 400
    
    # Validate URL format
    if not (url.startswith('http://') or url.startswith('https://')):
        url = 'https://' + url
    
    try:
        # Initialize crawler with conservative settings
        crawler = SEOCrawler(max_depth=2, max_pages=15, delay=1.0)
        
        # Crawl the website
        result = crawler.crawl_website(url)
        
        if not result['pages']:
            return jsonify({"error": "No pages found or unable to crawl the website"}), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error crawling website {url}: {str(e)}")
        return jsonify({"error": f"Failed to crawl website: {str(e)}"}), 500

# --- EMAIL SERVICE ENDPOINTS ---
# Dev email logging was removed (SMTP-only).
@app.route('/api/email/log', methods=['GET'])
def get_email_log():
    return jsonify({"error": "Email log is disabled (SMTP-only mode)."}), 404


@app.route('/api/email/clear', methods=['POST'])
def clear_email_log():
    return jsonify({"error": "Email log is disabled (SMTP-only mode)."}), 404

# --- USER SETTINGS ROUTES (replacing localStorage) ---
from database.models import UserSettings


@app.route('/api/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings"""
    user_id = get_jwt_identity()
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    
    return jsonify({"settings": settings.to_dict()}), 200

@app.route('/api/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update user settings"""
    user_id = get_jwt_identity()
    data = request.json
    
    try:
        settings = UserSettings.query.filter_by(user_id=user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id)
            db.session.add(settings)
        
        if 'theme' in data: settings.theme = data['theme']
        if 'emailNotifications' in data: settings.email_notifications = data['emailNotifications']
        if 'seoAlerts' in data: settings.seo_alerts = data['seoAlerts']
        if 'weeklyReports' in data: settings.weekly_reports = data['weeklyReports']
        if 'marketingEmails' in data: settings.marketing_emails = data['marketingEmails']
        if 'profileVisibility' in data: settings.profile_visibility = data['profileVisibility']
        if 'dataSharing' in data: settings.data_sharing = data['dataSharing']
        if 'analyticsTracking' in data: settings.analytics_tracking = data['analyticsTracking']
        
        db.session.commit()
        return jsonify({"success": True, "message": "Settings updated", "settings": settings.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# --- CONTENT STUDIO ROUTES ---

@app.route('/api/content', methods=['GET'])
def get_content_items():
    user_id = request.args.get('userId')
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
        
    items = ContentItem.query.filter_by(user_id=user_id).order_by(ContentItem.date.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/content', methods=['POST'])
def add_content_item():
    data = request.json
    user_id = data.get('userId')
    
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
    
    new_item = ContentItem(
        user_id=user_id,
        date=data.get('date'),
        platform=data.get('platform'),
        type=data.get('type'),
        topic=data.get('topic'),
        caption=data.get('caption'),
        drive_url=data.get('driveUrl'),
        status=data.get('status', 'Draft'),
        date_posted=datetime.fromisoformat(data['datePosted']) if data.get('datePosted') else None,
        responsible_name=data.get('responsibleName'),
        responsible_photo=data.get('responsiblePhoto')
    )
    
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/api/content/<int:item_id>', methods=['PUT', 'DELETE'])
def update_content_item(item_id):
    user_id = request.args.get('userId')
    if request.method == 'PUT':
        data = request.json
        if not user_id: user_id = data.get('userId')
        
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    item = ContentItem.query.get(item_id)
    
    if not item:
        return jsonify({"error": "Item not found"}), 404
        
    # Optional ownership check if user_id is provided
    if user_id and str(item.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403
        
    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True})
        
    data = request.json
    if 'date' in data: item.date = data['date']
    if 'platform' in data: item.platform = data['platform']
    if 'type' in data: item.type = data['type']
    if 'topic' in data: item.topic = data['topic']
    if 'caption' in data: item.caption = data['caption']
    if 'driveUrl' in data: item.drive_url = data['driveUrl']
    if 'status' in data: item.status = data['status']
    if 'datePosted' in data: 
        item.date_posted = datetime.fromisoformat(data['datePosted']) if data['datePosted'] else None
    if 'responsibleName' in data: item.responsible_name = data['responsibleName']
    
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/content/export', methods=['GET'])
def export_content():
    user_id = request.args.get('userId')
    if not user_id:
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
            
    if not user_id:
        return jsonify({"error": "userId required"}), 400
    items = ContentItem.query.filter_by(user_id=user_id).order_by(ContentItem.date.desc()).all()
    
    if not items:
        return jsonify({"error": "No content to export"}), 400
        
    # Create DataFrame
    data = []
    for item in items:
        data.append({
            "Date": item.date,
            "Platform": item.platform,
            "Type": item.type,
            "Content Topic": item.topic,
            "Caption": item.caption,
            "Google Drive URL": item.drive_url,
            "Status": item.status,
            "Date Posted": item.date_posted.strftime('%Y-%m-%d %H:%M') if item.date_posted else "N/A",
            "Responsible": item.responsible_name
        })
        
    df = pd.DataFrame(data)
    
    # Save to Excel
    filename = f"content_calendar_{user_id}_{int(time.time())}.xlsx"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        df.to_excel(filepath, index=False)
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
    except Exception as e:
        logger.error(f"Export error: {e}")
        return jsonify({"error": "Failed to generate Excel file"}), 500


from social_media_scraper import InstagramScraper, YouTubeScraper
from google_reviews_scraper import GoogleReviewsScraper


class SimpleSentimentAnalyzer:
    """A basic sentiment analyzer using TextBlob as a fallback when the ML service is down"""
    def __init__(self):
        try:
            from textblob import TextBlob
            self.TextBlob = TextBlob
        except ImportError:
            self.TextBlob = None

    def analyze(self, comments: List[Dict]) -> Dict:
        if not self.TextBlob or not comments:
            return {
                "sentiment_score": 0,
                "reputation_score": 0,
                "stats": {"positive": 0, "negative": 0, "neutral": 0, "total": 0},
                "breakdown": {"distribution": [], "emotions": [], "keywords": []},
                "trend_graph": [],
                "top_comments": {"positive": [], "negative": []},
                "ai_summary": "No comments found to analyze. Please verify the URL or try a profile with public comments."
            }

        pos, neg, neu = 0, 0, 0
        total_score = 0
        processed = []
        
        for c in comments:
            blob = self.TextBlob(c.get('text', ''))
            score = blob.sentiment.polarity # -1 to 1
            sentiment = "Neutral"
            if score > 0.1: 
                sentiment = "Positive"
                pos += 1
            elif score < -0.1: 
                sentiment = "Negative"
                neg += 1
            else:
                neu += 1
            
            total_score += (score + 1) * 50
            processed.append({**c, "sentiment": sentiment, "score": score})

        total = len(processed)
        avg_score = total_score / total if total > 0 else 50
        
        return {
            "sentiment_score": round(avg_score, 1),
            "reputation_score": round((pos/total*100) if total > 0 else 50, 1),
            "stats": {"positive": pos, "negative": neg, "neutral": neu, "total": total},
            "breakdown": {
                "distribution": [
                    {"name": "Positive", "value": pos},
                    {"name": "Negative", "value": neg},
                    {"name": "Neutral", "value": neu}
                ],
                "emotions": [{"name": "Audience Interest", "value": total}],
                "keywords": []
            },
            "trend_graph": [{"time": "Now", "score": avg_score}],
            "top_comments": {
                "positive": sorted([p for p in processed if p['sentiment'] == "Positive"], key=lambda x: x['score'], reverse=True)[:3],
                "negative": sorted([p for p in processed if p['sentiment'] == "Negative"], key=lambda x: x['score'])[:3]
            },
            "ai_summary": f"Basic analysis completed for {total} items. Sentiment is generally {'positive' if avg_score > 60 else 'neutral' if avg_score > 40 else 'concerning'}."
        }

@app.route('/api/debug/paths', methods=['GET'])
def debug_paths():
    import sys
    import social_media_scraper
    try:
        import youtube_comment_downloader
        yt_file = getattr(youtube_comment_downloader, '__file__', 'unknown')
    except:
        yt_file = 'not_imported'
        
    return jsonify({
        "social_media_scraper": getattr(social_media_scraper, '__file__', 'unknown'),
        "youtube_comment_downloader": yt_file,
        "sys_path": sys.path,
        "cwd": os.getcwd()
    })

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment_endpoint():
    data = request.json
    url = data.get('url', '').strip()
    comments_text = (data.get('commentsText') or "").strip()
    
    if not url and not comments_text:
        return jsonify({"error": "URL or commentsText is required", "success": False}), 400
    
    # Focus exclusively on YouTube as requested
    scraper = YouTubeScraper(url or "pasted_comments")
    if comments_text and not url:
        comments = [line.strip() for line in comments_text.splitlines() if line.strip()]
        profile_data = scraper.analyze_pasted_comments(comments, url="pasted_comments")
    else:
        profile_data = scraper.scrape_profile()

    if profile_data.get('success'):
        # Normalize comment field names expected by the frontend
        normalized_comments = []
        for c in (profile_data.get('comments', []) or [])[:20]:
            if not isinstance(c, dict):
                continue
            normalized_comments.append({
                "Author": c.get("Author") or c.get("author") or "Unknown",
                "Comment": c.get("Comment") or c.get("text") or "",
                "Likes": c.get("Likes") if c.get("Likes") is not None else c.get("votes", 0),
                "PublishedTime": (
                    c.get("PublishedTime")
                    or c.get("Published Time")
                    or c.get("time")
                    or "Unknown"
                ),
                "ReplyCount": (
                    c.get("ReplyCount")
                    if c.get("ReplyCount") is not None
                    else c.get("Reply Count", c.get("replies", 0))
                ),
                "Sentiment": c.get("Sentiment") or c.get("sentiment") or "Neutral",
            })

        return jsonify({
            "success": True,
            "analysis": {
                "sentiment_score": (profile_data['summary']['positive'] / profile_data['summary']['total'] * 100) if profile_data['summary']['total'] > 0 else 0,
                "reputation_score": (profile_data['summary']['positive'] / profile_data['summary']['total'] * 100) if profile_data['summary']['total'] > 0 else 0,
                "stats": profile_data['summary'],
                "breakdown": {
                    "distribution": [
                        {"name": "Positive", "value": profile_data['summary']['positive']},
                        {"name": "Negative", "value": profile_data['summary']['negative']},
                        {"name": "Neutral", "value": profile_data['summary']['neutral']}
                    ]
                },
                "files": profile_data.get('files', {}),
                "ai_summary": f"Local analysis of {profile_data['summary']['total']} YouTube comments completed using VADER."
            },
            "comments": normalized_comments  # Return preview to frontend
        }), 200
    else:
        return jsonify({
            "error": profile_data.get('error', 'YouTube analysis failed'),
            "success": False
        }), 500

@app.route('/api/sentiment/export-excel', methods=['POST'])
def export_sentiment_excel():
    try:
        data = request.json
        analysis = data.get('analysis', {})
        comments = analysis.get('top_comments', {}).get('positive', []) + analysis.get('top_comments', {}).get('negative', [])
        
        df = pd.DataFrame(comments)
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Comments Analysis')
            
            summary_data = {
                'Metric': ['Sentiment Score', 'Reputation Score', 'Total Analyzed', 'Toxicity Mean'],
                'Value': [
                    analysis.get('sentiment_score'), 
                    analysis.get('reputation_score'),
                    analysis.get('stats', {}).get('total'),
                    analysis.get('toxicity_summary', {}).get('toxicity', 0)
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, index=False, sheet_name='Summary')
            
        output.seek(0)
        return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                         as_attachment=True, download_name='sentiment_report.xlsx')
    except Exception as e:
        logger.error(f"Excel export failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sentiment/export-pdf', methods=['POST'])
def export_sentiment_pdf():
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        data = request.json
        analysis = data.get('analysis', {})
        
        output = BytesIO()
        p = canvas.Canvas(output, pagesize=letter)
        width, height = letter
        
        p.setFont("Helvetica-Bold", 24)
        p.drawString(100, height - 80, "YouTube Sentiment Analysis Report")
        
        p.setFont("Helvetica", 12)
        p.drawString(100, height - 120, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, height - 140, f"Brand Reputation Score: {analysis.get('reputation_score')}/100")
        p.drawString(100, height - 160, f"Total Comments Analyzed: {analysis.get('stats', {}).get('total')}")
        
        p.drawString(100, height - 200, "AI Summary:")
        p.setFont("Helvetica-Oblique", 11)
        text_object = p.beginText(100, height - 220)
        text_object.textLines(analysis.get('ai_summary', 'No summary available.'))
        p.drawText(text_object)
        
        p.showPage()
        p.save()
        output.seek(0)
        return send_file(output, mimetype='application/pdf', as_attachment=True, download_name='sentiment_report.pdf')
    except Exception as e:
        logger.error(f"PDF export failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Disable the reloader to avoid multiple python processes serving stale code on the same port.
    app.run(debug=True, host='0.0.0.0', port=5001, use_reloader=False)
