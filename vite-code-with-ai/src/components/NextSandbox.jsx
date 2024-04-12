import {
  Sandpack,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  SandpackFileExplorer,
  useSandpack,
  SandpackLayout,
  useActiveCode,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

import { useEffect, useState } from "react";

const SandpackFiles = ({ setCodeFiles, template }) => {
  const { sandpack, dispatch } = useSandpack();

  useEffect(() => {
    sandpack.resetAllFiles();
    dispatch({ type: "refresh" });
    dispatch({ type: "restart" });
  }, [template]);

  const { code, updateCode } = useActiveCode();
  useEffect(() => {
    const getFilesAndContent = async () => {
      if (sandpack) {
        const files = await sandpack.files;

        setCodeFiles(files);
      }
    };

    getFilesAndContent();
    let previewPack = document.querySelector(".previewPack");
    let editorPack = document.querySelector(".editorPack");
    let filePack = document.querySelector(".filePack");
    let consolePack = document.querySelector(".consolePack");
    let parent = previewPack?.parentElement?.parentElement?.parentElement;
    let parentWidth = parent?.clientWidth;
    let parentHeight = parent?.clientHeight;
    if (previewPack instanceof HTMLElement) {
      previewPack.style.width = parentWidth + "px";
      previewPack.style.height = parentHeight * 0.66 + "px";
      //previewPack.style.width=window.innerWidth/2+"px";
    }
    if (consolePack instanceof HTMLElement) {
      consolePack.style.width = "100%";
      consolePack.style.height = parentHeight * 0.34 + "px";
      //consolePack.style.width=window.innerWidth/4+"px";
    }
    if (editorPack instanceof HTMLElement) {
      editorPack.style.width = parentWidth + "px";
      editorPack.style.height = parentHeight * 0.66 + "px";
      //editorPack.style.width=window.innerWidth/4+"px";
    }
    if (filePack instanceof HTMLElement) {
      filePack.style.width = parentWidth + "px";
      filePack.style.height = parentHeight * 0.66 + "px";
      //filePack.style.width=window.innerWidth/4+"px";
    }
  }, []);

  return <></>;
};

const NextSandbox = ({ name }) => {
  const [template, setTemplate] = useState("react"); // Ajoutez cet état pour le template

  const handleTemplateChange = (event) => {
    setTemplate(event.target.value);
  };

  return (
    <div className="h-full w-full">
      <label htmlFor="template-select">Choose a template: </label>
      <select
        className="text-black"
        id="template-select"
        value={template}
        onChange={handleTemplateChange}
      >
        <option value="react">React</option>
        <option value="nextjs">Next.js</option>
        <option value="vite-react">Vite-React</option>
        <option value="node">Node</option>
        <option value="vanilla">Vanilla</option>
        <option value="vue">Vue</option>
        <option value="svelte">Svelte</option>
        <option value="angular">Angular</option>
        <option value="vite">Vite</option>
        angular vite
      </select>
      <NextSandboxLoader template={template} />
    </div>
  );
};

const NextSandboxLoader = ({ template }) => {
  const [theTemplate, setTheTemplate] = useState("");
  const [templateLoaded, setTemplateLoaded] = useState(false);

  useEffect(() => {
    setTemplateLoaded(false);
    setTimeout(() => {
      setTheTemplate(template);
      setTemplateLoaded(true);
    }, 500);
  }, [template]);

  const files = {};
  const filesReact = {
    "/App.js": `//appTitle: Puter Functionalities Explorer

  import React, { useState, useEffect } from "react";
  
  
  const App = () => {
      const [username, setUsername] = useState('');
      const [chatHistory, setChatHistory] = useState([]);
      const [currentMessage, setCurrentMessage] = useState('');
      const [keyValues, setKeyValues] = useState([]);
      const [newKey, setNewKey] = useState('');
      const [newValue, setNewValue] = useState('');
      const [fileContent, setFileContent] = useState('');
      const [fileName, setFileName] = useState('');
  
      useEffect(() => {
          const signInAndFetchKeys = async () => {
              if (!puter.auth.isSignedIn()) {
                  await puter.auth.signIn();
              }
              const user = await puter.auth.getUser();
              setUsername(user.username);
  
              const fetchedKeys = await puter.kv.list(true);
              fetchedKeys.forEach((field)=>{
                if (field.key === "openai_api_key"){
                  field.value="sk-***********";
                }
              })
              setKeyValues(fetchedKeys);
          };
          signInAndFetchKeys();
      }, []);
  
      const sendMessage = () => {
          const messageList = [
              { role: "system", content: "A system message that guides the AI to respond appropriately" },
              { role: "user", content: currentMessage }
          ];
          setChatHistory(messageList);
          puter.ai.chat(messageList).then((response) => {
              const chatResponse = response.toString();
              setChatHistory(history => [...history, { role: "assistant", content: chatResponse }]);
              setCurrentMessage('');
              puter.ai.txt2speech(chatResponse).then(audio => audio.play());
          });
      };
  
      const addOrUpdateKeyValue = async () => {
          await puter.kv.set(newKey, newValue);
          const keyList = await puter.kv.list(true);
          keyList.forEach((field) => {
              if (field.key === "openai_api_key"){
                  field.value = "sk-**********";
              }
          })
          setKeyValues(keyList);
          setNewKey('');
          setNewValue('');
      };
  
      const deleteKeyValue = async (keyToDelete) => {
          await puter.kv.del(keyToDelete);
          setKeyValues(await puter.kv.list(true));
      };
  
      const handleOpenFileDialog = async () => {
          try {
              const file = await puter.ui.showOpenFilePicker();
              const fileName = file.name;
              const fileContent = await (await file.read()).text();
              setFileName(fileName);
              setFileContent(fileContent);
          } catch (error) {
              console.error('Error reading file:', error);
          }
      };
  
      const handleSaveFileDialog = async () => {
          try {
              const file = await puter.ui.showSaveFilePicker(fileContent, 'example.txt');
              const fileName = file.name;
              setFileName(fileName);
          } catch (error) {
              console.error('Error saving file:', error);
          }
      };
  
      return (
          <div className="h-full w-screen bg-gray-800 text-white p-4">
              <header className="text-center text-2xl font-bold">Puter Functionalities Explorer with Puter File Dialog Demo</header>
              <div className="mt-4 flex flex-col items-center h-full">
                  <div>Welcome, {username}</div>
  
                  {/* Chat Section */}
                  <div className="mt-4 w-3/4 flex flex-col">
                      <div>Chat with audio response:</div>
                      <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                          {chatHistory.map((entry, index) => (
                              <div key={index} className={\`p-2 my-1 rounded \${entry.role === "assistant" ? "bg-blue-500" : "bg-green-500"}\`}>{entry.content}</div>
                          ))}
                      </div>
                      <input className="text-black p-1 rounded-b-lg" placeholder="Type a message..." value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} />
                      <button className="my-2 self-end px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={sendMessage}>Send</button>
                  </div>
  
                  {/* Puter File Dialog Section */}
                  <div className="mt-4 w-3/4">
                      <div>Puter File Dialog Demo:</div>
                      <button className="my-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={handleOpenFileDialog}>Open File</button>
                      <button className="my-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-700" onClick={handleSaveFileDialog}>Save File</button>
                      <div className="bg-gray-700 p-2 rounded-lg overflow-auto h-24 my-2">
                          {fileName && <div className="my-2">File Name: {fileName}</div>}
                          {fileContent && <div className="my-2">File Content: {fileContent}</div>}
                      </div>
                  </div>
  
                  {/* Key-Value Pairs Section */}
                  <div className="mt-4 w-3/4">
                      <div>Key-Value Pairs:</div>
                      <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                          {keyValues.map(({ key, value }) => (
                              <div key={key} className="flex justify-between items-center my-2">
                                  <div>{JSON.stringify({[key]: value})}</div>
                                  <button className="ml-2 px-2 py-1 bg-red-500 rounded hover:bg-red-700" onClick={() => deleteKeyValue(key)}>Delete</button>
                              </div>
                          ))}
                      </div>
                      <input className="text-black p-1 w-1/3 border rounded-bl-lg" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} />
                      <input className="text-black p-1 border w-1/3" placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} />
                      <button className="py-1.5 bg-green-500 w-1/3 rounded-br-lg hover:bg-green-700" onClick={addOrUpdateKeyValue}>Add/Update</button>
                  </div>
              </div>
          </div>
      );
  };
  
  export default App;
  
  `,
  };
  const [codeFiles, setCodeFiles] = useState({});

  const updateSandboxFiles = (files) => {
    if (!files) {
      return;
    }
    console.log(files);
    const filesArray = Object.keys(files).map((key) => {
      return { path: key, code: files[key].code };
    });
    console.log(filesArray);
  };

  const findDependenciesInFiles = (files) => {
    const dependencies = {};
    return dependencies;
    files.forEach((file) => {
      const dependenciesRegex = /\/\/dependencies: (.*)/g;
      const matches = file.code.match(dependenciesRegex);

      if (matches) {
        matches.forEach((match) => {
          const dependency = match.replace("//dependencies: ", "");
          dependencies[dependency] = "latest";
        });
      }
    });

    return dependencies;
  };

  const getDependencies = (files) => {
    if (files === undefined || files.length === 0) {
      return "{}";
    }
    const dependencies = findDependenciesInFiles(files);
    // dependencies["tailwindcss"] = "^3.3.0";
    // dependencies["autoprefixer"] = "^10.0.1";
    // dependencies["postcss"] = "^8";
    // dependencies["ts-node"] = "^10.4.0";
    dependencies["react-router-dom"] = "^6.0.0";
    dependencies["@stream-io/video-react-sdk"] = "0.5.0";

    return JSON.stringify(dependencies);
  };

  return (
    <>
      {templateLoaded && (
        <SandpackProvider
          files={files}
          theme="dark"
          template={theTemplate}
          customSetup={{
            dependencies: JSON.parse(getDependencies(files)),
          }}
          options={{
            showNavigator: true,
            classes: {
              "sp-wrapper": "custom-wrapper",
              "sp-preview": "custom-layout",
              "sp-tab-button": "custom-tab",
              "sp-editor": "custom-editor",
              "sp-file-explorer": "custom-file-explorer",
              "sp-preview-container": "custom-preview-container",
            },
            externalResources: [
              "https://js.puter.com/v2/",
              "https://cdn.tailwindcss.com",
            ],
          }}
        >
          <SandpackFiles
            setCodeFiles={updateSandboxFiles}
            template={theTemplate}
          />
          <SandpackLayout className="w-full h-full">
            <SandpackFileExplorer className="w-full h-full filePack" />
            <SandpackCodeEditor
              closableTabs
              showTabs
              className="w-full h-full editorPack"
            />
            <SandpackPreview className="w-full h-full previewPack" />
          </SandpackLayout>
          <div className="w-full h-full  overflow-y-scroll">
            <SandpackConsole className="w-full h-full consolePack overflow-y-scroll" />
          </div>
        </SandpackProvider>
      )}
    </>
  );
};

export default NextSandbox;
