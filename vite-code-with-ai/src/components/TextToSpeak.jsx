//appTitle: Text-to-Speech App
import React, { useState, useEffect, useRef } from "react";

let puter=window.puter;
const TextToSpeak = ({name}) => {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef(null);
  const [voice, setVoice] = useState("alloy");
  const [apiKey, setApiKey] = useState("");

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  useEffect(() => {
    const getOpenaiApiKey = async () => {
    const openai_api_key = await puter.kv.get("openai_api_key");

      if (openai_api_key) {
        setApiKey(openai_api_key);
      }
    }
    getOpenaiApiKey();
    }, []);

  const handleGenerateAudio = async () => {
    try {
        if (!apiKey) {
          alert("Please set your OpenAI API key");
          return;
        }
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Text-to-Speech App</h1>
        <select
            className="w-64 p-2 mb-4 border border-gray-300 rounded"
            value={voice}
            onChange={(event) => setVoice(event.target.value)}
        >
            <option value="alloy">Alloy</option>
            <option value="echo">Echo</option>
            <option value="fable">Fable</option>
            <option value="onyx">Onyx</option>
            <option value="nova">Nova</option>
            <option value="shimmer">Shimmer</option>
        </select>
            
      <textarea
        className="w-64 h-32 p-2 mb-4 border border-gray-300 rounded"
        value={text}
        onChange={handleTextChange}
        placeholder="Enter text to generate speech"
      />
      <button
        className="px-4 py-2 mb-4 bg-blue-600 text-white rounded"
        onClick={handleGenerateAudio}
      >
        Generate Audio
      </button>
      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};

export default TextToSpeak;

