import React, { useState } from "react";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

const SandBox = () => (
  <div className="w-full h-full">
    <SandpackProvider
    style={{ height: "100vh", margin: 0 }}
    className="w-full h-full"
      customSetup={{
        dependencies: {
          "react-markdown": "latest",
        },
      }}
      // files={{
      //   "/tailwind.config.js": `module.exports = {
      //     content: [
      //       "./src/**/*.{js,jsx,ts,tsx}",
      //     ],
      //     theme: {
      //       extend: {},
      //     },
      //     plugins: [],
      //   }`,
      // }}
      template="react"
      options={{
        externalResources: [
          "https://js.puter.com/v2/",
          "https://cdn.tailwindcss.com",
        ],
      }}
    >
      <SandpackLayout options={{
        editorHeight: 800,

      }}>
        {/* <SandpackFileExplorer style={{ height: "100%" }}/>
        <SandpackCodeEditor style={{ height: "100%" }}/> */}
        <SandpackPreview style={{ height: "80vh" }}/>
        {/* <SandpackConsole style={{ height: "100%" }}/> */}
      </SandpackLayout>
    </SandpackProvider>
  </div>
);

import { Sandpack } from "@codesandbox/sandpack-react";

const SandBoxOld = () => {
  const files = {};
  const divHeight=window.innerHeight-200;

  return (

    <Sandpack
      theme="light"
      template="react"
      options={{
        showEditor: false,
        showOpenInCodeSandbox: false,
        editorHeight: divHeight, 
        showRefreshButton: true,
      }}
    />
  );
};

export default SandBox;
