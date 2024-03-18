
import React from "react";
import Editor from "@monaco-editor/react";

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

export default TheEditorHtml;