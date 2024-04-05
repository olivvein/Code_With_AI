import React, { useState ,useEffect} from 'react';
let puter=window.puter;
const SpeechToText = ({name}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [language, setLanguage] = useState("en-US");

    const [apiKey, setApiKey] = useState("");
  useEffect(() => {
    const getOpenaiApiKey = async () => {
    const openai_api_key = await puter.kv.get("openai_api_key");

      if (openai_api_key) {
        setApiKey(openai_api_key);
      }
    }
    getOpenaiApiKey();
    }, []);
  
    const handleStartRecording = async () => {
        if(!apiKey){
            alert("Please set your OpenAI API key");
            return;
        }
      setIsRecording(true);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          const audioChunks = [];
  
          mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
          });
  
          mediaRecorder.addEventListener("stop", async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
  
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');
            formData.append('model', 'whisper-1');
            formData.append('response_format', 'text');
            formData.append('language', language);
  
            try {
              const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                },
                body: formData,
              });
  
              if (response.ok) {
                const data = await response.text();
                console.log(data);
                setTranscription(data);
              } else {
                console.error('Error:', response.statusText);
              }
            } catch (error) {
              console.error('Error:', error);
            }
  
            setIsRecording(false);
          });
  
          setTimeout(() => {
            mediaRecorder.stop();
          }, 5000); // Record for 5 seconds
        });
    };
  
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl mb-4">Voice Transcription App</h1>
        <select
          className="mb-4"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
        
        </select>
        <button
          className={`px-4 py-2 rounded-full font-bold ${isRecording ? "bg-red-600" : "bg-blue-600"}`}
          onClick={handleStartRecording}
          disabled={isRecording}
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        {transcription && <p className="mt-4">Transcription: {transcription}</p>}
      </div>
    );
  };

export default SpeechToText;