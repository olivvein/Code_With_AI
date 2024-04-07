
import React from "react";
import Editor from "@monaco-editor/react";

const TheEditorJs = ({ handleEditorDidMount, handleEditorWillMount,jsCode, onChange, theme,fileName }) => {
  const language=fileName.indexOf(".tsx")!=-1?"typescript":(fileName.indexOf(".jsx")!=-1?"javascript":"javascript");
  return (
    <Editor
      height="90%"
      defaultLanguage={language}
      defaultValue={jsCode}
      path={fileName}
      theme={theme}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
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