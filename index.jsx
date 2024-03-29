//appTitle: Draggable Divs App with Blur Effect

import React, { useState, useEffect, useRef } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from "https://cdn.skypack.dev/twind/shim";
import * as Space from "https://esm.sh/react-spaces";
import Draggable from "https://esm.sh/react-draggable";

import Editor from "https://esm.sh/@monaco-editor/react";
import * as Babel from "https://esm.sh/@babel/standalone";
import OpenAI from "https://esm.sh/openai";
import { transform as transform } from "https://esm.sh/sucrase";
//import Markdown from "https://esm.sh/react-markdown@9";

import Markdown from "https://esm.sh/markdown-to-jsx";
import remarkGfm from "https://esm.sh/remark-gfm";

twindSetup({
  darkMode: "media",
  theme: {
    extend: {
      backgroundColor: {
        dark: "#111827",
        light: "#d4d4d4",
      },
      textColor: {
        light: "#d4d4d4",
        dark: "#111827",
      },
      borderColor: {
        light: "#d4d4d4",
        dark: "#111827",
      },
      animation: {
        fade: "fadeOut 5s ease-in-out",
        appear: "fadeIn 0.2s ease-in-out",
      },

      // that is actual animation
      keyframes: (theme) => ({
        fadeOut: {
          "0%": { opacity: "100%" },
          "100%": { opacity: "0%" },
        },
        fadeIn: {
          "0%": { opacity: "0%" },
          "100%": { opacity: "100%" },
        },
      }),
    },
  },
  preflight: {
    ".cursors-layer > .monaco-mouse-cursor-text": {
      position: "absolute !important",
      //color: 'black !important',
      //'background-color':'white',
    },
    ".cursors-layer >  .monaco-mouse-cursor-text::before": {
      content: '""',
      position: "absolute",
      left: "0",
      top: "0",
      bottom: "0",
      width: "1px",
      backgroundColor: "white",
    },
  },
});

const GuideView = ({ setShowGuideView }) => {
  const SnippetView = ({ children, ...props }) => {
    const isJsx =
      children.indexOf("import ") != -1 || children.indexOf("const ") != -1
        ? "jsx"
        : "html";
    return (
      <>
        <div
          {...props}
          className="flex flex-col  dark:bg-black bg-white  rounded-lg"
        >
          <span className="w-full top-0 px-4 bg-gray-600 rounded-t-lg flex justify-between">
            <span>{isJsx}</span>
            <span>copy</span>
          </span>
          <span className="w-full p-4 overflow-scroll">{children}</span>
        </div>
      </>
    );
  };
  const LiView = ({ children, ...props }) => (
    <>
      {" "}
      - {children}
      <br></br>
    </>
  );

  const TheH4 = ({ children, ...props }) => (
    <div className="mt-4">{children}</div>
  );

  const guideMessage = `# User Guide
## Code Editor
- Based on Monaco editor (Vs Code) 
- Same shortcut
- Multiple cursor
- Syntax Highliting


  
You don't need to install any dependencies
Simply add it like normaly. In the Babel transpile, all import are appended with "https://esm.sh" which host a ton of ES6 modules

### 3 Files : 

- html : the html template where react components are injected
- javascript : the react/javascript code
- Babel : The Executed Code transpiled from React (jsx) to js. Don't modify it as it has no effect. It is just a representation of the transpiled jsx code.
## App Preview
- Each time the code is modified, the app preview is updated


## SaveAs

- Enter a Name and the project will be saved on App folder
- A message pop up wen it is successfull (2-10 sec)

## Deploy

- Enter a Name and the project deployed as an App 
- A message pop up wen it is successfull (2-10 sec)


## Chat Settings

Select your language model : 

- puter : gpt-3.5-turbo, no streaming, free
- openAi : every model available, streaming, require api key. The api key is stored in puter kv field openai_api_key. Only the app has access.
- liteLLM : every model avaliable on litellm[proxy], streaming.


## Chat View

- Enter to submit message
- Shift+Enter to create a new line
- You can ask the AI what you want to build.
- If you have specific libraries in mind just tell it.
- When you press play, Crazy Typing Cat Appears to let you now that the AI is working
- At the end of the generation , Crazy Typing Cat dissapear, The App Preview is updated with the new code and the message history is shown.
- The AI remember past message in the same session so you can ask "Make a cool clock app" Then when it's done "Perfect, add a color background animation to it"

When the code is not working and it will happen, it might be several issue : 

- Code is not completed
- twindSetup() is not instanciated, just add it after import of tailwind
- On the console, check the errors, AI often hallucinate a package that does everything perfectly like 

\`\`\`
import {TripleAGame} from "https://esm.sh/triple-a-game"
\`\`\`


## Prompt ingenering

The AI is told to be an excellent React Developper
It has been provided with several free api url like :

\`\`\`
https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true=> "current_weather"

https://api.coingecko.com/api 

https://api.multiversx.com/economics?extract=price for EGLD=> "price"

https://www.francetvinfo.fr/titres.rss => entries "title" and "summary" and "links[0] as href " and "links[1] as image " For the News with feedparser library

\`\`\`


#### You can provide it more in the message in the same way.

If you want to make an interactive game, ask it to use p5.js
Try using Three.js for 3d graphics (puter ai is not that good for it)






## Console
a simple javascript console view that show console.log and console.error (in red)

- require to use JSON.stringify to show objects as it display a string on the console



 ## LiteLLM

 LiteLLM can let you access a lot of llm
 
 - Free : ollama => llama, dolphin-mixtral, mistral, ....
 - Paid : Anthropic Claude, Google AI, Hugginface, Mistral

 install litellm and litellm[proxy]

\`\`\`sh
pip install litell litellm[proxy]
\`\`\`

#### create a config.yaml file like:

\`\`\`yaml
model_list: 
  - model_name: ollama/dolphin-mistral
    litellm_params:
      model: ollama/dolphin-mistral
  - model_name: ollama/phi
    litellm_params:
      model: ollama/phi
  - model_name: claude-3-opus-20240229
    litellm_params:
      model: claude-3-opus-20240229
      api_key: sk-****************
\`\`\`

#### run litellm[proxy]

\`\`\`sh
litellm --config config.yaml

\`\`\`

#### It should be running on port 4000

  `;

  return (
    <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light dark:text-light text-dark bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div className="w-3/4 h-3/4 opacity-100 border flex flex-col rounded-lg  overflow-y-hidden justify-between">
        <span className="w-full top-0  bg-gray-600 rounded-t-lg flex justify-between">
          <button
            onClick={() => {
              setShowGuideView(false);
            }}
            className="w-1/4 dark:bg-dark bg-light border rounded-lg px-2"
          >
            About Me
          </button>
          <h1>User Guide</h1>
          <button
            onClick={() => {
              setShowGuideView(false);
            }}
            className="w-1/4 dark:bg-dark bg-light border rounded-lg px-2"
          >
            close
          </button>
        </span>
        <div className="w-full h-full overflow-y-scroll p-4">
          <Markdown
            options={{
              overrides: {
                h1: {
                  props: {
                    className: "text-lg font-bold py-2",
                  },
                },
                h2: {
                  props: {
                    className: "text-lg  py-2 underline",
                  },
                },
                h3: {
                  props: {
                    className: "text-md underline py-2",
                  },
                },
                h4: {
                  component: TheH4,
                  props: {
                    className: "py-2",
                  },
                },
                pre: {
                  props: {
                    className:
                      "dark:bg-black bg-white dark:text-light text-dark border rounded-lg  mt-3",
                  },
                },
                code: {
                  component: SnippetView,
                },
                li: {
                  component: LiView,
                },
              },
            }}
          >
            {guideMessage}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

const MarkDownView = ({ content, className }) => {
  const SnippetView = ({ children, ...props }) => {
    const isJsx =
      children.indexOf("import ") != -1 || children.indexOf("const ") != -1
        ? "jsx"
        : "html";
    return (
      <>
        <div
          {...props}
          className="flex flex-col  dark:bg-black bg-white  rounded-lg"
        >
          <span className="w-full top-0 px-2 bg-gray-600 rounded-t-lg flex justify-between">
            <span>{isJsx}</span>
            <span>copy</span>
          </span>
          <span className="w-full p-4 overflow-scroll">{children}</span>
        </div>
      </>
    );
  };
  const LiView = ({ children, ...props }) => (
    <>
      {" "}
      - {children}
      <br></br>
    </>
  );

  const TheH4 = ({ children, ...props }) => (
    <div className="mt-4">{children}</div>
  );

  return (
    <Markdown
      className={className}
      options={{
        overrides: {
          h1: {
            props: {
              className: "text-lg font-bold py-2",
            },
          },
          h2: {
            props: {
              className: "text-lg  py-2 underline",
            },
          },
          h3: {
            props: {
              className: "text-md underline py-2",
            },
          },
          h4: {
            component: TheH4,
            props: {
              className: "py-2",
            },
          },
          pre: {
            props: {
              className:
                "dark:bg-black bg-white dark:text-light text-dark border rounded-lg  mt-3",
            },
          },
          code: {
            component: SnippetView,
          },
          li: {
            component: LiView,
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
};

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
                  //onChange={(e) => setOllamaConfig({ ...ollamaConfig, baseURL: e.target.value })}
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

//A 80% FullScreen center z-index: 50 modal form with
//  - a title
//  - a description
//  - a form with a submit button
//  - a cancel button
const DeployForm = ({
  appName,
  setAppNameVal,
  subdomain,
  setSubdomainVal,
  deploy,
  cancel,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light bg-opacity-50 flex items-center justify-center z-50">
      <div className="dark:bg-dark bg-light rounded-lg p-4">
        <h1 className="text-2xl font-semibold dark:text-light text-dark">
          Deploy
        </h1>
        <p className="dark:text-light text-dark">
          Deploy your app to a subdomain and create an app.
        </p>
        <form
          onSubmit={() => {
            deploy();
            cancel(false);
          }}
        >
          <input
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2">
            Deploy
          </button>
        </form>
        <button
          className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
          onClick={() => {
            cancel(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const SaveAsForm = ({ appName, setAppNameVal, saveAs, cancelSaveAs }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light bg-opacity-50 flex items-center justify-center z-50">
      <div className="dark:bg-dark bg-light rounded-lg p-4">
        <h1 className="text-2xl font-semibold dark:text-light text-dark">
          Save as
        </h1>
        <p className="dark:text-light text-dark">
          Save your project in a puter folder
        </p>
        <form
          onSubmit={(e) => {
            saveAs(e);
          }}
        >
          <input
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2">
            Save as
          </button>
        </form>
        <button
          className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
          onClick={() => {
            cancelSaveAs(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const LogSection = (name) => {
  return (
    <div className="w-full h-full bg-dark">
      <div className="dark:bg-dark bg-light w-full">Console</div>
      <pre
        className="opacity-50 bottom-12 w-full h-full dark:bg-dark bg-light dark:text-light text-dark"
        id="logs"
        style={{ overflow: "auto" }}
      ></pre>
    </div>
  );
};

function CustomIframe({
  jsCode,
  htmlCode,
  consoleLog,
  transpileJSX,
  messageFinished,
}) {

  const cats=["https://i.giphy.com/7NoNw4pMNTvgc.webp","https://c.tenor.com/y2JXkY1pXkwAAAAC/tenor.gif"]

  return (
    <>
      {messageFinished == 0 && (
        <img
          src="https://c.tenor.com/y2JXkY1pXkwAAAAC/tenor.gif"
          className="w-full h-full bg-dark"
        />
      )}
      {messageFinished == 1 && (
        <iframe
          className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark border dark:border-light border-dark rounded shadow-lg"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          srcDoc={
            jsCode === ""
              ? ""
              : messageFinished
              ? `<html>${htmlCode}<script src="https://js.puter.com/v2/"></` +
                `script><script type="module">const puter = window.puter;\n${transpileJSX(
                  jsCode
                )}<` +
                `/script><div class="fixed bottom-0"><pre class="fixed opacity-50 bottom-12 w-full dark:bg-dark bg-light dark:text-light text-dark" id="logs2"></pre></div><script>${consoleLog}</` +
                `script></html>`
              : ""
          }
        />
      )}
    </>
  );
}

const TheEditorJs = ({ handleEditorDidMount, jsCode, onChange, theme }) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"javascript"}
      defaultValue={jsCode}
      theme={theme}
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
        minimap: {
          enabled: true,
        },
        cursorStyle: "block",
      }}
    />
  );
};

const TheEditorHtml = ({ handleEditorDidMount, htmlCode, onChange, theme }) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"html"}
      defaultValue={htmlCode}
      theme={theme}
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
        minimap: {
          enabled: true,
        },
        cursorStyle: "block",
      }}
    />
  );
};

const TheEditorBabel = ({
  handleEditorDidMount,
  babelCode,
  onChange,
  theme,
}) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"javascript"}
      defaultValue={babelCode}
      theme={theme}
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
        minimap: {
          enabled: true,
        },
        cursorStyle: "block",
      }}
    />
  );
};

const CodeEditor = ({
  handleChange,
  selectedCode,
  appName,
  setAppNameVal,
  downloadCode,
  jsCode,
  htmlCode,
  handleEditorDidMountHtml,
  handleEditorDidMountJs,
  updateCodeValueJs,
  updateCodeValueHtml,
  updateCodeValueBabel,
  babelCode,
  handleEditorDidMountBabel,
  name,
}) => {
  const [theme, setTheme] = useState("vs-dark");

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const [themeOs, setThemeOs] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (mediaQuery.matches) {
        setTheme("vs-dark");
      } else {
        setTheme("vs");
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center p-4 dark:bg-dark bg-light ">
        <select
          onChange={handleChange}
          value={selectedCode}
          className="mx-4 py-2 px-3 bg-gray-700 dark:text-light text-dark rounded outline-none"
        >
          <option value="js">JavaScript</option>
          <option value="html">HTML</option>
          <option value="babel">Babel</option>
        </select>

        {selectedCode === "babel" && (
          <span>
            This is the Result javascript from the compilation. Modification are
            not effectives
          </span>
        )}

        <select
          onChange={handleThemeChange}
          value={theme}
          className="mx-4 py-2 px-3 bg-gray-700 dark:text-light text-dark rounded outline-none"
        >
          <option value="vs-dark">vs-dark</option>
          <option value="vs">vs</option>
          <option value="hc-black">hi-contrast</option>
        </select>
      </div>

      {selectedCode === "js" ? (
        <TheEditorJs
          handleEditorDidMount={handleEditorDidMountJs}
          jsCode={jsCode}
          onChange={updateCodeValueJs}
          theme={theme}
        />
      ) : selectedCode === "html" ? (
        <TheEditorHtml
          handleEditorDidMount={handleEditorDidMountHtml}
          htmlCode={htmlCode}
          onChange={updateCodeValueHtml}
          theme={theme}
        />
      ) : (
        <TheEditorBabel
          handleEditorDidMount={handleEditorDidMountBabel}
          htmlCode={babelCode}
          onChange={updateCodeValueBabel}
          theme={theme}
        />
      )}
    </>
  );
};

const ChatView = ({
  inputSubmit,
  inputMessage,
  setInputVal,
  messageFinished,
  fullMessage,
  chatMessages,
  resetChatMessages,
}) => {
  return (
    <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
      <div className="w-full h-full">
        <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
          <div className="w-full h-5/6 dark:bg-dark bg-light dark:text-light text-dark overflow-y-scroll">
            {chatMessages.map((message, index) => {
              if (message.role !== "system") {
                return (
                  <div key={index} className={`w-full overflow-y-scroll p-4`}>
                    <MarkDownView
                      content={
                        message.role == "user"
                          ? "# " + message.content
                          : message.content
                      }
                      className={` p-4 m-4 w-5/6 mx-2 px-2  opacity-100 overflow-y-scroll rounded  dark:text-light text-dark  ${
                        message.role === "assistant"
                          ? "dark:bg-red-800 bg-red-400"
                          : "dark:bg-blue-800 bg-blue-800"
                      }`}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 dark:bg-dark bg-light absolute bottom-0 w-full flex">
        <textarea
          type="text"
          rows={Math.max(inputMessage.split("\n").length, 2)}
          placeholder={`Make a weather app for Ales, France
          Make a btc graph , What are the news?
          `}
          className="bg-light text-dark ml-2 mb-2 h-3/4 w-full m-auto border dark:border-light border-dark rounded p-2 w-5/6"
          onKeyPress={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              inputSubmit(event);
            }
          }}
          value={inputMessage}
          onChange={setInputVal}
        />
        <button
          onClick={resetChatMessages}
          className="bottom-0 dark:bg-dark bg-light border dark:border-light border-dark hover:bg-gray-900 dark:text-light text-dark rounded mx-2 w-1/4"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
};

const NavBar = ({
  inputSubmit,
  setGptValue,
  gptVal,
  resetApiKey,
  visibleApiKey,
  username,
  inputMessage,
  setInputVal,
  chatProvider,
  setChatProvider,
  ollamaConfig,
  sendMenuAction,
}) => {
  const [openMenu, setOpenMenu] = useState("");
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const menuConfig = [
    {
      name: "File",
      subMenu: [
        { status: "active", name: "New", action: "new" },
        { status: "inactive", name: "Open", action: "open" },
        { status: "inactive", name: "Import", action: "import" },
        { status: "inactive", name: "Save", action: "save" },
        { status: "active", name: "Save As", action: "saveAs" },
        { status: "active", name: "Deploy", action: "deploy" },
      ],
    },
    {
      name: "Edit",
      subMenu: [
        { status: "inactive", name: "Undo", action: "undo" },
        { status: "inactive", name: "Copy", action: "copy" },
        { status: "inactive", name: "Cut", action: "cut" },
        { status: "inactive", name: "Paste", action: "paste" },
      ],
    },
    {
      name: "View",
      subMenu: [
        { status: "inactive", name: "Fullscreen", action: "fullscreen" },
        { status: "inactive", name: "Dark Mode", action: "darkMode" },
      ],
    },
    {
      name: "Help",
      subMenu: [
        { status: "inactive", name: "About Us", action: "aboutUs" },
        { status: "active", name: "User Guide", action: "userGuide" },
      ],
    },
  ];

  return (
    <nav className="absolute w-full top-0 left-0 dark:bg-dark bg-light dark:text-light text-dark top-0 px-0 h-5 flex   z-50">
      <div className=" w-full top-0 dark:bg-dark bg-light dark:text-light text-dark  px-0 flex justify-between">
        <div className="w-3/4 top-0 dark:bg-dark bg-light dark:text-light text-dark py-2 px-0">
          <span className="left-0 py-4 px-2">
            <span>
              <b>Code With Ai</b>
            </span>
            <span className="absolute left-0 top-6 text-sm px-2">
              By SamLePirate
            </span>
          </span>
          {menuConfig.map((menu, index) => (
            <div className="relative inline-block">
              <span
                tabIndex={index} // Makes the div focusable
                // Handles focus event
                onBlur={() => {
                  setTimeout(() => toggleMenu(menu.name), 100);
                }}
                className={`${
                  openMenu == menu.name ? "bg-gray-700" : ""
                } cursor-pointer pt-3 pb-2 px-2 active:bg-gray-700  hover:bg-gray-700 hover:shadow-lg rounded-lg`}
                onClick={() => toggleMenu(menu.name)}
              >
                {menu.name}
              </span>
              {openMenu === menu.name && (
                <div className="absolute left-0 mt-2 w-48 dark:bg-dark bg-light rounded-md animate-appear border border-gray-700 shadow-lg z-50 ">
                  {menu.subMenu.map((subMenu) => (
                    <button
                      className={`w-full text-left block px-4 py-2 border border-gray-700 text-sm text-gray-300 active:bg-gray-400 active:border-gray-700 active:text-dark transition-colors duration-100 ease-in-out hover:bg-gray-700 ${
                        subMenu.status == "inactive" ? "text-gray-600" : ""
                      }`}
                      onClick={() => {
                        setOpenMenu("");
                        sendMenuAction(subMenu.action);
                      }}
                    >
                      {subMenu.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="justify-end py-2 px-0">
          <span className="cursor-pointer cursor-pointer pt-3 pb-2 px-2  hover:bg-gray-700 hover:shadow-lg rounded-lg">
            {visibleApiKey}
            {username}
          </span>
        </div>
      </div>
    </nav>
  );
};

const DraggableUI = ({
  id,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  getDivContent,
  draggingId,
  divs,
}) => {
  return (
    <div
      key={id}
      className={`w-full h-full dark:bg-dark bg-light dark:text-light text-dark border dark:border-light border-dark flex flex-col rounded shadow-lg  ${
        draggingId === id ? "opacity-30" : "opacity-100"
      }`}
    >
      <span className="flex justify-center border dark:border-light border-dark">
        <button
          draggable
          onDragStart={(e) => onDragStart(e, id)}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, id)}
          className={`absolute left-0 top-0  border dark:border-light border-dark rounded-lg w-8 shadow-lg hover:bg-gray-400  ${
            draggingId === id ? "opacity-10" : "opacity-100"
          } ${
            draggingId !== id && draggingId
              ? "bg-red-700"
              : "dark:bg-dark bg-light"
          }`}
          style={{ cursor: "grab" }}
        >
          👋
        </button>
        <span className="">
          <span className="w-full flex justify-center">
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </span>
      </span>

      {getDivContent(id)}
    </div>
  );
};

const DraggableApp = () => {
  async function sendMessage(message) {
    setMessageFinished(false);
    setFullMessage("");
    try {
      if (chatProvider === "puter") {
        const newMessage = [
          ...chatMessages,
          { role: "user", content: message },
        ];
        newMessage[0].content = systemPrompt;
        console.log(newMessage);
        console.log("chat with puter");
        puter.ai.chat(newMessage).then((response) => {
          console.log(response.toString());
          setFullMessage(response.toString());
          setChatMessages([
            ...newMessage,
            { role: "assistant", content: response.toString() },
          ]);
          setMessageFinished(true);
        });

        return;
      }

      if (chatProvider === "ollama" && ollamaConfig.models.length > 0) {
        const newMessage = [
          ...chatMessages,
          {
            role: "user",
            content:
              message +
              "\nProvide only html and jsx snippet in Markdown.\n No explaination needed. Give me the 2 code snipet in markdown.",
          },
        ];
        newMessage[0].content = systemPrompt;
        console.log(newMessage);
        const ollama = new OpenAI({
          baseURL: ollamaConfig.baseURL,

          // required but ignored
          apiKey: "ollama",
          dangerouslyAllowBrowser: true,
        });

        newMessage.push({ role: "assistant", content: "..." });
        setChatMessages(newMessage);

        const stream = await ollama.chat.completions.create({
          messages: newMessage,
          model: ollamaConfig.selectedModel,
          stream: true,
          max_tokens: 4000,
        });

        let fullResponse = "";
        let snippetTagCount = 0;
        for await (const chunk of stream) {
          const theChunk = chunk.choices[0]?.delta?.content;
          if (theChunk != undefined) {
            //console.log(theChunk);
            fullResponse = fullResponse + theChunk;
            setFullMessage(fullResponse);
            // snippetTagCount += (fullResponse.match(/\`\`\`/g) || []).length;
            // if (snippetTagCount%2==1 && snippetTagCount>0) {

            //   newMessage[newMessage.length-1].content=fullResponse+"\`\`\`";
            // }
            // else{
            //   newMessage[newMessage.length-1].content=fullResponse;
            // }
            // setChatMessages(newMessage);
          }
        }
        console.log("Message Finished");
        console.log(fullResponse);
        newMessage.push({ role: "assistant", content: fullResponse });
        setChatMessages(newMessage);
        setMessageFinished(true);
        return;
      }

      if (chatProvider === "anthropic") {
        const newMessage = [
          ...chatMessages,
          {
            role: "user",
            content:
              message +
              "\nProvide only html and jsx snippet in Markdown.\n No explaination needed. Give me the 2 code snipet in markdown.",
          },
        ];
        newMessage[0].content = systemPrompt;
        console.log(newMessage);

        newMessage.push({ role: "assistant", content: "..." });
        setChatMessages(newMessage);
        const response = await fetch("http://localhost:3002/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: message, systeme: systemPrompt }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullResponse = "";
        reader.read().then(function processText({ done, value }) {
          if (done) {
            console.log("Stream complete");
            setFullMessage(fullResponse);
            setMessageFinished(true);
            newMessage.push({ role: "assistant", content: fullResponse });
            setChatMessages(newMessage);
            return;
          }

          const chunk = decoder.decode(value);
          fullResponse = fullResponse + chunk;
          setFullMessage(fullResponse);
          setFullMessage((prev) => prev + chunk);
          reader.read().then(processText);
        });
      }

      if (chatProvider === "openai" && apiKey !== "") {
        const newMessage = [
          ...chatMessages,
          { role: "user", content: message },
        ];
        newMessage[0].content = systemPrompt;
        console.log(newMessage);
        const openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true, // This is the default and can be omitted
        });
        newMessage.push({ role: "assistant", content: "..." });
        setChatMessages(newMessage);
        const stream = await openai.chat.completions.create({
          model: openAiCongig.selectedModel,
          messages: newMessage,
          stream: true,
        });

        let fullResponse = "";
        let snippetTagCount = 0;

        for await (const chunk of stream) {
          const theChunk = chunk.choices[0]?.delta?.content;
          if (theChunk != undefined) {
            //console.log(theChunk);
            fullResponse = fullResponse + theChunk;

            //count the number of snippet tag
            // snippetTagCount += (fullResponse.match(/\`\`\`/g) || []).length;
            // if (snippetTagCount%2==1 && snippetTagCount>0) {
            //   setFullMessage((prev) => prev + theChunk+"\`\`\`");
            // }

            setFullMessage((prev) => prev + theChunk);

            snippetTagCount += (fullResponse.match(/\`\`\`/g) || []).length;
            if (snippetTagCount % 2 == 1 && snippetTagCount > 0) {
              newMessage[newMessage.length - 1].content = fullResponse + "";
            } else {
              newMessage[newMessage.length - 1].content = fullResponse;
            }
            setChatMessages(newMessage);
          }
        }
        console.log("Message Finished");
        console.log(fullResponse);
        newMessage[newMessage.length - 1].content = fullResponse;
        setChatMessages(newMessage);
        setMessageFinished(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const extractCodeSnippets = (markdownContent) => {
    const codeSnippets = [];
    const codeString = "\`\`\`";
    const codeBlockRegex = new RegExp(
      `${codeString}(jsx|tsx|js|html)\n([\\s\\S]*?)${codeString}\n`,
      "g"
    );
    let match;
    const completed = [];

    while ((match = codeBlockRegex.exec(markdownContent))) {
      const [fullMatch, language, code] = match;
      const status =
        fullMatch.length === match[0].length ? "completed" : "partial2";
      completed.push(language);
      codeSnippets.push({
        language,
        code,
        status,
      });
    }

    // Check for a partial code snippet at the end of the file
    const partialCodeRegex = new RegExp(
      `${codeString}(jsx)\n([\\s\\S]*)(?!${codeString})`
    );
    const partialMatch = partialCodeRegex.exec(markdownContent);

    if (partialMatch) {
      const [, language, code] = partialMatch;
      if (completed.indexOf(language) == -1) {
        codeSnippets.push({
          language,
          code,
          status: "partial",
        });
      }
    }

    return codeSnippets;
  };

  function transformImports(code) {
    const regex =
      /import\s+((\*\s+as\s+\w+)|(\{\s[^}]+\s\})|(\w+))\s+from\s+"([^"]+)";/g;
    code = code.replace('from "react"', 'from "https://esm.sh/react"');
    return code.replace(regex, (match, p1, p2, p3, p4, p5) => {
      if (!p5.startsWith("https")) {
        return `import ${p1} from "https://esm.sh/${p5.replace(/@/g, "")}";`;
      }
      return match;
    });
  }
  function transformImports2(code) {
    const regex =
      /import\s+((\*\s+as\s+\w+)|(\{\s[^}]+\s\})|(\w+))\s+from\s+'([^']+)';/g;
    code = code.replace('from "react"', 'from "https://esm.sh/react"');
    return code.replace(regex, (match, p1, p2, p3, p4, p5) => {
      if (!p5.startsWith("https")) {
        return `import ${p1} from "https://esm.sh/${p5.replace(/@/g, "")}";`;
      }
      return match;
    });
  }

  function transpileJSX(jsxCode) {
    jsxCode = transformImports(jsxCode);
    jsxCode = transformImports2(jsxCode);
    jsxCode = jsxCode.replace(/\`\`\`/g, "");

    try {
      const result = transform(jsxCode, {
        transforms: ["typescript", "jsx"],
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      });

      //console.log(result);
      jsxCode = result.code;
      const newCode = Babel.transform(jsxCode, {
        presets: ["react"],
      }).code;

      setBabelCode(newCode);
      editorBabelRef.current?.setValue(newCode);
      return newCode;
    } catch (error) {
      //console.error('Erreur de syntaxe dans le code JavaScript :', error);
      // Vous pouvez également afficher un message d'erreur à l'utilisateur ici
      setBabelCode(`Error In JSX ${error}`);
      editorBabelRef.current?.setValue(`Error In JSX ${error}`);
      return jsxCode;
    }
  }

  function updateCodeValueJs(value, event) {
    setJsCode(value);
  }

  function updateCodeValueHtml(value, event) {
    setHtmlCode(value);
  }

  function updateCodeValueBabel(value, event) {
    setBabelCode(value);
  }

  function handleEditorDidMountJs(editor, monaco) {
    //console.log("mount");
    editorJsRef.current = editor;
    editorJsRef.current?.setValue(jsCode);
  }

  function handleEditorDidMountHtml(editor, monaco) {
    //console.log("mount");
    editorHtmlRef.current = editor;
    editorHtmlRef.current?.setValue(htmlCode);
  }

  const [babelCode, setBabelCode] = useState("");

  function handleEditorDidMountBabel(editor, monaco) {
    //console.log("mount");
    editorBabelRef.current = editor;
    editorBabelRef.current?.setValue(babelCode);
  }

  function handleChange(event) {
    setSelectedCode(event.target.value);
    //editorJsRef.current?.setValue(jsCode);
    //editorHtmlRef.current?.setValue(htmlCode);
  }

  const saveFullCode = (htmlCode, jsCode) => {
    let fullCode =
      `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodepAIn</title>
    
  </head>
  
    ${htmlCode}
    <script src="https://js.puter.com/v2/"></` +
      `script>
    <script type="module">
    const puter = window.puter;\n
      ${transpileJSX(jsCode)}
    </` +
      `script>
  
  </html>`;
    //console.log(fullCode);
    return fullCode;
  };

  const makeAppFile = () => {
    let code = "";
    if (appName == "") {
      alert("No App Name");
      return;
    }
    code = saveFullCode(htmlCode, jsCode);
    return code;
  };

  const downloadCode = () => {
    let code = "";
    if (appName == "") {
      alert("No App Name");
      return;
    }
    code = saveFullCode(htmlCode, jsCode);
    (async () => {
      const visibleAppName = appName.replace(/ /g, "_");
      // (1) Create a number of key-value pairs
      let dirName = puter.randName();
      await puter.fs.mkdir(dirName);

      // (2) Create 'index.html' in the directory with the contents "Hello, world!"
      await puter.fs.write(`${dirName}/index.html`, code);

      // (3) Host the directory under a random subdomain
      let subdomain = puter.randName();
      const site = await puter.hosting.create(subdomain, dirName);

      console.log(
        `Website hosted at: <a href="https://${site.subdomain}.puter.site" target="_blank">https://${site.subdomain}.puter.site</a>`
      );

      const appList = await puter.apps.list();
      //document.write(`<pre>${JSON.stringify(appList).split(",").join("\n")}</pre>`);

      try {
        const appData = {
          name: visibleAppName,
          indexURL: `https://${site.subdomain}.puter.site`,
          title: appName,
          description: "This is an example app.",
          maximizeOnStart: true,
        };
        const response = await puter.apps.create(appData);
        console.log(
          "App created:",
          JSON.stringify(response).split(",").join("\n")
        );
        alert("App created : Success");
      } catch (error) {
        alert("App created : Error");
        console.log(
          "Failed to create app:",
          JSON.stringify(error).split(",").join("\n")
        );
      }
    })();
    return;
    console.log(code);
    console.log(document);
    const element = document.createElement("a");
    const file = new Blob([code], {
      type: "text/html",
    });
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element); // Required for this to work in FireFox
    try {
      element.click();
    } catch (error) {
      console.log(error);
    }
  };

  const setGptValue = (e) => {
    setGptVal(!gptVal);
    console.log(e.target.value);
  };

  const resetApiKey = (e) => {
    puter.kv.del("openai_api_key").then((success) => {
      console.log("deleted");
      setApiKey("");
    });
  };

  const inputSubmit = (e) => {
    //e.preventDefaults();
    setInputMessage("");
    sendMessage(inputMessage);
    console.log(inputMessage);
  };
  const setInputVal = (e) => {
    setInputMessage(e.target.value);
  };

  const setApiKeyVal = (e) => {
    puter.kv.set("openai_api_key", e.target.value).then((success) => {
      console.log("api Key updated");
    });
    setApiKey(e.target.value);
  };

  const setAppNameVal = (e) => {
    setAppName(e.target.value);
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
    setDraggingId(id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetId) => {
    const draggedId = parseInt(e.dataTransfer.getData("id"));
    const newDivs = divs
      .map((div) => {
        if (div.id === draggedId) return { ...div, id: targetId };
        if (div.id === targetId) return { ...div, id: draggedId };
        return div;
      })
      .sort((a, b) => a.id - b.id);
    setDivs(newDivs);
    setDraggingId(null);
  };

  const getDivContent = (id) => {
    const div = divs.find((div) => div.id === id);
    return div.content;
  };

  const sendMenuAction = (action) => {
    console.log(action);
    if (action === "deploy") {
      setShowDeployForm(true);
    }
    if (action === "new") {
      setJsCode("");
      setHtmlCode("");
      editorHtmlRef.current?.setValue("");
      editorJsRef.current?.setValue("");
    }

    if (action === "saveAs") {
      setShowSaveAsForm(true);
    }

    if (action === "userGuide") {
      setShowGuideView(true);
    }
  };

  const saveAs = (e) => {
    e.preventDefault();
    setShowSaveAsForm(false);
    if (appName == "") {
      alert("No App Name");
      return;
    }
    const appFile = makeAppFile();
    let dirName = appName;
    puter.fs
      .mkdir(dirName, { dedupeName: true })
      .then((directory) => {
        console.log(`"${dirName}" created at ${directory.path}`);
        console.log(dirName);
        console.log(directory.path);
        puter.fs
          .write(`${dirName}/app.js`, jsCode)
          .then(() => {
            console.log("app.jsx written successfully");
            puter.fs
              .write(`${dirName}/app.html`, htmlCode)
              .then(() => {
                console.log("app.html written successfully");
                puter.fs
                  .write(`${dirName}/index.html`, appFile)
                  .then(() => {
                    console.log("index.html written successfully");
                    alert("App succesfully saved on " + directory.path);

                    puter.fs
                      .readdir("./")
                      .then((items) => {
                        // print the path of each item in the directory
                        console.log(items.map((item) => item.name));
                      })
                      .catch((error) => {
                        puter.print(`Error reading directory: ${error}`);
                      });
                  })
                  .catch((error) => {
                    console.log("Error writing file:", error);
                  });
              })
              .catch((error) => {
                console.log("Error writing file:", error);
              });
          })
          .catch((error) => {
            console.log("Error writing file:", error);
          });
      })
      .catch((error) => {
        console.log("Error creating directory:", error);
      });
  };

  const resetChatMessages = () => {
    setChatMessages([{ role: "system", content: systemPrompt }]);
  };

  const [username, setUsername] = useState("Guest");
  const todayString = new Date().toDateString();
  const timeToHumanStringInFrance = (time) => {
    const date = new Date(time);
    return date.toLocaleString("fr-FR");
  };

  const [draggingId, setDraggingId] = useState(null);

  const [appName, setAppName] = useState("");

  const [gptVal, setGptVal] = useState(0);

  const ContextInfos = `
  Today is ${todayString}.
  The time is ${timeToHumanStringInFrance(Date.now())} in France.
  The user is ${username}.
  `;

  const systemPrompt = `You are a pro developer in javascript html and react and tailwind.
    You can create really complex app with these languages.
    You have no limitation in the number of lines of code.
    If requested a full app, you will do it.
    You allways respond to user in one run.
    You can at the begining of a response explain the functionallity that you are going to implement, only if needed to plan the app. Do it in // comments.
    You only create HTML and tsx/jsx. 
    The HTML will be is inside <BODY> tag.
    You write in md format. you only write good code.
    You will create each snippet separately for each language. 
    You only provide code snippets. no explaination, no title, no comment. 
    You use Tailwind and react.js
    Allways separate the html  and tsx or jsx in separate code snippets.
    add theses imports to your tsx/jsx script :
    import React from "https://esm.sh/react";
    import ReactDOM from "https://esm.sh/react-dom";
    
    if you want to import a package, you can use a cdn like https://esm.sh/ 
    always import tailwind like this :
    import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim'
    //and instanciate it
    twindSetup();
    for graph and charts use highstock and highchart
    import Highcharts from "https://esm.sh/highcharts";
    import HighchartsReact from "https://esm.sh/highcharts-react-official";
    or
    import Highcharts from "https://esm.sh/highcharts/highstock";
    
    never import css
    
    for 3d, use THREE.js
    
    When the user ask for an app, imply every functionalities to make the best of it.
    
    Make full working apps, with every functionalities. 
    Add a header with the title of the app and a footer.
    Add a menu if needed.
    allways make the app take 100% of available space, with dark background. 
    Use card and beautiful tailwind style to present the result.
    Allways use try catch to handle errors.
    If you need to use an api, make sure it does not require an api key.
    for weather use wttr.in or an other free api that does not require an api key.
    https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true  => "current_weather"
    https://api.coingecko.com/api 
    https://api.multiversx.com/economics?extract=price for EGLD  => "price"
    https://www.francetvinfo.fr/titres.rss =>   entries "title" and "summary" and "links[0] as href " and "links[1] as image " For the News with feedparser library
    
    when you create an image, Always make the prompt a full detailled prompt, with details about the content of the image and the style of the image.
    
    always start the js by a comment with the title of the app:
    //appTitle: The title of the app
    
    always start the js snippet by a comment with the title of the app:
    //appTitle: The title of the app
    
    your html must be like:
    \`\`\`html
    <div id="app"></div>
    \`\`\`
    
    always include tailwind and use a lot of tailwind classes to style your app to the best with rounded corners and shadow and simple animations.
    
    you have a const avaliable for you to use:
    const puter;
    
    dont import puter, it is already imported for you.
    never import puter, it is already imported for you.
    
    Before using puter,always make sure the user is connected and show the username in the menu:
    \`\`\`
    const isSignedIn=puter.auth.isSignedIn();
    if (!isSignedIn){
        puter.auth.signIn();
    }
    puter.auth.getUser().then(function(user) {
        const username=user.username;
        console.log(username);
    });
    \`\`\`
    
    you can use it like that:
    
    \`\`\`
    puter.kv.set('name', 'Puter Smith').then((success) => {
      console.log(\`Key-value pair created/updated: Success\`);
    });
    
    //or 
    const name = await puter.kv.get('name');
    
    //or
    puter.kv.del('name').then((success) => {
      console.log(\`Key-value pair deleted: Success\`);
    });
    
    //or 
    
    puter.kv.list().then((keys) => {
      console.log(\`Keys are: \${keys}\<br><br>\`);
    });
    //or
    puter.kv.list(true).then((key_vals) => {
      console.log(\`Keys and values are: \${(key_vals).map((key_val) => key_val.key + ' => ' + key_val.value)}\<br><br>\`);
    });
    
    Based on the request, you do jsx or tsx
    
    \`\`\`

    allways imports React and ReactDOM

    always finish the app this way : 
    \`\`\`
    ReactDOM.render(<TheAppYouMade />, document.getElementById("the_id_of_the_div"));
    \`\`\`
    
    

    ${ContextInfos}

    `;
  const [fullMessage, setFullMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([{ role: "system", content: systemPrompt }]);

  const [messageFinished, setMessageFinished] = useState(true);

  const availableChatProviders = ["openai", "ollama", "puter"];

  const [chatProvider, setChatProvider] = useState("puter");

  const [ollamaConfig, setOllamaConfig] = useState({
    baseURL: "http://localhost:4000",
    models: [],
    selectedModel: "",
  });

  const [openAiCongig, setOpenAiCongig] = useState({
    models: [],
    selectedModel: "gpt-4-turbo-preview",
  });

  const [inputMessage, setInputMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const visibleApiKey = apiKey.slice(0, 3);
  const editorJsRef = useRef(null);
  const editorHtmlRef = useRef(null);
  const editorBabelRef = useRef(null);
  const [htmlCode, setHtmlCode] = useState(`<div id="app"></div>`);
  const [jsCode, setJsCode] =
    useState(`//appTitle: Cool Clock with Navbar and KV Fields View and an Iframe

    import React, { useEffect, useState } from "https://esm.sh/react";
    import ReactDOM from "https://esm.sh/react-dom";
    import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';
    //and instanciate it
    twindSetup();
    
    const ClockApp = () => {
        if (puter==undefined){
            this.puter=window.puter;
        }
        const [time, setTime] = useState(new Date());
        const [username, setUsername] = useState('');
        const [kvFields, setKvFields] = useState([]);
    
        useEffect(() => {
            const timerID = setInterval(() => tick(), 1000);
            return () => clearInterval(timerID);
        });
    
        
    
        useEffect(() => {
            const checkUserAndFetchKV = async () => {
                const isSignedIn = puter.auth.isSignedIn();
                if (!isSignedIn) {
                    puter.auth.signIn();
                }
                const user = await puter.auth.getUser();
                setUsername(user.username);
    
                puter.kv.set('name', user.username).then((success) => {
                    console.log("name updated");
                });
    
                puter.kv.set('time', Date()).then((success) => {
                    console.log("time updated");
                });
    
                const kvList = await puter.kv.list(true);
                setKvFields(kvList);
            };
            checkUserAndFetchKV();
        }, []);
    
        const tick = () => {
            setTime(new Date());
        };
    
        return (
            <div className="flex flex-col h-screen bg-gray-900 text-white">
                <nav className="flex items-center justify-between p-4 bg-gray-800">
                    <h1 className="text-xl font-bold">Cool Clock</h1>
                    <span>{username}</span>
                </nav>
                <div className="flex-1 flex flex-col items-center justify-start p-4 space-y-4 overflow-auto">
                    <div className="text-center">
                        <div className="text-4xl font-mono">{time.toLocaleTimeString()}</div>
                    </div>
                    <div className="max-w-xl w-full">
                        <h2 className="text-lg font-semibold mb-2">KV Fields:</h2>
                        <ul className="bg-gray-800 p-3 rounded-lg">
                            {kvFields.map((field, index) => (
                                <li key={index} className="flex justify-between text-sm p-2 hover:bg-gray-700 rounded">
                                    <span className="font-mono">{field.key}</span>
                                    <span>{field.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full h-full">
                        <iframe
                            className="w-full h-full"
                            src="https://wikipedia.org"
                            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads"
                        />
                    </div>
                </div>
            </div>
        );
    };
    
    ReactDOM.render(<ClockApp />, document.getElementById('app'));
    `);
  const [selectedCode, setSelectedCode] = useState("js");

  const consoleLog = `var oldLog = console.log;var oldError = console.error;
  var logElement =parent.document.getElementById('logs');

  console.log = function (message) {
    
      if (typeof message == 'object') {
          logElement.innerHTML += JSON.stringify(message).split(",").join(",\\n") + '<br />';
      } else {
        var stack = new Error().stack;
        stack=""
          logElement.innerHTML += message+ '<br />';
      }
      oldLog.apply(console, arguments);
      logElement.scrollTop = logElement.scrollHeight;
      
  };

  console.error = function (message) {

   
      var stack = new Error().stack;
        logElement.innerHTML +=  '<span style="color:red">'+message+"\\n"+ stack.split("\\n").slice(2).join("\\n")+'</span> ' + '<br />';
    
    oldError.apply(console, arguments);
    logElement.scrollTop = logElement.scrollHeight;
  };`;

  const [ollamaModels, setOllamaModels] = useState([]);

  const [ollamaAvailable, setOllamaAvailable] = useState(true);

  const [anthropicAvailable, setAnthropicAvailable] = useState(false);

  const [divs, setDivs] = useState([
    {
      id: 1,
      content: (
        <CodeEditor
          handleChange={handleChange}
          selectedCode={selectedCode}
          appName={appName}
          setAppNameVal={setAppNameVal}
          downloadCode={downloadCode}
          jsCode={jsCode}
          htmlCode={htmlCode}
          handleEditorDidMountJs={handleEditorDidMountJs}
          handleEditorDidMountHtml={handleEditorDidMountHtml}
          updateCodeValueJs={updateCodeValueJs}
          updateCodeValueHtml={updateCodeValueHtml}
          updateCodeValueBabel={updateCodeValueBabel}
          babelCode={babelCode}
          handleEditorDidMountBabel={handleEditorDidMountBabel}
          name="Code Editor"
        />
      ),
    },
    {
      id: 2,
      content: (
        <ChatSettings
          chatProvider={chatProvider}
          setChatProvider={setChatProvider}
          ollamaConfig={ollamaConfig}
          setOllamaConfig={setOllamaConfig}
          openAiCongig={openAiCongig}
          setOpenAiCongig={setOpenAiCongig}
          ollamaAvailable={ollamaAvailable}
          setApiKeyVal={setApiKeyVal}
          apiKey={apiKey}
          resetApiKey={resetApiKey}
          name="Chat Settings"
          anthropicAvailable={anthropicAvailable}
        />
      ),
    },
    {
      id: 3,
      content: (
        <CustomIframe
          jsCode={jsCode}
          htmlCode={htmlCode}
          consoleLog={consoleLog}
          transpileJSX={transpileJSX}
          messageFinished={messageFinished}
          name="App Preview"
        />
      ),
    },
    { id: 4, content: <LogSection name="Log Section" /> },
    {
      id: 5,
      content: (
        <ChatView
          inputSubmit={inputSubmit}
          inputMessage={inputMessage}
          setInputVal={setInputVal}
          messageFinished={messageFinished}
          fullMessage={fullMessage}
          chatMessages={chatMessages}
          name="Chat View"
          resetChatMessages={resetChatMessages}
        />
      ),
    },
  ]);

  //handle fullMessage
  useEffect(() => {
    //console.log(fullMessage);

    //last chatMessage content is fullmessage
    //const newMessage = [...chatMessages];
    //newMessage[newMessage.length - 1].content = fullMessage;
    //setChatMessages(newMessage);
    const codesSnippets = extractCodeSnippets(fullMessage);
    for (const codeSnippet of codesSnippets) {
      if (codeSnippet.language === "html") {
        setHtmlCode(codeSnippet.code);
        editorHtmlRef.current?.setValue(codeSnippet.code);
        // if (editorJsRef.current) {
        //   const currentCode = selectedCode === "js" ? jsCode : codeSnippet.code;
        //   editorJsRef.current?.setValue(currentCode);
        // }
      }

      if (
        codeSnippet.language === "js" ||
        codeSnippet.language === "jsx" ||
        codeSnippet.language === "tsx"
      ) {
        if (codeSnippet.status == "completed" && true) {
          codeSnippet.code = codeSnippet.code.replace(
            "import twindSetup",
            "import { setup as twindSetup }"
          );

          codeSnippet.code = codeSnippet.code.replace(
            `from "react"`,
            `from "https://esm.sh/react"`
          );

          codeSnippet.code = codeSnippet.code.replace("", "");

          codeSnippet.code = codeSnippet.code.replace(
            "/tailwind/'",
            "/tailwind/shim'"
          );

          codeSnippet.code = codeSnippet.code.replace(
            '/tailwind/"',
            '/tailwind/shim"'
          );

          if (codeSnippet.code.indexOf("import ReactDOM") === -1) {
            codeSnippet.code =
              'import ReactDOM from "https://esm.sh/react-dom"; //imported automatically\n' +
              codeSnippet.code;
          }

          if (
            codeSnippet.code.indexOf("import React ") == -1 &&
            codeSnippet.code.indexOf("import React, ") == -1
          ) {
            codeSnippet.code =
              'import React, { useState, useEffect, useRef } from "https://esm.sh/react"; //imported automatically\n' +
              codeSnippet.code;
          }

          if (
            codeSnippet.code.indexOf("import { setup as twindSetup }") == -1
          ) {
            codeSnippet.code =
              'import { setup as twindSetup } from "https://cdn.skypack.dev/twind/shim"; //imported automatically\ntwindSetup();\n' +
              codeSnippet.code;
          }

          if (
            codeSnippet.code.indexOf("twindSetup()") == -1
          ) {
            codeSnippet.code =
              'twindSetup(); //imported automatically\n' +
              codeSnippet.code;
          }
        }

        setJsCode(codeSnippet.code);
        editorJsRef.current?.setValue(codeSnippet.code);
        // if (editorJsRef.current) {
        //   const currentCode =
        //     selectedCode === "js" ? codeSnippet.code : htmlCode;
        //   editorJsRef.current?.setValue(currentCode);
        // }
      }
    }
  }, [fullMessage]);

  //get ollama models
  useEffect(() => {
    const getOllamaModel = async () => {
      const ollama = new OpenAI({
        baseURL: ollamaConfig.baseURL,
        apiKey: "ollama",
        dangerouslyAllowBrowser: true,
      });
      const modelList = await ollama.models.list();
      const theModels = modelList.data;
      console.log(modelList);
      console.log(theModels);
      setOllamaConfig({ ...ollamaConfig, models: theModels });
    };

    getOllamaModel();
  }, []);

  //get openai models
  useEffect(() => {
    const getOpenAiModel = async () => {
      if (apiKey == "" || apiKey == undefined) {
        return;
      }
      const ollama = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      const modelList = await ollama.models.list();
      const theModels = modelList.data;
      console.log(modelList);
      console.log(theModels);
      setOpenAiCongig({ ...openAiCongig, models: theModels });
    };

    getOpenAiModel();
  }, [apiKey]);

  //get openai api key
  useEffect(() => {
    const updateUser = async () => {
      const isSignedIn = puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
      }
      const user = await puter.auth.getUser();
      setUsername(user.username);

      //await puter.kv.del("openai_api_key")
      //resetChatMessages();
      const openai_api_key = await puter.kv.get("openai_api_key");

      if (openai_api_key) {
        setApiKey(openai_api_key);
        setChatProvider("openai");
      }
    };
    updateUser();
  }, []);

  

  //check if anthropic is available on port 3002
  useEffect(() => {
    fetch("http://localhost:3002/health")
      .then((response) => response.text())
      .then((data) => {if(data=="ok"){setAnthropicAvailable(true)}else{setAnthropicAvailable(false)};console.log(data)})
      .catch((error) => {
        console.log(error);
        console.log("anthropic not avaliable")
        setAnthropicAvailable(false);
      });
  }, []);

  //match selected code
  useEffect(() => {
    editorHtmlRef.current?.setValue(htmlCode);
    editorJsRef.current?.setValue(jsCode);
  }, [selectedCode]);

  //update divs ChatView
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === ChatView) {
          return {
            ...div,
            content: (
              <ChatView
                inputSubmit={inputSubmit}
                inputMessage={inputMessage}
                setInputVal={setInputVal}
                messageFinished={messageFinished}
                fullMessage={fullMessage}
                chatMessages={chatMessages}
                name="Chat View"
                resetChatMessages={resetChatMessages}
              />
            ),
          };
        }
        return div;
      })
    );
  }, [inputMessage, messageFinished, fullMessage, chatMessages]);

  //update divs Navbar
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === NavBar) {
          return {
            ...div,
            content: (
              <NavBar
                inputSubmit={inputSubmit}
                setGptValue={setGptValue}
                gptVal={gptVal}
                resetApiKey={resetApiKey}
                visibleApiKey={visibleApiKey}
                username={username}
                inputMessage={inputMessage}
                setInputVal={setInputVal}
                setChatProvider={setChatProvider}
                chatProvider={chatProvider}
                ollamaConfig={ollamaConfig}
                sendMenuAction={sendMenuAction}
              />
            ),
          };
        }
        return div;
      })
    );
  }, [inputMessage, gptVal, apiKey, chatProvider, username]);

  //update divs ChatSettings
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === ChatSettings) {
          return {
            ...div,
            content: (
              <ChatSettings
                chatProvider={chatProvider}
                setChatProvider={setChatProvider}
                ollamaConfig={ollamaConfig}
                setOllamaConfig={setOllamaConfig}
                openAiCongig={openAiCongig}
                setOpenAiCongig={setOpenAiCongig}
                ollamaAvailable={ollamaAvailable}
                setApiKeyVal={setApiKeyVal}
                apiKey={apiKey}
                resetApiKey={resetApiKey}
                name="Chat Settings"
                anthropicAvailable={anthropicAvailable}
              />
            ),
          };
        }
        return div;
      })
    );
  }, [chatProvider, ollamaConfig, openAiCongig, apiKey]);

  //update divs LogSection

  //update divs CodeEditor
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === CodeEditor) {
          return {
            ...div,
            content: (
              <CodeEditor
                handleChange={handleChange}
                selectedCode={selectedCode}
                appName={appName}
                setAppNameVal={setAppNameVal}
                downloadCode={downloadCode}
                jsCode={jsCode}
                htmlCode={htmlCode}
                handleEditorDidMountJs={handleEditorDidMountJs}
                handleEditorDidMountHtml={handleEditorDidMountHtml}
                updateCodeValueJs={updateCodeValueJs}
                updateCodeValueHtml={updateCodeValueHtml}
                updateCodeValueBabel={updateCodeValueBabel}
                babelCode={babelCode}
                handleEditorDidMountBabel={handleEditorDidMountBabel}
                name="Code Editor"
              />
            ),
          };
        }
        return div;
      })
    );
  }, [jsCode, htmlCode, appName, selectedCode, babelCode]);

  //update divs CustomIframe
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === CustomIframe) {
          return {
            ...div,
            content: (
              <CustomIframe
                jsCode={jsCode}
                htmlCode={htmlCode}
                consoleLog={consoleLog}
                transpileJSX={transpileJSX}
                messageFinished={messageFinished}
                name="App Preview"
              />
            ),
          };
        }
        return div;
      })
    );
  }, [jsCode, htmlCode, messageFinished]);

  const [showDeployForm, setShowDeployForm] = useState(false);
  const [showSaveAsForm, setShowSaveAsForm] = useState(false);
  const [showGuideView, setShowGuideView] = useState(false);

  return (
    <div className="dark:bg-dark bg-light">
      {showGuideView && <GuideView setShowGuideView={setShowGuideView} />}
      {showDeployForm && (
        <DeployForm
          appName={appName}
          setAppNameVal={setAppNameVal}
          subdomain={"subdomain"}
          setSubdomainVal={() => {}}
          deploy={downloadCode}
          cancel={setShowDeployForm}
        />
      )}
      {showSaveAsForm && (
        <SaveAsForm
          appName={appName}
          setAppNameVal={setAppNameVal}
          saveAs={saveAs}
          cancelSaveAs={setShowSaveAsForm}
        />
      )}
      <NavBar
        inputSubmit={inputSubmit}
        setGptValue={setGptValue}
        gptVal={gptVal}
        resetApiKey={resetApiKey}
        visibleApiKey={visibleApiKey}
        username={username}
        inputMessage={inputMessage}
        setInputVal={setInputVal}
        setChatProvider={setChatProvider}
        chatProvider={chatProvider}
        ollamaConfig={ollamaConfig}
        sendMenuAction={sendMenuAction}
      />
      <Space.ViewPort className="w-full dark:bg-dark bg-light">
        <Space.Top
          size="50px"
          touchHandleSize={20}
          trackSize={false}
          scrollable={true}
        >
          <Space.Fill trackSize={true}></Space.Fill>
        </Space.Top>
        <Space.Bottom
          size="92%"
          touchHandleSize={20}
          trackSize={false}
          scrollable={true}
        >
          <Space.Fill trackSize={true}>
            <Space.LeftResizable
              size="30%"
              touchHandleSize={20}
              trackSize={false}
              scrollable={true}
            >
              <Space.Fill trackSize={true}>
                <DraggableUI
                  id={5}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  getDivContent={getDivContent}
                  draggingId={draggingId}
                  divs={divs}
                />
              </Space.Fill>
            </Space.LeftResizable>

            <Space.LeftResizable
              size="40%"
              touchHandleSize={20}
              trackSize={false}
              scrollable={true}
            >
              <Space.Fill trackSize={true}>
                <DraggableUI
                  id={1}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  getDivContent={getDivContent}
                  draggingId={draggingId}
                  divs={divs}
                />
              </Space.Fill>
              <Space.BottomResizable
                size="5%"
                touchHandleSize={20}
                trackSize={true}
                scrollable={true}
              >
                <Space.Fill>
                  <DraggableUI
                    id={2}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    getDivContent={getDivContent}
                    draggingId={draggingId}
                    divs={divs}
                  />
                </Space.Fill>
              </Space.BottomResizable>
            </Space.LeftResizable>
            <Space.Fill
              size="30%"
              touchHandleSize={20}
              trackSize={true}
              scrollable={true}
            >
              <Space.Fill trackSize={true}>
                <DraggableUI
                  id={3}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  getDivContent={getDivContent}
                  draggingId={draggingId}
                  divs={divs}
                />
              </Space.Fill>
              <Space.BottomResizable
                size="5%"
                touchHandleSize={20}
                trackSize={true}
                scrollable={true}
              >
                <Space.Fill>
                  <DraggableUI
                    id={4}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    getDivContent={getDivContent}
                    draggingId={draggingId}
                    divs={divs}
                  />
                </Space.Fill>
              </Space.BottomResizable>
            </Space.Fill>
          </Space.Fill>
        </Space.Bottom>
      </Space.ViewPort>
    </div>
  );
};

ReactDOM.render(<DraggableApp />, document.getElementById("app"));
