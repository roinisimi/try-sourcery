const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Hardcoded credentials (Vulnerability #1)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';
const API_KEY = 'sk_live_1234567890abcdef';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS misconfiguration (Vulnerability #2)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT)");
  db.run("INSERT INTO users (username, password, email) VALUES ('admin', 'password123', 'admin@example.com')");
  db.run("INSERT INTO users (username, password, email) VALUES ('user1', 'pass123', 'user1@example.com')");
  db.run("INSERT INTO users (username, password, email) VALUES ('user2', 'test456', 'user2@example.com')");
  
  db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, description TEXT)");
  db.run("INSERT INTO products (name, price, description) VALUES ('Laptop', 999.99, 'High-performance laptop')");
  db.run("INSERT INTO products (name, price, description) VALUES ('Mouse', 29.99, 'Wireless mouse')");
});

// SQL Injection vulnerability (Vulnerability #3)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row) {
      res.json({ success: true, message: 'Login successful', user: row });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// XSS vulnerability (Vulnerability #4)
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  
  res.send(`
    <html>
      <head><title>Search Results</title></head>
      <body>
        <h1>Search Results for: ${searchTerm}</h1>
        <p>No results found for "${searchTerm}"</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// Command Injection vulnerability (Vulnerability #5)
app.post('/ping', (req, res) => {
  const host = req.body.host;
  
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.json({ error: error.message, output: stdout });
      return;
    }
    res.json({ output: stdout });
  });
});

// Path Traversal vulnerability (Vulnerability #6)
app.get('/download', (req, res) => {
  const filename = req.query.file;
  const filePath = path.join(__dirname, 'files', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Insecure Direct Object Reference (Vulnerability #7)
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  db.get(`SELECT * FROM users WHERE id = ${userId}`, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { error: 'User not found' });
  });
});

// Eval vulnerability (Vulnerability #8)
app.post('/calculate', (req, res) => {
  const expression = req.body.expression;
  
  try {
    const result = eval(expression);
    res.json({ result: result });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Information disclosure (Vulnerability #9)
app.get('/debug', (req, res) => {
  res.json({
    environment: process.env,
    apiKey: API_KEY,
    adminPassword: ADMIN_PASSWORD,
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Mass assignment vulnerability (Vulnerability #10)
app.post('/register', (req, res) => {
  const userData = req.body;
  
  const query = `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`;
  
  db.run(query, [userData.username, userData.password, userData.email], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, userId: this.lastID, message: 'User registered successfully' });
  });
});

// No rate limiting (Vulnerability #11)
app.post('/brute-force-me', (req, res) => {
  const { password } = req.body;
  
  if (password === 'secret123') {
    res.json({ success: true, message: 'Access granted!' });
  } else {
    res.json({ success: false, message: 'Wrong password' });
  }
});

// Vulnerable to prototype pollution (Vulnerability #12)
app.post('/update-config', (req, res) => {
  const config = {};
  const updates = req.body;
  
  for (let key in updates) {
    config[key] = updates[key];
  }
  
  res.json({ success: true, config: config });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Vulnerable App - Security Testing</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          h1 { color: #d32f2f; }
          .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .method { font-weight: bold; color: #1976d2; }
          code { background: #eee; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>⚠️ Vulnerable Node.js Application</h1>
        <p><strong>Warning:</strong> This application contains intentional security vulnerabilities for testing purposes only. Do NOT deploy in production!</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/login</code>
          <p>SQL Injection vulnerable login. Try: <code>username: admin' OR '1'='1</code></p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span> <code>/search?q=term</code>
          <p>XSS vulnerable search. Try: <code>?q=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/ping</code>
          <p>Command Injection. Try: <code>{"host": "127.0.0.1; ls -la"}</code></p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span> <code>/download?file=name</code>
          <p>Path Traversal. Try: <code>?file=../../../etc/passwd</code></p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span> <code>/user/:id</code>
          <p>Insecure Direct Object Reference. Try different IDs.</p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/calculate</code>
          <p>Eval vulnerability. Try: <code>{"expression": "process.exit()"}</code></p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span> <code>/debug</code>
          <p>Information disclosure. Shows sensitive data.</p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/register</code>
          <p>Mass assignment vulnerability.</p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/brute-force-me</code>
          <p>No rate limiting. Perfect for brute force testing.</p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span> <code>/update-config</code>
          <p>Prototype pollution vulnerability.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🔓 Vulnerable app running on http://localhost:${PORT}`);
  console.log(`⚠️  WARNING: This app contains intentional vulnerabilities!`);
  console.log(`⚠️  Do NOT use in production or expose to the internet!`);
});

