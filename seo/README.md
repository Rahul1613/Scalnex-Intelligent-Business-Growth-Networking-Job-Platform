# Scalnex - AI-Powered SEO & Growth Platform

A modern, responsive landing page and powerful dashboard for Scalnex built with React, TypeScript, Tailwind CSS, and a Flask Python backend.

## 🚀 Features

- **Modern UI Design**: Clean, professional interface with gradient accents
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **AI-Powered Analytics**: Python backend for advanced data processing
- **SEO Analysis**: Real-time SEO scoring and PDF reporting
- **Job Recruitment System**: Complete recruitment management for companies and job seekers
- **Business Marketplace**: Directory of businesses with detailed profiles
- **Fully Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Authentication**: JWT tokens with context management

### Backend
- **Framework**: Flask
- **Database**: SQLite (SQLAlchemy)
- **Authentication**: Flask-JWT-Extended with Bcrypt
- **Data Science**: Pandas, Plotly, Scikit-learn
- **SEO Tools**: BeautifulSoup4, Requests
- **Email Service**: Custom email integration

## � Quick Start (Recommended)

### Option 1: Automated Startup (Windows)

Use the provided batch script to start both frontend and backend automatically:

```bash
# Run the platform startup script
run_platform.bat
```

This will:
- Start the Flask backend on `http://127.0.0.1:5000`
- Start the React frontend on `http://localhost:5173` (or available port)
- Open both services in separate terminal windows

### Option 2: Manual Startup

#### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Git

#### Step 1: Clone and Setup
```bash
git clone <repository-url>
cd seo
```

#### Step 2: Backend Setup
Open a new terminal for the backend:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask backend server
python app.py
```

**Backend will run on:** `http://127.0.0.1:5000`

#### Step 3: Frontend Setup
Open a **separate terminal** for the frontend:

```bash
# Navigate to project root (if not already there)
cd seo

# Install Node.js dependencies
npm install

# Start the React development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (or next available port)

## 📋 Detailed Setup Instructions

### Backend Setup Details

1. **Virtual Environment Setup**
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Database Initialization**
The database is automatically created on first run. SQLite database file will be created at:
`backend/instance/seo.db`

4. **Start Backend Server**
```bash
cd backend
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Frontend Setup Details

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Configuration**
The frontend is configured to connect to the backend at `http://127.0.0.1:5000/api`

3. **Start Development Server**
```bash
npm run dev
```

**Expected Output:**
```
  VITE v4.5.14  ready in 453 ms
  
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🔧 Configuration

### Backend Configuration
- **Database**: SQLite (automatically created)
- **JWT Secret**: Set via `JWT_SECRET_KEY` environment variable
- **CORS Origins**: Configured for localhost development ports
- **Upload Folder**: `uploads/` (auto-created)

### Frontend Configuration
- **API Base URL**: `http://127.0.0.1:5000/api` (configured in `src/services/api.ts`)
- **Development Server**: Port 5173 (or next available)

## 📊 Available Features

### Authentication System
- User registration and login
- Company registration and login
- JWT-based authentication
- Email verification with OTP

### Job Recruitment
- Post job listings (companies only)
- Browse available jobs (public)
- Submit job applications
- Application management (accept/reject)

### Business Marketplace
- Business directory listings
- Company profiles and details
- Search and filter functionality

### SEO Tools
- Website SEO analysis
- Keyword research
- Meta tag generation
- PDF report generation

## 🎯 Access URLs

After starting both services:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://127.0.0.1:5000
- **API Documentation**: http://127.0.0.1:5000/api (various endpoints)

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

2. **Backend Not Starting**
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

3. **Frontend Not Connecting to Backend**
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/app.py`
- Verify API URL in `src/services/api.ts`

4. **Database Issues**
```bash
# Delete database and let it recreate
rm backend/instance/seo.db
# Then restart backend
```

5. **Permission Issues (Windows)**
```bash
# Run PowerShell as Administrator
# Or use the provided batch script
```

### Verification Commands

```bash
# Test backend is running
curl http://127.0.0.1:5000/api/platform-stats

# Check frontend is accessible
curl http://localhost:5173

# Verify both processes are running
netstat -an | findstr :5000
netstat -an | findstr :5173
```

## 🎨 Project Structure

```
seo/
├── backend/                    # Python Flask Backend
│   ├── app.py                 # Main application file
│   ├── models.py              # Database models
│   ├── requirements.txt       # Python dependencies
│   └── instance/              # SQLite database (auto-created)
├── src/                       # React Frontend
│   ├── components/            # Reusable components
│   ├── pages/                 # Application pages
│   ├── services/              # API services
│   ├── contexts/              # React contexts
│   └── App.tsx               # Main component
├── uploads/                   # File upload directory
├── run_platform.bat          # Windows startup script
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## 📄 Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/company/register` - Company registration
- `POST /api/company/login` - Company login

### Jobs
- `GET /api/jobs` - Get all public jobs
- `POST /api/jobs` - Create job (company only)
- `GET /api/jobs/company` - Get company jobs (company only)

### Business
- `GET /api/business/search` - Search businesses
- `POST /api/business/submit` - Submit business listing

### SEO Tools
- `POST /api/seo/analyze` - Analyze URL for SEO
- `POST /api/seo/keywords` - Keyword research

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly with both frontend and backend
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure both frontend and backend are running
3. Verify all dependencies are installed
4. Check console logs for error messages
