const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

const myBearerToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYXBwLXVuZGVyLXVzZXIiLCJ2ZXJzaW9uIjoiMC4wLjAiLCJ1c2VyX3VpZCI6IjBiMjI2ZTBhLTk0NzktNDAwZi1iMDU1LTBkY2E2NzlhM2JjNSIsImFwcF91aWQiOiJhcHAtMGY4NDM1ZDYtMDRiYi01OWYwLWEyMjQtYTdmNDZhYmZkODBhIiwiaWF0IjoxNzEyMDQxMzk0fQ.qMF1M4a2YIqFGCkeBKMsaY2WPTt72bHIYUPORn3jl6I";


app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log(token)

    if (token!=myBearerToken) {
      return res.status(403).json({ error: 'Forbidden' });
    }


    // Vérifiez le token ici (par exemple, avec jwt.verify si vous utilisez JSON Web Tokens)
    // Si le token est valide, appelez next(), sinon renvoyez une erreur

    next();
  } else {
    res.status(401).json({ error: 'Authorization header missing' });
  }
});


// Endpoint to check health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok',app:"localFileServer" });
});

// Endpoint to read directory
app.get('/api/dir', (req, res) => {
  const dirPath = req.query.path;
  
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const fileDetails = files.map(file => {
        const filePath = path.join(dirPath, file);
        return {
            name: file,
            isDirectory: fs.statSync(filePath).isDirectory()
        };
    });

    res.json({ files: fileDetails });
  });
});

// Endpoint to read file content
app.get('/api/file', (req, res) => {
  const filePath = req.query.path;
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json({ content: data });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
