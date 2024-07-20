import express from "express";
import cors from "cors";
import OpenAI from "openai";

const openai = new OpenAI();

const app = express();
app.use(cors());
app.use(express.json()); // Ajout du middleware pour analyser les corps de requête JSON

const chatOptionsTest = {
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpfull assistant" },
    { role: "user", content: "Hello!" },
  ],
  stream: true,
};

app.post("/stream", async (req, res) => {
  // Changement de GET à POST
  const { chatOptions } = req.body; // Extraction des données du corps de la requête
  console.log(chatOptions);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const completion = await openai.chat.completions.create(
    chatOptions
  );

  for await (const chunk of completion) {
    if (chunk.choices[0].finish_reason === "stop") {
      res.end();
    } else {
      res.write(chunk.choices[0].delta.content);
    }
  }
});

app.get("/health", (req, res) => {
  // Nouvelle route /health
  res.send("openai-proxy");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
