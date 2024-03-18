
import React from "react";
import Editor from "@monaco-editor/react";

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

export default TheEditorJs;