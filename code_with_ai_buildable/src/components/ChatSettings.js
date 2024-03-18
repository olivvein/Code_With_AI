
import React from "react";

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
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
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
              {anthropicAvailable && <option value="anthropic">Anthropic</option>}
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
                {ollamaConfig.models.map((model) => (
                  <option value={model.id}>{model.id}</option>
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
                    {openAiCongig.models.map((model) => (
                      <option value={model.id}>{model.id}</option>
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
      </div>
    </div>
  );
};

export default ChatSettings;