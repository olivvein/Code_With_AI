import React, { useState, useEffect } from "react";
import * as Space from "react-spaces";
import * as Diff from "diff";

import FS from "@isomorphic-git/lightning-fs";
import {
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowNarrowRightIcon,
  ArrowNarrowLeftIcon,
} from "@heroicons/react/outline";

import MarkDownView from "./MarkDownView";

import { Editor, DiffEditor } from "@monaco-editor/react";

const TheEditorJs2 = ({ jsCode, fileName, handleEditorChange }) => {
  let language =
    fileName.indexOf(".tsx") != -1
      ? "typescript"
      : fileName.indexOf(".jsx") != -1
      ? "javascript"
      : "javascript";

  if (fileName.indexOf(".html") != -1) {
    language = "html";
  }
  if (fileName.indexOf(".css") != -1) {
    language = "css";
  }
  if (fileName.indexOf(".json") != -1) {
    language = "json";
  }
  if (fileName.indexOf(".md") != -1) {
    language = "markdown";
  }

  console.log(language);

  return (
    <Editor
      height="90%"
      defaultLanguage={language}
      defaultValue={jsCode}
      path={fileName}
      theme={"vs-dark"}
      onChange={handleEditorChange}
      options={{
        minimap: {
          enabled: true,
        },
        cursorStyle: "block",
      }}
    />
  );
};

const FsExplorer = ({ name, setJsCode }) => {
  const [fs, setFs] = useState(new FS("code-root",{ wipe: false }));
  const [dir, setDir] = useState("/");
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState({ name: "", content: "" });
  const [file2, setFile2] = useState({ name: "", content: "" });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Chargement...");

  useEffect(() => {
    readDir(dir);
  }, [fs, dir]);

  const applyDiff = (file, gitDiff) => {
    //const patches = dmp.patch_fromText(diffText);
    //const results = dmp.patch_apply(patches, originalText);
    //console.log(results[0])
    //console.log(results)
    //console.log(patches)
    //setDiffText(results[0]);`
    const patcheText = Diff.parsePatch(gitDiff);
    const reversePatch = Diff.reversePatch(patcheText);
    const patchedFile = Diff.applyPatch(file, gitDiff);
    console.log(patchedFile);

    console.log(reversePatch);

    const restoredFile = Diff.applyPatch(patchedFile, reversePatch);
    console.log(restoredFile);

    if (restoredFile == file) {
      console.log("It Works !!");
    }
  };

  const getDiff = (file, file2) => {
    const patch = Diff.createTwoFilesPatch(
      "file1.txt",
      "file1.txt",
      file,
      file2
    );
    console.log(patch);
    const stringPatch = Diff.parsePatch(patch);
    console.log(stringPatch);
    return patch;
  };

  const saveFile = () => {
    if (file.name == "") {
      return;
    }
    setLoading(true);
    setLoadingMessage("Saving...");
    const path = file.name.replace("//", "/");
    console.log(path);

    console.log(file.content);

    //make file content a string of a Uint8Array
    const content = new TextEncoder().encode(file.content);

    fs.writeFile(file.name, content, (error) => {
      if (error) {
        console.error(error);
        setLoading(false);
      } else {
        console.log("File saved");
        readDir(dir);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    //ctrl + s to safe file
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    });

    return () => {
      document.removeEventListener("keydown", () => {});
    };
  }, [file]);

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

  const readDir = (dir) => {
    setLoading(true);
    setLoadingMessage("Loading...");
    fs.readdir(dir, async (error, data) => {
      if (error) {
        console.error(error);
      } else {
        const filesInfo = [];
        let jsCode = "";
        for (const file of data) {
          if (file.indexOf(".js") !== -1) {
            //read the file and set the js code
            const data = await fs.promises.readFile(dir + "/" + file, "utf8");
            jsCode = "//file: " + file + "\n" + jsCode + data + "\n";
          }
          fs.stat(dir + "/" + file, (error, stat) => {
            if (error) {
              console.error(error);
            } else {
              filesInfo.push({ name: file, ...stat });
            }
          });
        }
        if (jsCode !== "") {
          const lines = jsCode.split("\n");
          const renderLine = lines.find((line) =>
            line.includes("ReactDOM.render")
          );
          if (renderLine) {
            lines.splice(lines.indexOf(renderLine), 1);
            lines.push(renderLine);
          }
          jsCode = lines.join("\n");

          jsCode = optimizeImports(jsCode);

          //make sure every line that start with "import " is at the top of the file

          const llines = jsCode.split("\n");
          const importLines = llines.filter((line) =>
            line.startsWith("import ")
          );
          const otherLines = llines.filter(
            (line) => !line.startsWith("import ")
          );
          jsCode = importLines.join("\n") + "\n" + otherLines.join("\n");
          setJsCode(jsCode);
        }

        setFiles(filesInfo);
        setLoading(false);
      }
    });
  };

  const navigateTo = (path) => {
    setFile({ name: "", content: "" });
    setDir(path);
  };

  const navigateBack = () => {
    let parts = dir.split("/");
    parts.pop();
    let newPath = parts.join("/");
    setFile({ name: "", content: "" });
    setDir(newPath);
  };

  const readFile = (path) => {
    fs.readFile(path, "utf8", (error, data) => {
      if (error) {
        console.error(error);
      } else {
        setFile({ name: path, content: data });
      }
    });
  };

  const handleEditorChange = (value, event) => {
    setFile2({ ...file, content: value });
    setFile({ ...file, content: value });
    //console.log(value);
    //const diff = getDiff(file.content, value);
    //console.log(diff);
  };

  return (
    <div className="w-full h-full bg-gray-600  dark:text-light text-dark flex flex-col items-center justify-center">
      {loading && (
        <div className="z-50 absolute top-0 left-0 w-full h-full bg-gray-800/30 backdrop-blur flex items-center justify-between p-4 ">
          {loadingMessage}
        </div>
      )}
      <Space.ViewPort className="mt-7">
        <Space.Fill trackSize={true}>
          <Space.LeftResizable
            size={`30%`} //Sige of the left resizable : Chat View
            touchHandleSize={20}
            trackSize={true}
            scrollable={true}
          >
            <Space.Fill trackSize={true}>
              <div className="flex w-full min-w-fit h-full flex-col bg-gray-600 ">
                <span className="text-2xl p-4">{dir.replace("//", "/")}</span>
                <div className="flex items-center p-4">
                  <button
                    onClick={() => navigateTo("/")}
                    className="flex items-center space-x-2"
                  >
                    <span className=" text-blue-400">/</span>
                  </button>
                  {dir !== "/" && (
                    <button
                      onClick={navigateBack}
                      className="flex items-center space-x-2 ml-4"
                    >
                      <ArrowNarrowLeftIcon className="h-5 w-5 text-blue-400" />
                      <span>Retour</span>
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-0 flex flex-col justify-start">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 h-full hover:bg-gray-500 my-0 cursor-pointer "
                    >
                      {file.type === "dir" ? (
                        <span
                          onClick={() => navigateTo(dir + "/" + file.name)}
                          className="h-full flex items-center space-x-2 w-full "
                        >
                          <FolderOpenIcon className="h-5 w-5 text-blue-400" />
                          <span>{file.name}</span>
                        </span>
                      ) : (
                        <span
                          className="h-full flex w-full"
                          onClick={() => readFile(dir + "/" + file.name)}
                        >
                          <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                          <span>{file.name}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Space.Fill>
          </Space.LeftResizable>

          <Space.Fill
            size={`30%`} //size of Editor
            touchHandleSize={20}
            trackSize={false}
            scrollable={false}
          >
            <Space.Fill trackSize={true} className="m-0 h-screen">
              <div className="w-full h-full m-0">
                {file.name != "" &&
                  (file.name.indexOf(".md") != -1 ? (
                    <MarkDownView
                      content={file.content}
                      className="dark:bg-dark bg-light dark:text-light text-dark h-full"
                    />
                  ) : (
                    <div className="dark:bg-dark bg-light dark:text-light text-dark h-full filter-shadow shadow-xl drop-shadow-xl z-40">
                      <TheEditorJs2
                        jsCode={file.content}
                        fileName={file.name}
                        handleEditorChange={handleEditorChange}
                      />
                    </div>
                  ))}
              </div>
            </Space.Fill>
          </Space.Fill>
        </Space.Fill>
      </Space.ViewPort>
    </div>
  );
};

export default FsExplorer;
