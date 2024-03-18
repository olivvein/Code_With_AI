
import React, { useState, useEffect } from "react";
import TheEditorJs from "./TheEditorJs";
import TheEditorHtml from "./TheEditorHtml";
import TheEditorBabel from "./TheEditorBabel";

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

export default CodeEditor;