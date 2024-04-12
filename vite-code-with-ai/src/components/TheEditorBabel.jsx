import React from "react";
import Editor from "@monaco-editor/react";

const TheEditorBabel = ({
  handleEditorDidMount,
  babelCode,
  onChange,
  theme,
}) => {
  return (
    <Editor
      height="90%"
      defaultLanguage={"javascript"}
      defaultValue={babelCode}
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

export default TheEditorBabel;
