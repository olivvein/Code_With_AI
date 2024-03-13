//appTitle: Stream Display App

import React, { useEffect, useState } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';
import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1/',

  // required but ignored
  apiKey: 'ollama',
  dangerouslyAllowBrowser: true
})
twindSetup();

const StreamDisplayApp = () => {
  const [data, setData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataStream = async () => {
      try {
        // Simulating fetching a stream (This URL doesn't return a stream in reality).
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("response ok")
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        let result = '';
        reader.read().then(function processText({ done, value }) {
          if (done) {
            const theData=JSON.parse(result)
            console.log(theData);
            setData(theData.models);
            setIsLoading(false);
            return;
          }
          result += decoder.decode(value, { stream: true });
          reader.read().then(processText);
        });

      } catch (e) {
        setIsLoading(false);
        setError(e.message);
      }
    };

    fetchDataStream();
  }, []);

  const [fullMessage,setFullMessage]=useState("");

  const sendMessage= async ()=>{
    const stream = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'dolphin-mistral:latest',
      stream:true
    });

    let fullResponse="";
      for await (const chunk of stream) {
        const theChunk = chunk.choices[0]?.delta?.content;
        if (theChunk != undefined) {
            //console.log(theChunk);
            fullResponse=fullResponse+theChunk;
          setFullMessage((prev) => prev + theChunk);
        }
      }

    
  }

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div className="text-black w-full h-full">
      {data.map((tag) => (
        <div key={tag.id} className="text-white bg-black p-4 m-4">
          <h2 className="text-2xl font-bold" onClick={sendMessage}>{tag.name} </h2>
        </div>
      ))}
      <div>{fullMessage}</div>
    </div>
  );
};

ReactDOM.render(<StreamDisplayApp />, document.getElementById('app'));
