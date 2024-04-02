"use client";
import React, { useEffect, useState } from "react";
import {
  Sandpack,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  SandpackFileExplorer,
  useSandpack,
  SandpackLayout,
  useActiveCode
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";

import { findDependenciesInFiles } from "../utils/dependency";

type Codefile = {
  path: string;
  code: string;
};

type SandBoxProps = {
  files: Codefile[];
  setTheFiles: any;
};

const SandpackFiles = ({
  setCodeFiles,
}: {
  setCodeFiles: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const { sandpack } = useSandpack();
  const { code, updateCode } = useActiveCode();

  useEffect(() => {
    const getFilesAndContent = async () => {
      if (sandpack) {
        const files = await sandpack.files;
        setCodeFiles(files);
      }
    };

    getFilesAndContent();
    let halfScreenWidthPx = window.innerWidth / 2;
    let previewPack = document.querySelector(".previewPack");
    let parent = previewPack?.parentElement?.parentElement?.parentElement;
    let parentWidth = parent?.clientWidth;
    let parentHeight = parent?.clientHeight;
    if (previewPack instanceof HTMLElement) {
      previewPack.style.width = parentWidth + "px";
      previewPack.style.height = parentHeight + "px";
    }
  }, []);

  return <></>;
};

const SandpackWrapper = (props: { files: SandBoxProps }) => {
  const [theFiles, setTheFiles2] = useState([] as Codefile[]);
  
  useEffect(() => {
    console.log("Use Effect File modif");
    const tailwindFile = {
      "tailwind.config.js": `import type { Config } from "tailwindcss";

    const config: Config = {
      content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      theme: {
        extend: {
          backgroundImage: {
            "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            "gradient-conic":
              "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
          },
        },
      },
      plugins: [],
    };
    export default config;
    
    `,
    };
    const newFile = { "src/index.css": { code: `@tailwind base;` } };
    if (theFiles === undefined) {
      return;
    }
    console.log("heFiless");
    console.log(theFiles);
    // theFiles["tailwind.config.ts"]={code:tailwindFile["tailwind.config.js"]}
    // theFiles["postcss.config.js"]={code:`module.exports = {
    //   plugins: {
    //     tailwindcss: {},
    //     autoprefixer: {},
    //   },
    // };`};
    props.files.setTheFiles(theFiles);
    console.log("theFiles modif from sandbox");
    console.log(theFiles);
  }, [theFiles]);

  //console.log(props.files.files )
  const fileListAsObject = props.files.files.reduce(
    (acc: { [key: string]: string }, file) => {
      acc[file.path] = file.code || "";
      return acc;
    },
    {}
  );

  const getDependencies = (files: Codefile[]) => {
    if (files === undefined || files.length === 0) {
      return "{}";
    }
    const dependencies = findDependenciesInFiles(files);
    // dependencies["tailwindcss"] = "^3.3.0";
    // dependencies["autoprefixer"] = "^10.0.1";
    // dependencies["postcss"] = "^8";
    // dependencies["ts-node"] = "^10.4.0";
    dependencies["react-router-dom"] = "^6.0.0";
    dependencies["@stream-io/video-react-sdk"] = "0.5.0";

    return JSON.stringify(dependencies);
  };

  return (
    <div className="w-full h-full flex flex-row border border-black rounded-lg">
      <SandpackProvider
      theme="dark"
        key={JSON.stringify(props.files.files)}
        template="react"
        customSetup={{
          dependencies: JSON.parse(getDependencies(props.files.files)),
        }}
        files={fileListAsObject}
        options={{
          // classes: {
          //   "sp-wrapper": "custom-wrapper",
          //   "sp-preview": "custom-layout",
          //   "sp-tab-button": "custom-tab",
          // },
          externalResources: [
            "https://js.puter.com/v2/",
            "https://cdn.tailwindcss.com",
          ],
        }}
      >
        <SandpackFiles setCodeFiles={setTheFiles2} />
        <SandpackLayout>
          <SandpackFileExplorer />
          <SandpackCodeEditor
            showTabs
            showLineNumbers={false}
            showInlineErrors
            wrapContent
            closableTabs
            extensions={[autocompletion()]}
            extensionsKeymap={[...completionKeymap]}
          />

          <SandpackPreview
            className="w-full h-full previewPack"
            showNavigator
            showOpenInCodeSandbox={true}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default SandpackWrapper;
