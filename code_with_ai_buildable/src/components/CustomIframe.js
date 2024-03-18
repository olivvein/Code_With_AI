
import React from "react";

function CustomIframe({
  jsCode,
  htmlCode,
  consoleLog,
  transpileJSX,
  messageFinished,
}) {
  const cats = [
    "https://i.giphy.com/7NoNw4pMNTvgc.webp",
    "https://c.tenor.com/y2JXkY1pXkwAAAAC/tenor.gif",
  ];

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

export default CustomIframe;