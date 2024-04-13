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
import ViewPrompts from "./components/ViewPrompts";
import LoadingDiv from "./components/LoadingDiv";
import CustomPrompt from "./components/CustomPrompt";
import PerformanceMonitor from "./components/PerformanceMonitor";
import NodeboxView from "./components/NodeboxView";
import NextSandbox from "./components/NextSandbox";
import SpeechToText from "./components/SpeechToText";
import TextToSpeak from "./components/TextToSpeak";
import GitClient from "./components/GitClient";
import FsExplorer from "./components/FsExplorer";
import MenuBar from "./components/MenuBar";
import FullView from "./components/FullView";

import {
  userSettings,
  getUserSetting,
  setUserSetting,
} from "./utils/userSettings";

let puter = window.puter;
const App = () => {
  const [systemPrompt, setSystemPrompt] = useState(prompts[0].content);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const [userPrompts, setUserPrompts] = useState([]); // userPrompts is an array of objects of type {name: string, content: string, active: boolean}
  const [userStringPrompt, setUserStringPrompt] = useState("");

  const [insertDiv, setInsertDiv] = useState(false);

  const [sizeCols, setSizeCols] = useState([0, 0, 100]);
  const [sizeRows, setSizeRows] = useState([0, 0]);
  const [sizeContent, setSizeContent] = useState(97);
  const [sizeLeftMenu, setSizeLeftMenu] = useState(0);
  const [showLeftMenu, setShowLeftMenu] = useState(false);

  const [draggingOrder, setDraggingOrder] = useState(-1);
  const [previewMode, setPreviewMode] = useState("normal");

  const MobileView = window.innerWidth < 800 ? true : false;

  const animateLeftMenu = (toSize, time) => {
    let step = 10;
    let duration = time;
    let interval = duration / step;
    let currentSize = [sizeLeftMenu];
    let sizeDiff = toSize.map((size, index) => size - currentSize[index]);
    let sizeStep = sizeDiff.map((diff) => diff / step);
    let i = 0;
    let intervalId = setInterval(() => {
      currentSize = currentSize.map((size, index) => size + sizeStep[index]);
      setSizeLeftMenu(currentSize[0]);

      i++;
      if (i >= step) {
        clearInterval(intervalId);
      }
    }, interval);
  };

  const animateSizesCols = (toSize, time) => {
    //toSize is a array of size
    //interpolate from sizeCols to toSize with a step of 1 and a duration of 1s

    let step = 24;
    let duration = time;
    let interval = duration / step;
    let currentSize = sizeCols;
    let sizeDiff = toSize.map((size, index) => size - currentSize[index]);
    let sizeStep = sizeDiff.map((diff) => diff / step);
    let i = 0;
    let intervalId = setInterval(() => {
      currentSize = currentSize.map((size, index) => size + sizeStep[index]);
      setSizeCols(currentSize);

      i++;
      if (i >= step) {
        clearInterval(intervalId);
      }
    }, interval);
  };

  const animateSizesRows = (toSize, time) => {
    //toSize is a array of size
    //interpolate from sizeCols to toSize with a step of 1 and a duration of 1s

    let step = 24;
    let duration = time;
    let interval = duration / step;
    let currentSize = sizeRows;
    let sizeDiff = toSize.map((size, index) => size - currentSize[index]);
    let sizeStep = sizeDiff.map((diff) => diff / step);
    let i = 0;
    let intervalId = setInterval(() => {
      currentSize = currentSize.map((size, index) => size + sizeStep[index]);
      setSizeRows(currentSize);

      i++;
      if (i >= step) {
        clearInterval(intervalId);
      }
    }, interval);
  };

  const AnimateEqualCol = () => {
    animateSizesCols([33, 34, 33], 800);
    animateSizesRows([0, 0], 800);
  };
  const AnimateChatPreviewMobile = () => {
    animateSizesCols([30, 0, 70], 800);
    animateSizesRows([0, 0], 800);
  };

  const AnimateFullScreenPreview = () => {
    animateSizesCols([0, 0, 100], 500);
    animateSizesRows([0, 0], 500);
  };

  const AnimateEditorFullscreen = () => {
    animateSizesCols([0, 100, 0], 500);
    animateSizesRows([0, 0], 500);
  };

  const AnimateCodePreview = () => {
    animateSizesCols([0, 50, 50], 500);
    animateSizesRows([0, 0], 500);
  };

  const AnimateChatPreview = () => {
    animateSizesCols([50, 0, 50], 500);
    animateSizesRows([0, 0], 500);
  };

  const AnimateChatSetting = () => {
    animateSizesCols([0, 100, 0], 500);
    animateSizesRows([100, 0], 500);
  };

  const AnimateChatSettingMobile = () => {
    animateSizesCols([0, 100, 0], 500);
    animateSizesRows([100, 0], 500);
  };

  const AnimateLog = () => {
    animateSizesRows([0, 50], 500);
  };

  const AnimateLogMobile = () => {
    animateSizesCols([0, 0, 100], 500);
    animateSizesRows([0, 50], 500);
  };

  useEffect(() => {
    if (MobileView) {
      setTimeout(AnimateChatPreviewMobile, 3000);
    } else {
      setTimeout(AnimateEqualCol, 3000);
    }
  }, []);

  const getPrompts = async () => {
    try {
      const userPrompts = await puter.kv.get("user_prompts");
      if (userPrompts) {
        const parsedPrompts = JSON.parse(userPrompts);
        setUserPrompts(parsedPrompts);
        console.log(parsedPrompts);
        const stringPrompt = getActivePromptsToString(parsedPrompts);
        setUserStringPrompt(stringPrompt);
        console.log(stringPrompt);
      }
    } catch (error) {
      console.error("Failed to fetch user prompts:", error);
    }
  };

  const updatePrompts = () => {
    getPrompts();
  };

  const getActivePromptsToString = (parsedPrompts) => {
    let userStrinpromptVal = "";
    parsedPrompts.forEach((prompt) => {
      if (prompt.active) {
        userStrinpromptVal += prompt.content + "\n";
      }
    });
    return userStrinpromptVal;
  };

  useEffect(() => {
    //console.log("Fetching user prompts...");

    getPrompts();
  }, []);

  async function sendMessage(message) {
    setMessageFinished(false);
    setFullMessage("");

    console.log(systemPrompt);
    try {
      if (chatProvider === "puter") {
        const newMessage = [
          ...chatMessages,
          {
            role: "user",
            content: message + "\nMake 2 snippets : 1 js/jsx and 1 html",
          },
        ];
        newMessage[0].content = systemPrompt + " \n" + userStringPrompt;
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
        newMessage[0].content = systemPrompt + " \n" + userStringPrompt;
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
        newMessage[0].content = systemPrompt + " \n" + userStringPrompt;
        console.log(newMessage);

        newMessage.push({ role: "assistant", content: "..." });
        setChatMessages(newMessage);
        const response = await fetch("http://localhost:3002/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            systeme: systemPrompt + " \n" + userStringPrompt,
          }),
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
        newMessage[0].content = systemPrompt + " \n" + userStringPrompt;
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
      "g",
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
      `${codeString}(jsx|js|javascript)\n([\\s\\S]*)(?!${codeString})`,
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

  function optimizeImports(jsxCode) {
    const importRegex =
      /import\s+(?:(\w+),\s+)?{([^}]*)}\s+from\s+["']([^"']+)["']/g;
    const importMap = new Map();

    // Extract import statements and group them by source
    let match;
    while ((match = importRegex.exec(jsxCode)) !== null) {
      const [fullImport, defaultImport, namedImports, source] = match;
      if (!importMap.has(source)) {
        importMap.set(source, { defaultImport: null, namedImports: new Set() });
      }
      const importData = importMap.get(source);
      if (defaultImport) {
        importData.defaultImport = defaultImport;
      }
      namedImports.split(",").forEach((namedImport) => {
        importData.namedImports.add(namedImport.trim());
      });
    }

    // Generate optimized import statements
    const optimizedImports = Array.from(importMap.entries())
      .map(([source, { defaultImport, namedImports }]) => {
        const importParts = [];
        if (defaultImport) {
          importParts.push(defaultImport);
        }
        if (namedImports.size > 0) {
          importParts.push(`{ ${Array.from(namedImports).join(", ")} }`);
        }
        return `import ${importParts.join(", ")} from "${source}";`;
      })
      .join("\n");

    // Replace the original import statements with the optimized ones
    return jsxCode.replace(importRegex, "").trim() + "\n" + optimizedImports;
  }

  function transpileJSX(jsxCode) {
    jsxCode = transformImports(jsxCode);
    jsxCode = transformImports2(jsxCode);
    jsxCode = jsxCode.replace(/\`\`\`/g, "");

    const lines = jsxCode.split("\n");
    const renderLine = lines.find((line) => line.includes("ReactDOM.render"));
    if (renderLine) {
      lines.splice(lines.indexOf(renderLine), 1);
      lines.push(renderLine);
    }
    jsxCode = lines.join("\n");
    jsxCode = optimizeImports(jsxCode);

    try {
      const result = transform(jsxCode, {
        transforms: ["typescript", "jsx"],
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      });

      //console.log(result);
      jsxCode = result.code;
      //when there is a exact duplicate import in jsxCode
      const imports = jsxCode.match(/import\s+.*\s+from\s+.*;/g);
      if (imports) {
        const uniqueImports = [...new Set(imports)];
        jsxCode = jsxCode.replace(/import\s+.*\s+from\s+.*;/g, "");
        jsxCode = uniqueImports.join("\n") + jsxCode;
      }

      //when the import source from is the same, aggregate the imports
      //for example import React ,{useState } from "react"; import { useEffect, useRed} from "react";
      // should result in : import React {useState, useEffect, useRef} from "react";

      //Make sure the Line : ReactDOM.render...
      // is the last line
      // jsxCode is a string

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

  function transpileJSXForIframe(jsxCode) {
    jsxCode = transformImports(jsxCode);
    jsxCode = transformImports2(jsxCode);
    jsxCode = jsxCode.replace(/\`\`\`/g, "");

    const lines = jsxCode.split("\n");
    const renderLine = lines.find((line) => line.includes("ReactDOM.render"));
    if (renderLine) {
      lines.splice(lines.indexOf(renderLine), 1);
      lines.push(renderLine);
    }
    jsxCode = lines.join("\n");

    jsxCode = optimizeImports(jsxCode);

    //make sure every line that start with "import " is at the top of the file

    const llines = jsxCode.split("\n");
    const importLines = llines.filter((line) => line.startsWith("import "));
    const otherLines = llines.filter((line) => !line.startsWith("import "));
    jsxCode = importLines.join("\n") + "\n" + otherLines.join("\n");

    try {
      const result = transform(jsxCode, {
        transforms: ["typescript", "jsx"],
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      });

      //console.log(result);
      jsxCode = result.code;
      //make sure there is no dulicate import in jsxCode
      const imports = jsxCode.match(/import\s+.*\s+from\s+.*;/g);
      if (imports) {
        const uniqueImports = [...new Set(imports)];
        jsxCode = jsxCode.replace(/import\s+.*\s+from\s+.*;/g, "");
        jsxCode = uniqueImports.join("\n") + jsxCode;
      }

      const newCode = Babel.transform(jsxCode, {
        presets: ["react"],
      }).code;

      //editorBabelRef.current?.setValue(newCode);
      return newCode;
    } catch (error) {
      //console.error('Erreur de syntaxe dans le code JavaScript :', error);
      // Vous pouvez également afficher un message d'erreur à l'utilisateur ici
      //setBabelCode(`Error In JSX ${error}`);
      //editorBabelRef.current?.setValue(`Error In JSX ${error}`);

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

  function handleEditorWillMountJs(monaco) {
    console.log("mount");
    console.log(monaco);
    console.log(monaco.languages.javascript);

    //monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      tsx: "react",
      jsx: "react",
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      alwaysStrict: true,
      noEmit: true,
      //typeRoots: ["node_modules/@types"]
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Fetch and add type definitions for React and ReactDOM
    fetch("https://unpkg.com/@types/react/index.d.ts")
      .then((data) => data.text())
      .then((data) => {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          data,
          "file:///node_modules/@types/react/index.d.ts",
        );
      });

    fetch("https://unpkg.com/@types/react-dom/index.d.ts")
      .then((data) => data.text())
      .then((data) => {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          data,
          "file:///node_modules/@types/react-dom/index.d.ts",
        );
      });

    const puterTypeDefinition = "declare var puter: any;";

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      puterTypeDefinition,
      "filename.ts", // Vous pouvez utiliser n'importe quel nom de fichier ici, il n'a pas besoin d'exister réellement
    );
  }

  function handleEditorDidMountJs(editor, monaco) {
    //console.log("mount");
    editorJsRef.current = editor;
    editorJsRef.current?.setValue(jsCode);
    //monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    //     noSemanticValidation: false,
    //     noSyntaxValidation: false
    // })
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
  <html lang="en" style="background-color: transparent !important;color-scheme: none;backdrop-filter: blur(10px);height:100%">
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
      ${transpileJSXForIframe(jsCode)}
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
    setShowLoading(true);
    setLoadingMessage("Deploying App ...");
    let code = "";
    if (appName == "") {
      alert("No App Name");
      setShowLoading(false);
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
        `Website hosted at: <a href="https://${site.subdomain}.puter.site" target="_blank">https://${site.subdomain}.puter.site</a>`,
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
          JSON.stringify(response).split(",").join("\n"),
        );
        alert("App created : Success");
        setShowLoading(false);
      } catch (error) {
        alert("App created : Error");
        setShowLoading(false);
        console.log(
          "Failed to create app:",
          JSON.stringify(error).split(",").join("\n"),
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

  const onDragStart = (e, id, order) => {
    e.dataTransfer.setData("id", id);
    setDraggingId(id);
    setDraggingOrder(order);
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

  const [divToInsert, setDivToInsert] = useState(null);

  const sendMenuAction = (action) => {
    console.log(action);

    if (action == "togglePreview") {
      console.log(previewMode);
      if (previewMode == "normal") {
        console.log("Going Viewer Mode");
        setPreviewMode("viewer");
      } else {
        console.log("Going Normal Mode");
        setPreviewMode("normal");
      }
    }

    if (action === "toggleMenu") {
      setShowLeftMenu(!showLeftMenu);
      animateLeftMenu(showLeftMenu ? [0] : [42], 200);
    }

    if (action == "fullscreen-preview") {
      AnimateFullScreenPreview();
    }

    if (action == "normal-view") {
      if (MobileView) {
        AnimateChatPreviewMobile();
      } else {
        AnimateEqualCol();
      }
    }

    if (action == "chat-settings") {
      if (MobileView) {
        AnimateChatSettingMobile();
      } else {
        AnimateChatSetting();
      }
    }

    if (action == "console-log") {
      if (MobileView) {
        AnimateLogMobile();
      } else {
        AnimateLog();
      }
    }

    if (action == "code-view") {
      AnimateEditorFullscreen();
    }
    if (action == "code-preview") {
      AnimateCodePreview();
    }
    if (action == "chat-preview") {
      AnimateChatPreview();
    }
    if (action.indexOf("toggleId-") !== -1) {
      console.log("setInsertDiv");
      const actionSplit = action.split("-");
      const id = actionSplit[1];
      setDivToInsert(id);
      setInsertDiv(true);
      //add event listener for escape key to setInsertDiv(false);
      document.addEventListener("keydown", (event) => {
        setInsertDiv(false);
        //remove event listener
        document.removeEventListener("keydown", (event) => {});
      });

      //in 5 secs setInsertDiv(false); if not already set to false
    }
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

    if (action === "viewCustomPrompt") {
      setShowCustomPrompt(true);
    }

    if (action === "viewPrompts") {
      setShowViewPrompts(true);
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

  const [showViewPrompts, setShowViewPrompts] = useState(false);

  const saveAs = (e) => {
    setShowLoading(true);
    setLoadingMessage("Saving App ...");
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
                    setShowLoading(false);
                    setLoadingMessage("");

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
  const [htmlCode, setHtmlCode] = useState(templates[0].html);
  const [jsCode, setJsCode] = useState(templates[0].js);
  const [selectedCode, setSelectedCode] = useState("js");

  const [theIds, setTheIds] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [visiblesIds, setVisiblesIds] = useState([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const godMode = username == "samlepirate" ? true : false;

  const availableWindows = [
    "Chat View",
    "Code Editor",
    "Chat Settings",
    "App Preview",
    "Log Section",
    "Sandbox",
    "Speak to Text",
    "Text to Speak",
    "Git Client",
    "Fs Explorer",
  ];
  if (godMode) {
    availableWindows.push(
      "Sandbox",
      "Speak to Text",
      "Text to Speak",
      "Git Client",
      "Fs Explorer",
    );
  }

  const [theNames, setTheNames] = useState(availableWindows);

  const switchDiv = (from, to) => {
    let theTo = to - 1;

    console.log("switching", from, theTo);

    const newIds = [...theIds];
    const newNames = [...theNames];

    newIds[from] = newIds[theTo];
    newIds[theTo] = theIds[from];
    setTheIds(newIds);

    newNames[from] = newNames[theTo];
    newNames[theTo] = theNames[from];
    setTheNames(newNames);
  };

  const perfMonitor = `function getMemoryInfo() {
    if (window.performance && window.performance.memory) {
      const usedJSHeapSize = window.performance.memory.usedJSHeapSize;
      const totalJSHeapSize = window.performance.memory.totalJSHeapSize;
      const jsHeapSizeLimit = window.performance.memory.jsHeapSizeLimit;

      return {
        usedJSHeapSize,
        totalJSHeapSize,
        jsHeapSizeLimit,
      };
    }
    return null;
  }

  function sendMemoryInfoToParent() {
    const memoryInfo = getMemoryInfo();
    if (memoryInfo) {
      window.parent.postMessage(memoryInfo, '*');
    }
  }

  // Send memory info to parent window every 1 second
  setInterval(sendMemoryInfoToParent, 1000);`;

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

  const setJsCodeForAll = (code) => {
    setJsCode(code);
    editorJsRef.current?.setValue(code);
  };

  const [ollamaModels, setOllamaModels] = useState([]);

  const [ollamaAvailable, setOllamaAvailable] = useState(true);

  const [anthropicAvailable, setAnthropicAvailable] = useState(false);

  const [divs, setDivs] = useState([
    {
      id: 2,
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
          handleEditorWillMountJs={handleEditorWillMountJs}
          name="Code Editor"
        />
      ),
    },
    {
      id: 3,
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
      id: 4,
      content: (
        <CustomIframe
          jsCode={jsCode}
          htmlCode={htmlCode}
          consoleLog={consoleLog}
          transpileJSX={transpileJSXForIframe}
          messageFinished={messageFinished}
          name="App Preview"
          mode={previewMode}
        />
      ),
    },
    { id: 5, content: <LogSection name="Log Section" /> },
    {
      id: 1,
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
          setChatMessages={setChatMessages}
        />
      ),
    },
    {
      id: 6,
      content: <NextSandbox name="Next Sandbox" />,
    },
    {
      id: 7,
      content: <SpeechToText name="Speech To Text" />,
    },
    {
      id: 8,
      content: <TextToSpeak name="Text To Speak" />,
    },
    {
      id: 9,
      content: <FullView name="Git Client" />,
    },
    {
      id: 10,
      content: <FsExplorer name="Fs Explorer" setJsCode={setJsCodeForAll} />,
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
        if (codeSnippet.status == "completed") {
          codeSnippet.code = codeSnippet.code.replace(
            "import twindSetup",
            "import { setup as twindSetup }",
          );

          codeSnippet.code = codeSnippet.code.replace(
            `from "react"`,
            `from "https://esm.sh/react"`,
          );

          codeSnippet.code = codeSnippet.code.replace("", "");

          codeSnippet.code = codeSnippet.code.replace(
            "/tailwind/'",
            "/tailwind/shim'",
          );

          codeSnippet.code = codeSnippet.code.replace(
            '/tailwind/"',
            '/tailwind/shim"',
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
      try {
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
      } catch (error) {
        console.log("no liteLLM");
      }
    };

    const useLiteLLM = getUserSetting("use-liteLLM");

    if (useLiteLLM.value) {
      console.log("Get LiteLLM Models");
      console.log(useLiteLLM);
      getOllamaModel();
    }
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
      //console.log(modelList);
      //console.log(theModels);
      setOpenAiCongig({ ...openAiCongig, models: theModels });
    };
    if (apiKey != "") {
      getOpenAiModel();
    }
  }, [apiKey]);

  //get openai api key
  useEffect(() => {
    const updateUser = async () => {
      console.log("update user");
      const isSignedIn = puter.auth.isSignedIn();
      if (!isSignedIn) {
        console.log("user is not signed in...");
        await puter.auth.signIn();
      }
      const user = await puter.auth.getUser();
      setUsername(user.username);

      puter.ui.onLaunchedWithItems(async function (directories) {
        //console.log(directories);
        for (const directory of directories) {
          try {
            const response = await fetch(directory.readURL);
            const files = await response.json();
            //console.log(files);
            for (const file in files) {
              console.log(files[file]);
              if (!files[file]) {
                continue;
              }
              try {
                const fileResponse = await fetch(files[file].read_url);
                const fileData = await fileResponse.text();
                console.log(fileData);
                if (files[file].fsentry_name === "app.html") {
                  setHtmlCode(fileData);
                  editorHtmlRef.current?.setValue(fileData);
                }
                if (files[file].fsentry_name === "app.js") {
                  setJsCode(fileData);
                  editorJsRef.current?.setValue(fileData);
                }
              } catch (fileError) {
                console.log(fileError);
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      });

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
    const useAnthropic = getUserSetting("use-anthropic-proxy");
    if (!useAnthropic.value) {
      return;
    }
    try {
      fetch("http://localhost:3002/health")
        .then((response) => response.text())
        .then((data) => {
          if (data == "anthropic-proxy") {
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
  }, [jsCode]);

  useEffect(() => {
    const updateSize = () => {
      const navbar = document.getElementById("theNavbar");
      if (navbar) {
        //get navbar height in percent of window height
        const navbarHeight = navbar.clientHeight;
        const windowHeight = window.innerHeight;

        const navbarHeightPercent = (navbarHeight / windowHeight) * 100;

        setSizeContent(99 - navbarHeightPercent);
      }
    };

    // Call updateSize at the start in case the window is already the right size
    updateSize();

    // Attach the event listener
    window.addEventListener("resize", updateSize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener("resize", updateSize);
  }, [templates, jsCode]); // Empty array ensures that effect is only run on mount and unmount

  const [parentTitle, setParentTitle] = useState("");
  const [authorisedDomain, setAuthorisedDomain] = useState(true);

  // useEffect(() => {
  //   const parentTitleApp = window.parent.document.referrer;
  //   console.log("referer");
  //   console.log(parentTitleApp);
  //   if (parentTitleApp.indexOf("puter.com") === -1 || parentTitleApp.indexOf("http://localhost") === -1) {
  //     setAuthorisedDomain(true)
  //   } else {
  //     setAuthorisedDomain(false)
  //   }
  //   setParentTitle(parentTitleApp);
  // }, []);

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
                setChatMessages={setChatMessages}
                jsCode={jsCode}
                htmlCode={htmlCode}
              />
            ),
          };
        }
        return div;
      }),
    );
  }, [
    inputMessage,
    messageFinished,
    fullMessage,
    chatMessages,
    jsCode,
    htmlCode,
    showLeftMenu,
  ]);

  //update divs Navbar
  useEffect(() => {
    setDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.content.type === NavBar) {
          return {
            ...div,
            content: (
              <NavBar
                theNames={theNames}
                visiblesIds={visiblesIds}
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
                mode={previewMode}
              />
            ),
          };
        }
        return div;
      }),
    );
  }, [
    inputMessage,
    gptVal,
    apiKey,
    chatProvider,
    username,
    selectedPrompt,
    visiblesIds,
    theNames,
    previewMode,
  ]);

  //update divs ChatSettings
  useEffect(() => {
    //console.log(divs);
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
      }),
    );
  }, [chatProvider, ollamaConfig, openAiCongig, apiKey, selectedPrompt]);

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
                handleEditorWillMountJs={handleEditorWillMountJs}
                name="Code Editor"
              />
            ),
          };
        }
        return div;
      }),
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
                transpileJSX={transpileJSXForIframe}
                messageFinished={messageFinished}
                name="App Preview"
                mode={previewMode}
              />
            ),
          };
        }
        return div;
      }),
    );
  }, [jsCode, htmlCode, messageFinished, previewMode]);

  useEffect(() => {
    const newCode = transpileJSX(jsCode);
    setBabelCode(newCode);
  }, [jsCode]);

  const [showDeployForm, setShowDeployForm] = useState(false);
  const [showSaveAsForm, setShowSaveAsForm] = useState(false);
  const [showGuideView, setShowGuideView] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const insertHere = (id) => {
    console.log("insertHere");
    console.log(id);

    switchDiv(divToInsert, id);
    setInsertDiv(false);
  };

  return (
    <>
      {MobileView ? (
        <div className="dark:bg-black bg-black">
          {showLoading && (
            <div className="absolute top-0 dark:bg-dark bg-light dark:text-light text-dark left-0 w-full h-screen z-50 opacity-90">
              <LoadingDiv message={loadingMessage} />
            </div>
          )}
          {showCustomPrompt && (
            <CustomPrompt
              setShowCustomPrompt={setShowCustomPrompt}
              updatePrompts={updatePrompts}
            />
          )}
          {showViewPrompts && (
            <ViewPrompts
              setShowViewPrompts={setShowViewPrompts}
              selectedPrompt={selectedPrompt}
              prompts={prompts}
              userStringPrompt={userStringPrompt}
            />
          )}
          {authorisedDomain === false && (
            <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light dark:text-light text-dark bg-opacity-50 flex items-center justify-center z-50">
              <p>Only available on puter.com</p>
            </div>
          )}
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
          <div>
            <NavBar
              theNames={theNames}
              visiblesIds={visiblesIds}
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
              mode={previewMode}
            />
          </div>
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
              className="w-full dark:bg-black bg-black"
              size={`${sizeContent}%`}
              touchHandleSize={20}
              trackSize={false}
              scrollable={false}
            >
              <Space.Fill trackSize={true}>
                <Space.BottomResizable
                  size={`${sizeCols[0]}%`}
                  touchHandleSize={20}
                  trackSize={false}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[0]}
                      order={1}
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
                <Space.BottomResizable
                  size={`${sizeCols[1]}%`}
                  touchHandleSize={20}
                  trackSize={false}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[1]}
                      order={2}
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
                    size={`${sizeRows[0]}%`}
                    touchHandleSize={20}
                    trackSize={true}
                    scrollable={false}
                  >
                    <Space.Fill>
                      <DraggableUI
                        draggingOrder={draggingOrder}
                        insertDiv={insertDiv}
                        insertHere={insertHere}
                        id={theIds[2]}
                        order={3}
                        className={""}
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
                </Space.BottomResizable>
                <Space.BottomResizable
                  size={`${sizeCols[2]}%`}
                  touchHandleSize={20}
                  trackSize={true}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[3]}
                      order={4}
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
                    size={`${sizeRows[1]}%`}
                    touchHandleSize={20}
                    trackSize={true}
                    scrollable={false}
                  >
                    <Space.Fill>
                      <DraggableUI
                        draggingOrder={draggingOrder}
                        insertDiv={insertDiv}
                        insertHere={insertHere}
                        id={theIds[4]}
                        className={""}
                        order={5}
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
                </Space.BottomResizable>
              </Space.Fill>
            </Space.Bottom>
          </Space.ViewPort>
        </div>
      ) : (
        <div className="dark:bg-black bg-black">
          {showLoading && (
            <div className="absolute top-0 dark:bg-dark bg-light dark:text-light text-dark left-0 w-full h-screen z-50 opacity-90">
              <LoadingDiv message={loadingMessage} />
            </div>
          )}

          {showCustomPrompt && (
            <CustomPrompt
              setShowCustomPrompt={setShowCustomPrompt}
              updatePrompts={updatePrompts}
            />
          )}

          {showViewPrompts && (
            <ViewPrompts
              setShowViewPrompts={setShowViewPrompts}
              selectedPrompt={selectedPrompt}
              prompts={prompts}
              userStringPrompt={userStringPrompt}
            />
          )}

          {authorisedDomain === false && (
            <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light dark:text-light text-dark bg-opacity-50 flex items-center justify-center z-50">
              <p>Only available on puter.com</p>
            </div>
          )}

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

          <div>
            <NavBar
              theNames={theNames}
              visiblesIds={visiblesIds}
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
              mode={previewMode}
            />
          </div>

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
              className="w-full dark:bg-black bg-black"
              size={`${sizeContent}%`}
              touchHandleSize={20}
              trackSize={false}
              scrollable={false}
            >
              <Space.Fill trackSize={true}>
                <Space.Left //MenuBar
                  size={`${sizeLeftMenu}px`}
                  touchHandleSize={20}
                  trackSize={false}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <MenuBar name="Menu Bar" />
                  </Space.Fill>
                </Space.Left>

                <Space.LeftResizable
                  size={`${sizeCols[0]}%`} //Sige of the left resizable : Chat View
                  touchHandleSize={20}
                  trackSize={false}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[0]}
                      order={1}
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
                  size={`${sizeCols[1]}%`} //size of Editor
                  touchHandleSize={20}
                  trackSize={false}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[1]}
                      order={2}
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
                    size={`${sizeRows[0]}%`}
                    touchHandleSize={20}
                    trackSize={true}
                    scrollable={false}
                  >
                    <Space.Fill>
                      <DraggableUI
                        draggingOrder={draggingOrder}
                        insertDiv={insertDiv}
                        insertHere={insertHere}
                        id={theIds[2]}
                        order={3}
                        className={""}
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
                  size={`${sizeCols[2]}%`} //size of right resizable : Preview
                  touchHandleSize={20}
                  trackSize={true}
                  scrollable={false}
                >
                  <Space.Fill trackSize={true}>
                    <DraggableUI
                      draggingOrder={draggingOrder}
                      insertDiv={insertDiv}
                      insertHere={insertHere}
                      className={""}
                      id={theIds[3]}
                      order={4}
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
                    size={`${sizeRows[1]}%`}
                    touchHandleSize={20}
                    trackSize={true}
                    scrollable={false}
                  >
                    <Space.Fill>
                      <DraggableUI
                        draggingOrder={draggingOrder}
                        insertDiv={insertDiv}
                        insertHere={insertHere}
                        id={theIds[4]}
                        className={""}
                        order={5}
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
      )}
    </>
  );
};

export default App;
