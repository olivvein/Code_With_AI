const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const excludedCode = ['import os', 'import sys', 'subprocess'];

app.post('/run-python', (req, res) => {
    const code = req.body.code;
    const filePath = 'temp_script.py';

    // Basic security check to prevent dangerous imports
    if (excludedCode.some(excludedCode => code.includes(excludedCode))) {
        return res.status(400).send('Code not allowed for security reasons');
    }

    fs.writeFileSync(filePath, code, (err) => {
        if (err) {
            console.error(`File write error: ${err}`);
            return res.status(500).send(`File write error: ${err.message}`);
        }
    });

    exec(`python ${filePath}`, (error, stdout, stderr) => {
        fs.unlinkSync(filePath); // Clean up the temporary file
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send({Error: error.message});
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send({error:stderr});
        }
        console.log(`Stdout: ${stdout}`);
        res.send({result:stdout});
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});