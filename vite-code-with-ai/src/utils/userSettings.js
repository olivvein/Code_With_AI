export const userSettings = [
    {"name": "open-ai-voice", "default": "alloy","description": "Voice to use for text-to-speech","value":""},
    {"name": "open-ai-speech-language", "default": "English","description": "Speech language for text-to-speech","value":""},
    {"name": "open-ai-api-key", "default": "","description": "API key for OpenAI","value":""},
    {"name":"prompt-template","default":0,"description":"Template for the prompt to send to OpenAI","value":""},
    {"name":"use-liteLLM","default":false,"description":"Use the liteLLM proxy to use LLM locally","value":""},
    {"name":"liteLLM-url","default":"http://localhost:4000","description":"URL for the liteLLM proxy","value":""},
    {"name":"liteLLM-model","default":"","description":"Model to use for liteLLM","value":""},
    {"name":"use-anthropic-proxy","default":false,"description":"Use the Anthropic proxy to use Anthropic from your local machine","value":""},
    {"name":"anthropic-url","default":"http://localhost:4001","description":"URL for the Anthropic proxy","value":""},
    {"name":"anthropic-model","default":"","description":"Model to use for liteLLM","value":""},
    {"name":"use-file-server","default":false,"description":"Use the file server to serve files from your local machine","value":""},
    {"name":"file-server-url","default":"http://localhost:4002","description":"URL for the file server","value":""},
];

export const getUserSetting = (name) => {
    const setting= userSettings.find(setting => setting.name === name);
    if(setting){
        if(setting.value === ""){
            setting.value = setting.default;
        }
        return setting;
    }else{
        return null;
    }
}

export const setUserSetting = (name, value) => {
    const setting = getUserSetting(name);
    if(setting){
        setting.value = value;
    }
}   



