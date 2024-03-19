import React, { useState, useEffect, useRef } from "react";
import * as Space from "react-spaces";
import * as Babel from "@babel/standalone";
import OpenAI from "openai";
import { transform as transform } from "sucrase";
import GuideView from "./components/GuideView";
import DeployForm from "./components/DeployForm";
import SaveAsForm from "./components/SaveAsForm";
import NavBar from "./components/NavBar";
import DraggableUI from "./components/DraggableUI";
import CodeEditor from "./components/CodeEditor";
import ChatSettings from "./components/ChatSettings";
import CustomIframe from "./components/CustomIframe";
import LogSection from "./components/LogSection";
import ChatView from "./components/ChatView";
import { prompts } from "./utils/prompts";
import { templates } from "./utils/templates";

const DraggableApp = () => {
  const [systemPrompt, setSystemPrompt] = useState(prompts[0].content);

  async function sendMessage(message) {
    setMessageFinished(false);
    setFullMessage("");
    console.log(systemPrompt);
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
        console.log(apiKey);
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
        console.log(fullMessage);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const extractCodeSnippets = (markdownContent) => {
    const codeSnippets = [];
    const codeString = "```";
    const codeBlockRegex = new RegExp(
      `${codeString}(jsx|tsx|js|html|javascript)\n([\\s\\S]*?)${codeString}\n`,
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
      `${codeString}(jsx|js|javascript)\n([\\s\\S]*)(?!${codeString})`
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


    if (action.indexOf("setPrompt") !== -1) {
      const actionSplit = action.split("-");
      const promptIndex = actionSplit[1];
      setSystemPrompt(prompts[promptIndex].content);
      setSelectedPrompt(promptIndex);
      resetChatMessages();
    }

    if (action.indexOf("setTemplate") !== -1) {
      const actionSplit = action.split("-");
      const templateIndex = actionSplit[1];
      setJsCode(templates[templateIndex].js);
      setHtmlCode(templates[templateIndex].html);
      editorHtmlRef.current?.setValue(templates[templateIndex].html);
      editorJsRef.current?.setValue(templates[templateIndex].js);
    }

    if (action === "promptReact") {
      setSystemPrompt(prompts[0].content);
    }

    if (action === "promptJs") {
      setSystemPrompt(prompts[1].content);
    }

    if (action === "deleteAll") {
      const deleteAllKv = async () => {
        const kvList = await puter.kv.list(true);
        kvList.map((file) => {
          puter.kv.del(file.key).then((success) => {
            console.log("deleted");
          });
        });

        setApiKey("");
        setChatProvider("puter");
      };
      deleteAllKv();
    }
  };

  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const setSystemPromptVal = (e) => {
    setSelectedPrompt(e.target.value);
    setSystemPrompt(prompts[e.target.value].content);
    resetChatMessages();
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

  const [draggingId, setDraggingId] = useState(null);

  const [appName, setAppName] = useState("");

  const [gptVal, setGptVal] = useState(0);

  const todayString = new Date().toDateString();
  const timeToHumanStringInFrance = (time) => {
    const date = new Date(time);
    return date.toLocaleString("fr-FR");
  };

  const ContextInfos = `
  Today is ${todayString}.
  The time is ${timeToHumanStringInFrance(Date.now())} in France.
  The user is ${username}.
  `;

  const oldSysPrompt = `You are a pro developer in javascript html and react and tailwind.
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
  const [chatMessages, setChatMessages] = useState([
    { role: "system", content: systemPrompt },
  ]);

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
          setSystemPromptVal={setSystemPromptVal}
          selectedPrompt={selectedPrompt}
          prompts={prompts}
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
        codeSnippet.language === "tsx" ||
        codeSnippet.language === "javascript"
      ) {
        if (codeSnippet.status == "completed" && false) {
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

          if (codeSnippet.code.indexOf("twindSetup()") == -1) {
            codeSnippet.code =
              "twindSetup(); //imported automatically\n" + codeSnippet.code;
          }
        }
        codeSnippet.code = codeSnippet.code.replace(/\`\`\`/g, "");
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
    try {
      fetch("http://localhost:3002/health")
        .then((response) => response.text())
        .then((data) => {
          if (data == "ok") {
            setAnthropicAvailable(true);
          } else {
            setAnthropicAvailable(false);
          }
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
          console.log("anthropic not avaliable");
          setAnthropicAvailable(false);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  //match selected code
  useEffect(() => {
    editorHtmlRef.current?.setValue(htmlCode);
    editorJsRef.current?.setValue(jsCode);
  }, [selectedCode]);

  useEffect(() => {
  //find a line that start with //appTitle:
  let appTitle = "";
  const lines = jsCode.split("\n");
  for (const line of lines) {
    if (line.indexOf("//appTitle:") !== -1) {
      appTitle = line.replace("//appTitle:", "");
      break;
    }
  }
  setAppName(appTitle);
  },[jsCode]);

  const [parentTitle, setParentTitle] = useState("");
  const [authorisedDomain, setAuthorisedDomain] = useState(true);

  useEffect(() => {
    const parentTitleApp = window.parent.document.referrer;
    console.log("referer");
    console.log(parentTitleApp);
    if (parentTitleApp.indexOf("puter.com") === -1 || parentTitleApp.indexOf("http://localhost") === -1) {
      setAuthorisedDomain(true)
    } else {
      setAuthorisedDomain(false)
    }  
    setParentTitle(parentTitleApp);
  }, []);



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
                setSystemPromptVal={setSystemPromptVal}
                selectedPrompt={selectedPrompt}
                prompts={prompts}
                templates={templates}
              />
            ),
          };
        }
        return div;
      })
    );
  }, [inputMessage, gptVal, apiKey, chatProvider, username,selectedPrompt]);

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
                setSystemPromptVal={setSystemPromptVal}
                selectedPrompt={selectedPrompt}
                prompts={prompts}
              />
            ),
          };
        }
        return div;
      })
    );
  }, [chatProvider, ollamaConfig, openAiCongig, apiKey,selectedPrompt]);

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
      {authorisedDomain===false  && <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light dark:text-light text-dark bg-opacity-50 flex items-center justify-center z-50"><p>Only available on puter.com</p></div>}
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
        setSystemPromptVal={setSystemPromptVal}
        selectedPrompt={selectedPrompt}
        prompts={prompts}
        templates={templates}
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

export default DraggableApp;
