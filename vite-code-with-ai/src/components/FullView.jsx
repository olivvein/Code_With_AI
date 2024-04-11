/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DpkWciPvvTA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { useState, useEffect, SVGProps } from "react";

import FS from "@isomorphic-git/lightning-fs";
import MagicPortal from "magic-portal";
import * as Diff from "diff";
import { Editor, DiffEditor } from "@monaco-editor/react";
import CommitList from "./git/CommitList";

//import * as git from 'isomorphic-git';
//import http from "isomorphic-git/http/web";
//import FS from '@isomorphic-git/lightning-fs';
const fs = new FS("localRoot4", { wipe: false });

export default function Component({ name }) {
  const [cloneStatus, setCloneStatus] = useState("");
  const [files, setFiles] = useState([]);

  const [worker, setWorker] = useState(null);
  const [portal, setPortal] = useState(null);
  const [workerThread, setWorkerThread] = useState(null);
  const [repo, setRepo] = useState("");
  const [commits, setCommits] = useState([]);
  const [changes, setChanges] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [dirName, setDirName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [commitOid, setCommitOid] = useState("");
  const [myCommitAuthor, setMyCommitAuthor] = useState("");
  const [diffCode, setDiffCode] = useState("");
  const [allRepos, setAllRepos] = useState([]);
  const [fetchMessage, setFetchMessage] = useState("");

  const puter = window.puter;

  useEffect(() => {
    const updateUser = async () => {
      const isSignedIn = puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
      }
      const user = await puter.auth.getUser();
      setUsername(user.username);
      const helloFile = await puter.fs.write("hello.txt", "hello");
      console.log(helloFile.dirname);
      setDirName(helloFile.dirname);
      const fetchedKeys = await puter.kv.list(true);
      const repos = [];
      for (const field of fetchedKeys) {
        if (field.key.startsWith("repo-")) {
          repos.push(field.value.replace("repo-", ""));
        }
      }

      if (repos.length > 0) {
        setRepo(repos[0]);
      }

      

      setAllRepos(repos);
    };
    updateUser();
  }, []);

  const gitAdd = async (path) => {
    await workerThread.setDir("/" + repo);
    let filesList = await workerThread.listFiles({});
    let hasAdded = false;
    for (const file of filesList) {
      const status = await workerThread.status({ filepath: file });
      if (status != "unmodified") {
        console.log("Adding " + file);
        await workerThread.add({ filepath: file });
        hasAdded = true;
      }
    }
  };

  const gitCommit = async (message) => {
    await workerThread.commit(message);
  };

  const makeCommit = async () => {
    const commitArgs = {
      author: {
        name: "olivvein",
        email: "olivier.veinand@gmail.com",
      },
      message: "modified Title",
    };
    console.log(commitArgs);
    const oiid = await gitCommit(commitArgs);
    console.log("Commited");
    console.log(oiid);
  };

  const gitPush = async () => {
    await workerThread.push({
      remote: "origin",
      ref: "main",
      url: "https://github.com/" + repo,
    });
  };

  const [modifiedFiles, setModifiedFiles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState("");

  const gitPull = async () => {
    try {
      await workerThread.pull({
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/" + repo,
        depth: 20,
        author: { name: "olivvein", email: "olivier.veinand@gmail.com" },
      });
      gitStatus();
    } catch (error) {
      console.log(error);
    }
  };

  const gitFetch = async () => {
    console.log("Fetch");
    setFetchMessage("Fetching...");
    try {
      await workerThread.fetch({
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/" + repo,
        depth: 20,
      });
      gitStatus();
    } catch (error) {
      console.log(error);
    }
  };

  const gitStatus = async () => {
    console.log("Status");
    console.log("Reading dir : ", repo);
    //setFetchMessage("");
    await workerThread.setDir("/" + repo);
    let filesList = await workerThread.listFiles({});
    const modified = [];
    console.log(filesList);
    for (const file of filesList) {
      const status = await workerThread.status({ filepath: file });
      console.log(file);
      if (status != "unmodified") {
        modified.push(file + " is " + status);
      }
    }

    console.log(modified);
    setModifiedFiles(modified);

    let commits = await workerThread.log({});
    //reverse the commits
    //commits = commits.reverse();
    setCommits(commits);
    console.log(commits);

    const branches = await workerThread.listBranches({ remote: "origin" });
    setBranches(branches);
    console.log(branches);
    const curBranch = await workerThread.currentBranch({});
    console.log(curBranch);
    setCurrentBranch(curBranch);
  };

  const addToChanges = async (change) => {
    console.log(change);
    console.log("Reading file", "/" + repo + "/" + change.path);
    const oldContent = await fs.promises.readFile(
      "/" + repo + "/" + change.path,
      "utf8"
    );
    const patch = createDiffPatch(
      change.path,
      change.path,
      change.content,
      change.content3
    );
    change.oldContent = change.content;
    change.content = patch;

    change.language = "javascript";

    change.language =
      change.path.indexOf(".tsx") != -1
        ? "typescript"
        : change.path.indexOf(".jsx") != -1
        ? "javascript"
        : "javascript";

    if (change.path.indexOf(".html") != -1) {
      change.language = "html";
    }
    if (change.path.indexOf(".css") != -1) {
      change.language = "css";
    }
    if (change.path.indexOf(".json") != -1) {
      change.language = "json";
    }
    if (change.path.indexOf(".md") != -1) {
      change.language = "markdown";
    }

    setChanges((prev) => [...prev, change]);
  };

  const createDiffPatch = (oldName, newName, oldContent, newContent) => {
    const patch = Diff.createTwoFilesPatch(
      oldName,
      newName,
      oldContent,
      newContent,
      { options: { context: 8 } }
    );
    //console.log(simplepatch));
    return patch;
  };

  useEffect(() => {
    // Create a new web worker
    const myWorker = new Worker(
      new URL("../utils/gitWorker.js", import.meta.url)
    );

    const pp = new MagicPortal(myWorker);

    //myWorker.addEventListener("message", ({ data }) => console.log(data));

    const mainThread = {
      async print(message) {
        console.log(message);
      },
      async getFetch(message) {
        console.log(message);
        setFetchMessage(message);
      },
      async progress(evt) {
        console.log(evt);
        setLoadingMessage(evt.phase + " " + evt.loaded + "/" + evt.total);
      },
      async sendChange(change) {
        //console.log(change);
        if (change.type !== "equal") {
          console.log("Adding", change.type);
          if (change.path.indexOf("-lock.yaml") == -1) {
            addToChanges(change);
          }
        }
      },
      async fill(url) {
        let username = window.prompt("Username:");
        let password = window.prompt("Personal Acces Token:");
        return { username, password };
      },
      async rejected({ url, auth }) {
        window.alert("Authentication rejected");
        return;
      },
    };

    pp.set("mainThread", mainThread, {
      void: ["print", "progress", "rejected"],
    });

    setWorker(myWorker);
    setPortal(pp);

    console.log(pp);
  }, [repo]);

  const getAllFiles = async () => {
    let files = await workerThread.listFiles({});
    const allFiles = []; //array of {dirname:"",filename:""}
    //extract filename from path
    for (let path of files) {
      const pathParts = path.split("/");
      const filename = pathParts[pathParts.length - 1];
      const dirname = pathParts.slice(0, pathParts.length - 1).join("/");
      allFiles.push({ dirname: dirname, filename: filename });
    }
    // make reduce the array to a array of {dirname:"uniques_dir",files:[filenames]}
    const filesByDir = allFiles.reduce((acc, file) => {
      if (!acc[file.dirname]) {
        acc[file.dirname] = [];
      }
      acc[file.dirname].push(file.filename);
      return acc;
    }, {});

    //change the filesByDir object to an array of {dirname:"",files:[filenames]}
    const filesByDirArray = Object.keys(filesByDir).map((key) => ({
      dirname: repo + "/" + key,
      files: filesByDir[key],
    }));

    return filesByDirArray;
  };

  useEffect(() => {
    if (!portal) return;
    const getWorkerThread = async () => {
      const wt = await portal.get("workerThread");
      setWorkerThread(wt);
      gitStatus();
    };
    getWorkerThread();
  }, [portal]);

  const progressView = (operationId, progress) => {
    setLoadingMessage("Uploading files to puter :" + progress + "%");
    //console.log(`Upload progress for operation ${operationId}: ${progress}%`);
  };

  const ViewDif = async (change) => {
    console.log(change);
    //get commit.content and orifginal file
    const originalContent = await fs.promises.readFile(
      "/" + repo + "/" + change.path,
      "utf8"
    );

    const diffChange = { ...change, originalContent };

    console.log(diffChange);

    setDiffCode(diffChange);
  };

  const syncDirectory = async () => {
    console.time("syncDirectory");
    console.log("Syncing directory");
    setLoading(true);
    const fileMap = await getAllFiles();
    setLoadingMessage("Clearing dir :" + repo);
    try {
      await puter.fs.delete(repo, { recursive: true });
    } catch (error) {
      console.log(error);
    }
    setLoadingMessage("Creating Dir :" + repo);
    await puter.fs.mkdir(repo, { createMissingParents: true });
    const uploadPhases = fileMap.length;
    let thePhase = 0;
    for (const theDir of fileMap) {
      const theDirPath = theDir.dirname;
      const theFiles = theDir.files;
      const theFilesAsFile = [];
      for (const path of theFiles) {
        //console.log("Reading file", path);
        setLoadingMessage("Reading file", theDirPath + "/" + path);

        const data = await fs.promises.readFile(
          "/" + theDirPath + "/" + path,
          "utf8"
        );
        const blob = new Blob([data], { type: "text/plain" });
        const theNewFile = new File([blob], path);
        theFilesAsFile.push(theNewFile);
      }
      console.log("Uploading files to puter", theDir.dirname);
      console.log("Upload Phase:", thePhase, "/", uploadPhases);
      setLoadingMessage("Upload Phase:", thePhase, "/", uploadPhases);

      setLoadingMessage("Uploading files to puter :" + theDir.dirname);
      await puter.fs.mkdir(theDir.dirname, { createMissingParents: true });
      const allUploaded = await puter.fs.upload(
        theFilesAsFile,
        theDir.dirname,
        { progress: progressView }
      );

      if (!Array.isArray(allUploaded)) {
        if (!allUploaded.dirname) {
          console.log("Error for :");
          console.log(allUploaded);
        }
      } else {
        for (const ff of allUploaded) {
          if (!ff.dirname) {
            console.log("Error for :");
            console.log(ff);
          }
        }
      }

      console.timeEnd("Upload", "s");
      thePhase = thePhase + 1;
    }

    //console.log(fileMap);
    setLoading(false);
    console.timeEnd("syncDirectory", "s");

    return;
  };

  const recursiveReadDir = async (dir) => {
    console.log("Reading dir : ", dir);
    const listitems = await puter.fs.readdir(dir);
    const allFiles = [];
    const allDirs = [];
    for (const item of listitems) {
      if (item.is_dir) {
        allDirs.push(item.path);
        const [files, ddirs] = await recursiveReadDir(item.path);
        allDirs.push(...ddirs);
        allFiles.push(...files);
      } else {
        console.log(item.name);
        allFiles.push(item);
      }
      console.log(item.name);
    }

    const UniqueDirs = Array.from(new Set(allDirs));
    return [allFiles, UniqueDirs];
  };

  const getAllPuterFiles = async () => {
    const [files, dirs] = await recursiveReadDir(repo);

    console.log(dirs);
    const repoDirs = repo.split("/");
    fs.mkdir("/" + repoDirs[0], (error, success) => {
      console.log(error);
      console.log(success);
      fs.mkdir("/" + repoDirs[0] + "/" + repoDirs[1], (error, success) => {
        console.log(error);
        console.log(success);
      });
    });

    for (const dir of dirs) {
      try {
        const ddir = dir.replace(dirName, "");
        console.log("Creating dir on fs", ddir);
        fs.mkdir(ddir, (error, success) => {
          console.log(error);
          console.log(success);
        });
      } catch (error) {
        console.log(error);
      }
    }
    console.log(files);
    const allPaths = [];
    for (const file of files) {
      //remove dirName from path
      const path = file.path.replace(dirName, "");
      allPaths.push(path);
    }
    console.log(allPaths);
    let task = 0;
    const taskLength = allPaths.length;
    for (const path of allPaths) {
      console.log("Task", task, "/", taskLength);
      console.log("Reading content of ", path);
      const data = await puter.fs.read("." + path);
      console.log("Writing to fs :", path);
      const text = await data.text();
      //console.log(text);
      const content = new TextEncoder().encode(text);
      fs.writeFile(path, content, (error) => {
        if (error) {
          console.error(error);
          //setLoading(false);
        } else {
          console.log("File saved");
          //readDir(dir);
          //setLoading(false);
        }
      });

      //console.log(content);
      task = task + 1;
      //   try {
      //     console.log("Writing to fs :", path);
      //     const res=await fs.promises.writeFile(path, content);
      //     console.log(res);
      //   } catch (error) {
      //     console.log(error);
      //   }
    }
  };

  const doFullClone = async () => {
    console.log("Clone started");
    setDiffCode({});
    setCommitMessage("");
    setMyCommitAuthor("");
    setCommitOid("");
    setChanges([]);
    setCommits([]);
    setLoading(true);
    if (!workerThread) {
      console.log("Worker thread not ready");
      return;
    }

    await workerThread.setDir("/" + repo);

    workerThread
      .clone({
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/" + repo,
        depth: 20,
      })
      .then(async () => {
        //setDirFs("/" + repo);
        await puter.kv.set("repo-" + repo, repo);
        setAllRepos((prev) => [...prev, repo]);

        setLoadingMessage("Getting commits");
        gitStatus();
        setLoading(false);

        // Gérer la résolution de la promesse ici
      })
      .catch((error) => {
        // Gérer l'erreur ici
      });

    //let branches = await workerThread.listBranches({ remote: "origin" });
    //$("log").textContent += "BRANCHES:\n" + branches.map((b) => `  ${b}`).join("\n") + "\n";

    //console.log(branches);
  };

  useEffect(() => {
    console.log(files);
  }, [files]);

  const checkout = async (oid) => {
    await workerThread.checkout({ ref: oid });
  };

  const checkoutAction = async (commit) => {
    setDiffCode({});
    setCommitMessage(commit.commit.message);
    setMyCommitAuthor(commit.commit.author.name);
    setCommitOid(commit.oid);
    //getMasterDif(index);
    checkout(commit.oid);
  };

  const compareAction = async (commit, index) => {
    setDiffCode({});
    setCommitMessage(commit.commit.message);
    setMyCommitAuthor(commit.commit.author.name);
    setCommitOid(commit.oid);
    getMasterDif(index);
  };

  const getMasterDif = (index) => {
    const getDiffs = async () => {
      try {
        setChanges([]);
        if (commits[index] && commits[index + 1]) {
          console.log(index);
          console.log(commits[index].oid, commits[index + 1].oid);
          await workerThread.getFileStateChanges(
            commits[index].oid,
            commits[index + 1].oid
          );
        } else {
          console.log(commits[0].oid);
          await workerThread.getFileStateChanges(undefined, commits[0].oid);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getDiffs();
  };
  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      {loading && (
        <span className="bg-gray-400/30 backdrop-blur-md filter-blur rounded p-2 m-2 w-full h-full absolute top-0 left-0 text-black flex justify-center items-center">
          {loadingMessage}
        </span>
      )}
      <div className="flex flex-col w-1/3 border-r border-gray-600">
        <div className="p-0">
          <div className="flex items-center justify-between">
            <select
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              className="text-lg my-2 py-2 w-full font-semibold text-light bg-dark"
            >
              {allRepos.map((repot, index) => (
                <option key={index}>{repot}</option>
              ))}
            </select>
          </div>

          {/* <h2 className="mt-2 mb-4 text-sm font-medium">{repo}</h2> */}
          <div className="flex space-x-2 justify-between p-4">
            <form
              className="flex w-full space-x-2 justify-between"
              onSubmit={(e) => {
                e.preventDefault();
                doFullClone();
              }}
            >
              <input
                type="text"
                placeholder="Enter repo name"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="mt-2 mb-4 text-sm font-medium text-black"
              />
              <button
                onClick={doFullClone}
                className="bg-blue-600 px-1 hover:bg-blue-700"
              >
                Clone on Browser
              </button>
              <button
                className="bg-blue-600 px-1 hover:bg-blue-700"
                onClick={gitStatus}
              >
                Status
              </button>
            </form>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 px-1"
              onClick={getAllPuterFiles}
            >
              Import From Puter
            </button>
            <button
              onClick={syncDirectory}
              className="bg-blue-500 hover:bg-blue-600 px-1"
            >
              Save to Puter
            </button>
            <p className="text-xs">{dirName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <GitBranchIcon className="w-5 h-5" />
          <h2>Select Commit to Compare...</h2>
        </div>
        <div className="py-4 flex-grow overflow-auto">
          <div className="flex flex-col py-4 space-y-2">
            <CommitList
              commits={commits}
              checkout={checkoutAction}
              compare={compareAction}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col w-2/3">
        <div className="flex items-center justify-between p-4 border-b border-gray-600 text-sm">
          <div className="flex items-center space-x-2">
            <GitCommitIcon className="w-5 h-5" />
            <select
              value={currentBranch}
              onChange={async (event) => {
                setCurrentBranch(event.target.value);
                await workerThread.checkout({ ref: event.target.value });
                gitStatus();
              }}
              className="text-lg my-2 py-2 w-full font-semibold text-light bg-dark"
            >
              {branches.map((branch, index) => (
                <option key={index}>{branch}</option>
              ))}
            </select>
            <button
              className="text-lg my-1 py-2  px-8 min-w-fit font-semibold text-light bg-dark flex flex-col justify-between"
              onClick={gitFetch}
            >
              <span className="text-xs text-bold">Fetch</span>{" "}
              <span className="text-xs">{fetchMessage}</span>
            </button>
            <button
              className="text-lg my-1 py-2  px-8 min-w-fit font-semibold text-light bg-dark"
              onClick={gitPull}
            >
              Pull
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">On {commitOid.substring(0, 10)}</span>
            <ChevronDownIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircleIcon className="w-5 h-5 text-red-500" />
            <span className="text-sm">Cannot push</span>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-auto">
          {myCommitAuthor && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <span>
                  <img
                    className="rounded-lg"
                    src={`https://eu.ui-avatars.com/api/?name=${myCommitAuthor}&size=32`}
                  />
                </span>
                <span>{myCommitAuthor}</span>

                <span className="flex flex-row min-w-fit justify-start space-x-2">
                  {commitMessage.split("\n")[0].substring(0, 50)}
                </span>
              </div>
              <h4 className="text-sm font-semibold">
                {changes.length} changed files
              </h4>

              {changes.map((change, index) => (
                <div key={index}>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between"></div>
                  </div>

                  <div className="mt-4 bg-black p-4 rounded text-gray-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {diffCode && diffCode.path == change.path ? (
                          <>
                            <ChevronDownIcon
                              onClick={() => {
                                setDiffCode({});
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span>Hide Diff Editor</span>
                          </>
                        ) : (
                          <>
                            <ChevronRightIcon
                              onClick={() => {
                                ViewDif(change);
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <span>Show Diff Editor</span>
                          </>
                        )}
                      </div>
                      <span className="text-sm font-mono">
                        {change.type + " : " + change.path}
                      </span>
                      <div className="flex items-center space-x-2">
                        <CopyIcon className="w-5 h-5" />
                        <ExternalLinkIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <pre className="mt-2 text-xs font-mono overflow-auto">
                      {diffCode && diffCode.path == change.path ? (
                        <div className=" w-full">
                          <DiffEditor
                            theme="vs-dark"
                            height="400px"
                            language={diffCode.language}
                            original={
                              change.type == "create" ? "" : diffCode.oldContent
                            }
                            modified={diffCode.content3}
                          />
                        </div>
                      ) : (
                        <>
                          <code>
                            {change.content.split("\n").map((line, index) => {
                              let classs;
                              if (line.startsWith("+")) {
                                classs = "bg-green-800 text-gray-200";
                              } else if (line.startsWith("-")) {
                                classs = "bg-red-800 text-gray-200";
                              } else {
                                classs = "bg-black text-gray-200";
                              }
                              return (
                                <span key={index} className={classs}>
                                  {line + "\n"}
                                </span>
                              );
                            })}
                          </code>
                        </>
                      )}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
          {modifiedFiles.length > 0 && (
            <div>
              {modifiedFiles.map((file, index) => (
                <div key={index}>{file}</div>
              ))}
              <button
                className="bg-blue-500 hover:bg-blue-600 px-1"
                onClick={gitAdd}
              >
                Add *
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 px-1"
                onClick={makeCommit}
              >
                Commit
              </button>
            </div>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-600 px-1"
            onClick={gitPush}
          >
            Push
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CodeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CopyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function ExternalLinkIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}

function GitBranchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function GitCommitIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <line x1="3" x2="9" y1="12" y2="12" />
      <line x1="15" x2="21" y1="12" y2="12" />
    </svg>
  );
}
