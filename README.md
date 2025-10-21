# try-sourcery

## Vulnerable Python Web Application - FOR TESTING ONLY

⚠️ **WARNING**: This application contains intentional security vulnerabilities for testing and educational purposes. **DO NOT** deploy this application in production or on public networks.

## Vulnerabilities Included

1. **SQL Injection** - Login page with unsanitized SQL queries
2. **Cross-Site Scripting (XSS)** - Search feature that reflects unescaped user input
3. **Command Injection** - Ping tool that executes shell commands
4. **Path Traversal** - File reader with no path validation
5. **Insecure Direct Object Reference (IDOR)** - Profile pages with predictable IDs

## Installation

```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Application

```bash
python vulnerable_app.py
```

The application will start on `http://127.0.0.1:5000`

## Testing the Vulnerabilities

### SQL Injection (Login Page)
- Navigate to `/login`
- Try username: `admin' OR '1'='1`
- This bypasses authentication

### XSS (Search Page)
- Navigate to `/search`
- Try: `<script>alert('XSS')</script>`
- Or: `<img src=x onerror=alert('XSS')>`

### Command Injection (Ping Tool)
- Navigate to `/ping`
- Try: `127.0.0.1; ls -la`
- Or: `127.0.0.1 && cat /etc/passwd`

### Path Traversal (File Reader)
- Navigate to `/file`
- Try: `../../../etc/passwd`
- Or: `/etc/hosts`

### IDOR (Profile Pages)
- Navigate to `/profile/1`
- Change the ID in the URL to access other users' profiles
- Try `/profile/2`, `/profile/3`, etc.

## Database

The application uses SQLite with two tables:
- `users` - Contains user accounts (admin/admin123, john/password)
- `posts` - Contains sample posts

The database is automatically created on first run.

## Security Notes

This application is designed to help learn about:
- Common web vulnerabilities
- Security testing techniques
- Secure coding practices (by showing what NOT to do)

Always practice security testing in controlled, isolated environments.