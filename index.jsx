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

twindSetup({
  theme: {
    extend: {
      backgroundColor: {
        dark: "#1e1e1e",
      },
      textColor: {
        light: "#d4d4d4",
      },
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

const LogSection = () => {
  return (
    <div className="w-full h-full bg-black">
      <div className="bg-blue-900 w-full">Console</div>
      <pre
        className="opacity-50 bottom-12 w-full h-full bg-black text-white"
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
  return (
    <iframe
      className="w-full h-full bg-white border rounded shadow-lg"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
      srcDoc={
        jsCode === ""
          ? ""
          : messageFinished
          ? `<html>${htmlCode}<script src="https://js.puter.com/v2/"></` +
            `script><script type="module">const puter = window.puter;\n${transpileJSX(
              jsCode
            )}<` +
            `/script><div class="fixed bottom-0"><pre class="fixed opacity-50 bottom-12 w-full bg-black text-white" id="logs2"></pre></div><script>${consoleLog}</` +
            `script></html>`
          : ""
      }
    />
  );
}

const TheEditorJs = ({
  handleEditorDidMount,
  jsCode,
  onChange
}) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"javascript"}
      defaultValue={jsCode}
      theme="vs-dark"
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

const TheEditorHtml = ({
  handleEditorDidMount,
  htmlCode,
  onChange
}) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"html"}
      defaultValue={htmlCode}
      theme="vs-dark"
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
}) => {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <select
          onChange={handleChange}
          value={selectedCode}
          className="mx-4 py-2 px-3 bg-gray-700 text-white rounded outline-none"
        >
          <option value="js">JavaScript</option>
          <option value="html">HTML</option>
        </select>
        <input
          className="mx-4 py-2 px-3 bg-gray-700 text-white rounded outline-none"
          value={appName}
          onChange={setAppNameVal}
          placeholder="Your App Name"
        ></input>
        <button
          className="mx-4 py-2 px-3 bg-gray-700 text-white rounded outline-none"
          onClick={downloadCode}
        >
          Create App
        </button>
      </div>

      

      {selectedCode === "js" ? (
        <TheEditorJs
          handleEditorDidMount={handleEditorDidMountJs}
          jsCode={jsCode}
          onChange={updateCodeValueJs}
        />
      ) : (
        <TheEditorHtml
          handleEditorDidMount={handleEditorDidMountHtml}
          htmlCode={htmlCode}
          onChange={updateCodeValueHtml}
        />
      )}
    </>
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
}) => {
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center dark:bg-gray-900">
      <div className="flex flex-col w-2/3 pt-0">
        <span className="text-2xl w-full">Code With AI</span>
        <span className=" w-full">by SamLePirate</span>
      </div>
      <textarea
        type="text"
        placeholder="Make a weather app for Ales, France
          Make a btc graph , What are the news?
          "
        className="fixed left-1/4 top-0 m-auto  w-1/3 rounded p-2 text-gray-700 z-50"
        onKeyPress={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            // Soumettre le formulaire
            inputSubmit(event);
          }
        }}
        value={inputMessage}
        onChange={setInputVal}
      />
      <button className="bg-gray-700  w-20 p-2 rounded hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white">
        {gptVal ? "gpt-4" : "puter ai"}
      </button>
      <div className="bg-gray-700  w-20 p-2 rounded hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white">
        <input
          onChange={setGptValue}
          id="default-checkbox"
          type="checkbox"
          value={gptVal}
          checked={gptVal}
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        ></input>
        <label
          for="default-checkbox"
          class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          GPT-4
        </label>
      </div>

      <div
        onClick={resetApiKey}
        className="bg-gray-700 right-0 p-2 rounded hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white"
      >
        {visibleApiKey}
        {username}
      </div>
    </nav>
  );
};

const Clock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  });

  const tick = () => {
    setTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-6xl font-semibold text-white">{time}</div>
    </div>
  );
};

const Counter = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  });

  const tick = () => {
    setTime((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-6xl font-semibold text-white">{time}</div>
    </div>
  );
};

const Counter2 = ({ time }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-6xl font-semibold text-white">{time}</div>
    </div>
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
}) => {
  return (
    <div
      key={id}
      className={`w-full h-full bg-gray-700 border flex flex-col rounded shadow-lg  ${
        draggingId === id ? "opacity-30" : "opacity-100"
      }`}
    >
      <button
        draggable
        onDragStart={(e) => onDragStart(e, id)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, id)}
        className={`left-0 top-0  border rounded shadow-lg   ${
          draggingId === id ? "opacity-10" : "opacity-100"
        } ${
            (draggingId !== id &&  draggingId)? "bg-red-700" : "bg-gray-700"
          }`}
        style={{ cursor: "grab" }}
      >
        DRAG 
      </button>
      {getDivContent(id)}
    </div>
  );
};

const DraggableApp = () => {
  const [username, setUsername] = useState("Guest");
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

    ${ContextInfos}

    `;
  const [fullMessage, setFullMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "system", content: systemPrompt },
  ]);

  const [messageFinished, setMessageFinished] = useState(true);
  async function sendMessage(message) {
    setMessageFinished(false);
    setFullMessage("");
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // This is the default and can be omitted
      });
      const newMessage = [...chatMessages, { role: "user", content: message }];
      newMessage[0].content = systemPrompt;
      console.log(newMessage);
      const putai = !gptVal;
      if (putai) {
        console.log("chat with puter");
        puter.ai.chat(newMessage).then((response) => {
          console.log(response.toString() );
          setFullMessage(response.toString());
          setChatMessages([
            ...newMessage,
            { role: "assistant", content: response.toString() },
          ]);
          setMessageFinished(true);
        });

        return;
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: newMessage,
        stream: true,
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
      console.log("Message Finished");
      console.log(fullResponse);
      newMessage.push({ role: "assistant", content: fullResponse });
      setChatMessages(newMessage);
      setMessageFinished(true);
    } catch (error) {
      console.log(error);
    }
    console.log("Message Finished All");
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

  useEffect(() => {
    //console.log(fullMessage);

    //last chatMessage content is fullmessage
    const newMessage = [...chatMessages];
    newMessage[newMessage.length - 1].content = fullMessage;
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

  const inputSubmit = (e) => {
    //e.preventDefaults();
    setInputMessage("");
    sendMessage(inputMessage);
    console.log(inputMessage);
  };
  const setInputVal = (e) => {
    setInputMessage(e.target.value);
  };
  const [inputMessage, setInputMessage] = useState("");
  const setApKeyVal = (e) => {
    puter.kv.set("openai_api_key", e.target.value).then((success) => {
      console.log("api Key updated");
    });
    setApiKey(e.target.value);
  };
  const [apiKey, setApiKey] = useState("");
  const editorJsRef = useRef(null);
  const editorHtmlRef = useRef(null);
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
    if (typeof message == 'object') {
        logElement.innerHTML += '<span style="color:red">'+JSON.stringify(message).split(",").join(",\\n")+'</span> '+ '<br />';
    } else {
      var stack = new Error().stack;
        logElement.innerHTML +=  '<span style="color:red">'+message+"\\n"+ stack.split("\\n").slice(2).join("\\n")+'</span> ' + '<br />';
    }
    oldError.apply(console, arguments);
    logElement.scrollTop = logElement.scrollHeight;
  };`;

  useEffect(() => {
    const updateUser = async () => {
      const isSignedIn = puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
      }
      const user = await puter.auth.getUser();
      setUsername(user.username);

      //await puter.kv.del("openai_api_key")

      const openai_api_key = await puter.kv.get("openai_api_key");

      if (openai_api_key) {
        setApiKey(openai_api_key);
      }
    };
    updateUser();
  }, []);
  useEffect(() => {
    
    editorHtmlRef.current?.setValue(htmlCode);
    editorJsRef.current?.setValue(jsCode);
  }, [selectedCode]);
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
      return Babel.transform(jsxCode, {
        presets: ["react"],
      }).code;
    } catch (error) {
      //console.error('Erreur de syntaxe dans le code JavaScript :', error);
      // Vous pouvez également afficher un message d'erreur à l'utilisateur ici
      return jsxCode;
    }
  }

  function updateCodeValueJs(value, event) {
    setJsCode(value);
  }

  function updateCodeValueHtml(value, event) {
    setHtmlCode(value);
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
  const [gptVal, setGptVal] = useState(0);

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

  const [appName, setAppName] = useState("");
  const setAppNameVal = (e) => {
    setAppName(e.target.value);
  };

  const visibleApiKey = apiKey.slice(0, 3);

  const [time, setTime] = useState(0);

  useEffect(() => {
    const timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  });

  const [draggingId, setDraggingId] = useState(null);

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
        />
      ),
    },
    { id: 2, content: <Counter /> },
    {
      id: 3,
      content: (
        <CustomIframe
          jsCode={jsCode}
          htmlCode={htmlCode}
          consoleLog={consoleLog}
          transpileJSX={transpileJSX}
          messageFinished={messageFinished}
        />
      ),
    },
    { id: 4, content: <LogSection /> },
  ]);

  const tick = () => {
    setTime((prev) => prev + 1);
  };

  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === Counter2) {
          return { ...div, content: <Counter2 time={time} /> };
        }
        return div;
      })
    );
  }, [time]);

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
              />
            ),
          };
        }
        return div;
      })
    );
  }, [jsCode, htmlCode, appName, selectedCode]);

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
              />
            ),
          };
        }
        return div;
      })
    );
  }, [jsCode, htmlCode, messageFinished]);

  useEffect(() => {
    console.log("starting");
  }, []);

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

  return (
    <Space.ViewPort className="w-full">
      {messageFinished==0 && <div className="absolute z-50 w-full h-full flex justify-center items-center bg-black opacity-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white">ok</div>
        </div>}
      {apiKey == "" && gptVal == 1 && (
        <div className="absolute flex flex-col z-50 top-0 w-full h-full bg-black flex">
          <input
            className="mx-4 py-2 px-3 bg-gray-700 text-white rounded outline-none"
            onChange={setApKeyVal}
            placeholder="you openai api key : sk-************"
          ></input>
          <button
            onClick={() => {
              setGptVal(0);
            }}
            className="m-4 bg-red-900"
          >
            No thanks
          </button>
        </div>
      )}
      <Space.Top
        size="10%"
        touchHandleSize={20}
        trackSize={false}
        scrollable={true}
      >
        <Space.Fill trackSize={true}>
          <NavBar
            inputSubmit={inputSubmit}
            setGptValue={setGptValue}
            gptVal={gptVal}
            resetApiKey={resetApiKey}
            visibleApiKey={visibleApiKey}
            username={username}
            inputMessage={inputMessage}
            setInputVal={setInputVal}
          />
        </Space.Fill>
      </Space.Top>
      <Space.Bottom
        size="90%"
        touchHandleSize={20}
        trackSize={false}
        scrollable={true}
      >
        <Space.Fill trackSize={true}>
          <Space.LeftResizable
            size="50%"
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
              />
            </Space.Fill>
            <Space.BottomResizable
              size="0%"
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
                />
              </Space.Fill>
            </Space.BottomResizable>
          </Space.LeftResizable>
          <Space.Fill
            size="50%"
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
              />
            </Space.Fill>
            <Space.BottomResizable
              size="20%"
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
                />
              </Space.Fill>
            </Space.BottomResizable>
          </Space.Fill>
        </Space.Fill>
      </Space.Bottom>
    </Space.ViewPort>
  );
};

ReactDOM.render(<DraggableApp />, document.getElementById("app"));
