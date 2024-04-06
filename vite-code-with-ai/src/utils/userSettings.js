export const userSettings = [
    {"name": "open-ai-voice", "default": "alloy","description": "Voice to use for text-to-speech"},
    {"name": "open-ai-speech-language", "default": "English","description": "Speech language for text-to-speech"},
    {"name": "open-ai-api-key", "default": "","description": "API key for OpenAI"},
    {"name":"prompt-template","default":0,"description":"Template for the prompt to send to OpenAI"},
    {"name":"use-liteLLM","default":false,"description":"Use the liteLLM proxy to use LLM locally"},
    {"name":"liteLLM-url","default":"http://localhost:4000","description":"URL for the liteLLM proxy"},
    {"name":"liteLLM-model","default":"","description":"Model to use for liteLLM"},
    {"name":"use-anthropic-proxy","default":false,"description":"Use the Anthropic proxy to use Anthropic from your local machine"},
    {"name":"anthropic-url","default":"http://localhost:4001","description":"URL for the Anthropic proxy"},
    {"name":"anthropic-model","default":"","description":"Model to use for liteLLM"},
    {"name":"use-file-server","default":false,"description":"Use the file server to serve files from your local machine"},
    {"name":"file-server-url","default":"http://localhost:4002","description":"URL for the file server"},
];

