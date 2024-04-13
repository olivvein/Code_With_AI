import React, { useState } from "react";
import LoadingDiv from "./LoadingDiv";

const GenerativeUI = ({
  name,
  inputSubmit,
  inputMessage,
  setInputVal,
  messageFinished,
  resetChatMessages,
  jsCode,
  htmlCode,
  transpileJSX,
  consoleLog,
}) => {
  const [chatInput, setChatInput] = useState("");

  const [iframeContent, setIframeContent] = useState("");

  const isModule = jsCode.includes("import") || jsCode.includes("export");
  const moduleTag = isModule ? "type=module" : "";

  let fullHtmlCode = jsCode
    ? `<html>${htmlCode}<script src="https://js.puter.com/v2/"></` +
      `script><script ${moduleTag}>const puter = window.puter;\n${transpileJSX(
        jsCode
      )}<` +
      `/script><div class="fixed bottom-0"><pre class="fixed opacity-50 bottom-12 w-full dark:bg-dark bg-light dark:text-light text-dark" id="logs2"></pre></div><script>${consoleLog}</` +
      `script></html>`
    : "";

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1>Generative UI</h1>

      {(messageFinished == 0 || htmlCode == "" || jsCode == "") && (
        <LoadingDiv message={"Loading ...."} />
      )}
      {messageFinished == 1 && (
        <iframe
          className="w-4/5 h-4/5 dark:bg-dark bg-light dark:text-light text-dark border dark:border-light border-dark rounded shadow-lg"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
          allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; document-domain; encrypted-media; execution-while-not-rendered; execution-while-out-of-viewport; fullscreen; picture-in-picture; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; navigation-override; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; wake-lock; xr-spatial-tracking"
          srcDoc={jsCode === "" ? "" : messageFinished ? fullHtmlCode : ""}
        />
      )}

      <div className="w-4/5 h-1/5 flex flex-row">
        <textarea
          type="text"
          rows={Math.max(inputMessage.split("\n").length, 2)}
          placeholder={`Make a weather app for Ales, France.\nMake a graph for BTC, what is the news?
          `}
          className="block p-2.5 outline-none ml-2 mb-2 h-3/4  w-full p-2 w-5/6 m-auto text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          className="block p-2.5 outline-none ml-2 mb-2 h-3/4  p-2 w-1/6 m-auto text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default GenerativeUI;
