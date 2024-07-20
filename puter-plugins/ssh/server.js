const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const excludedCommands = ['rm', 'shutdown', 'reboot'];

app.post('/run-command', (req, res) => {
    const command = req.body.command;

    // Basic security check to prevent dangerous commands
    if (excludedCommands.some(excludedCommand => command.includes(excludedCommand))) {
        return res.status(400).json({error:'Command not allowed for security reasons'});
    }
    console.log(`Running command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({error: error.message});
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({error: stderr});
        }
        console.log(`Stdout: ${stdout}`);
        res.json({results:stdout});
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});