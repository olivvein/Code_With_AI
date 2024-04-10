import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json()); // Ajout du middleware pour analyser les corps de requête JSON

const client = new Anthropic();

app.post('/stream', async (req, res) => { // Changement de GET à POST
    const { message, systeme } = req.body; // Extraction des données du corps de la requête

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await client.messages.stream({
        messages: [{role: "user", content: message}], // Utilisation des données du corps de la requête
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        system:systeme,
    }).on('text', (text) => {
        res.write(`${text}`);
    }).on('end', () => {
        console.log("fini");
        res.end();
    });
});

app.get('/health', (req, res) => { // Nouvelle route /health
    res.send('anthropic-proxy');
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});