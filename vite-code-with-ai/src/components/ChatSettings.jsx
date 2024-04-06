import React, { useState } from "react";




const ChatSettings = ({
  chatProvider,
  setChatProvider,
  ollamaConfig,
  setOllamaConfig,
  openAiCongig,
  setOpenAiCongig,
  ollamaAvailable,
  setApiKeyVal,
  apiKey,
  resetApiKey,
  anthropicAvailable,
  setSystemPromptVal,
  selectedPrompt,
  prompts,
}) => {
  return (
    <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark flex flex-col items-center justify-center">
      <div className="flex flex-col w-full max-h-3/4 items-center justify-center overflow-y-scroll">
        <h1 className="text-4xl font-semibold dark:text-light text-dark">
          Chat Settings
        </h1>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold dark:text-light text-dark">
              Chat Provider
            </h2>
            <select
              value={chatProvider}
              onChange={(e) => setChatProvider(e.target.value)}
              className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
            >
              <option value="openai">OpenAI</option>
              {anthropicAvailable && (
                <option value="anthropic">Anthropic</option>
              )}
              {ollamaAvailable && <option value="ollama">LiteLLM</option>}
              <option value="puter">Puter</option>
            </select>
          </div>
          {chatProvider === "ollama" && (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold dark:text-light text-dark">
                Ollama Config
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setOllamaConfig({ ...ollamaConfig, baseURL: e.target.value });
                }}
              >
                <input
                  className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
                  placeholder="Base URL"
                />
              </form>
              <select
                value={ollamaConfig.selectedModel}
                onChange={(e) =>
                  setOllamaConfig({
                    ...ollamaConfig,
                    selectedModel: e.target.value,
                  })
                }
                className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
              >
                {ollamaConfig.models.map((model, index) => (
                  <option key={index} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {chatProvider === "openai" && (
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold dark:text-light text-dark">
                OpenAI Config
              </h2>
              {apiKey === "" && (
                <input
                  value={apiKey}
                  onChange={setApiKeyVal}
                  className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
                  placeholder="OpenAI API Key"
                />
              )}
              {apiKey !== "" && (
                <>
                  <select
                    value={openAiCongig.selectedModel}
                    onChange={(e) =>
                      setOpenAiCongig({
                        ...openAiCongig,
                        selectedModel: e.target.value,
                      })
                    }
                    className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
                  >
                    {openAiCongig.models.map((model, index) => (
                      <option key={index} value={model.id}>
                        {model.id}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={resetApiKey}
                    className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
                  >
                    Reset API Key
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold dark:text-light text-dark">
            Prompts
          </h2>
          <select
            value={selectedPrompt}
            onChange={setSystemPromptVal}
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
          >
            {prompts.map((prompt, index) => (
              <option key={index} value={index}>
                {prompt.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
