#!/usr/bin/env python3
"""
Restart Flask server with updated code
"""
import subprocess
import sys
import time
import requests

def restart_server():
    """Restart the Flask server"""
    
    print("Restarting Flask server with updated authentication code...")
    
    # Kill existing Flask processes
    try:
        subprocess.run(['pkill', '-f', 'python.*app.py'], check=False)
        time.sleep(2)
    except:
        pass
    
    # Start new Flask server
    print("Starting new Flask server...")
    try:
        # Start Flask in background
        subprocess.Popen([
            sys.executable, 'app.py'
        ], cwd='.')
        
        # Wait for server to start
        time.sleep(3)
        
        # Test if server is running
        response = requests.get('http://127.0.0.1:5000/api/test-connection')
        if response.status_code == 200:
            print("✓ Flask server restarted successfully")
            return True
        else:
            print("✗ Flask server failed to start properly")
            return False
            
    except Exception as e:
        print(f"✗ Error starting Flask server: {e}")
        return False

if __name__ == '__main__':
    restart_server()
