/* eslint-disable react/prop-types */
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/DpkWciPvvTA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

import { useState, useEffect, SVGProps } from "react";
import moment from "moment";

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
  const [commitChanges, setCommitChanges] = useState({
    addition: 0,
    deletion: 0,
  });
  const [commitOid, setCommitOid] = useState("");
  const [myCommitAuthor, setMyCommitAuthor] = useState("");
  const [diffCode, setDiffCode] = useState("");
  const [allRepos, setAllRepos] = useState([]);
  const [fetchMessage, setFetchMessage] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [modifiedFiles, setModifiedFiles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState("");
  const [fetchTime, setFetchTime] = useState(0);
  const [commitDescription, setCommitDescription] = useState("");

  const puter = window.puter;

  useEffect(() => {
    const updateUser = async () => {
      const isSignedIn = puter.auth.isSignedIn();
      if (!isSignedIn) {
        await puter.auth.signIn();
      }
      const user = await puter.auth.getUser();
      console.log(user);
      setUsername(user.username);
      setCommitAuthorName(user.username);
      setCommitAuthorEmail(user.email);
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

  // useEffect(() => {
  //   if (!workerThread) return;
  //   if (currentBranch == "") return;

  //   setTimeout(() => {

  //   gitFetch();
  //   }, 2000);

  // }, [currentBranch]);

  const gitAdd = async (path) => {
    await workerThread.setDir("/" + repo);
    let filesList = await workerThread.listFiles({});
    let hasAdded = false;
    for (const file of filesList) {
      const status = await workerThread.status({ filepath: file });
      if (status != "unmodified" || status != "*unmodified") {
        console.log("Adding " + file);
        await workerThread.add({ filepath: file });
        hasAdded = true;
      }
    }
    if (hasAdded) {
      gitStatus();
    }
  };

  const gitCommit = async (message) => {
    await workerThread.commit(message);
    gitStatus();
  };

  const [commitAuthorEmail, setCommitAuthorEmail] = useState("");
  const [commitAuthorName, setCommitAuthorName] = useState("");
  const [commitsBehinds, setCommitsBehinds] = useState(0);

  const makeCommit = async () => {
    const commitArgs = {
      author: {
        name: commitAuthorName,
        email: commitAuthorEmail,
      },
      message: commitMessage,
      description: commitDescription,
    };
    console.log(commitArgs);
    const oiid = await gitCommit(commitArgs);
    console.log("Commited");
    console.log(oiid);
    gitStatus();
  };

  const gitPush = async () => {
    alert("Push is disabled for now 😅");
    return;
    await workerThread.push({
      remote: "origin",
      ref: currentBranch,
      url: "https://github.com/" + repo,
    });
  };

  const gitPull = async () => {
    try {
      await workerThread.pull({
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/" + repo,
        depth: 20,
        author: { name: "user", email: "e.mai@le.com" },
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
      const theFetch = await workerThread.fetch({
        corsProxy: "https://cors.isomorphic-git.org",
        url: "https://github.com/" + repo,
        depth: 20,
        ref: currentBranch,
      });
      console.log(theFetch);
      if (theFetch.fetchHead != commits[0].oid) {
        console.log("Not up to date");
        console.log(theFetch.fetchHead);
        let histCommit = 0;
        let numCommits = 0;
        let commitBehind = -1;
        for (const commit of commits) {
          if (theFetch.fetchHead == commit.oid) {
            console.log("Found the commit");
            console.log(commit);
            commitBehind = numCommits;
            histCommit = commitBehind;

            break;
          }
          numCommits = numCommits + 1;
        }
        console.log("Commit behind", commitBehind);
        setCommitsBehinds(commitBehind);
      }
      //gitStatus();
    } catch (error) {
      console.log(error);
    }
  };

  const gitStatus = async () => {
    console.log("Status");
    console.log("Reading dir : ", repo);
    setDiffCode({});
    setMyCommitAuthor("");
    setCommitMessage("");
    setCommitOid("");
    setChanges([]);
    setCommitChanges({ addition: 0, deletion: 0 });

    //setFetchMessage("");
    await workerThread.setDir("/" + repo);
    let filesList = await workerThread.listFiles({});
    const modified = [];
    console.log(filesList);
    let readyToCommit = false;
    for (const file of filesList) {
      const status = await workerThread.status({ filepath: file });
      console.log(file, status);
      if (status != "unmodified") {
        modified.push({ file, status });
      }
      if (status == "modified") {
        readyToCommit = true;
      }
    }

    if (readyToCommit) {
      console.log("Ready to commit");
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

    //count number of addition and deletion in patch
    const lines = patch.split("\n");
    let addition = 0;
    let deletion = 0;
    for (const line of lines) {
      if (line.startsWith("+") && !line.startsWith("+++")) {
        addition = addition + 1;
        console.log("Addition", line, addition, deletion);
      }
      if (line.startsWith("-") && !line.startsWith("---")) {
        deletion = deletion + 1;
        console.log("deletion", line, addition, deletion);
      }
    }
    setCommitChanges((prev) => ({
      addition: prev.addition + addition,
      deletion: prev.deletion + deletion,
    }));

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
      //gitStatus();
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
    setProgressPct(0);
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
      setProgressPct((thePhase / uploadPhases) * 100);
      const theDirPath = theDir.dirname;
      const theFiles = theDir.files;
      const theFilesAsFile = [];
      for (const path of theFiles) {
        //console.log("Reading file", path);
        setLoadingMessage("Reading file", theDirPath + "/" + path);

        const data = await fs.promises.readFile("/" + theDirPath + "/" + path);
        let fileType = "text/plain";
        if (path.indexOf(".jpeg") != -1) {
          fileType = "image/jpeg";
        }
        if (path.indexOf(".png") != -1) {
          fileType = "image/png";
        }
        if (path.indexOf(".gif") != -1) {
          fileType = "image/gif";
        }
        if (path.indexOf(".svg") != -1) {
          fileType = "image/svg+xml";
        }
        if (path.indexOf(".html") != -1) {
          fileType = "text/html";
        }
        if (path.indexOf(".webp") != -1) {
          fileType = "image/webp";
        }
        const blob = new Blob([data]);
        const theNewFile = new File([blob], path);
        theFilesAsFile.push(theNewFile);
      }
      console.log("Uploading files to puter", theDir.dirname);
      console.log("Upload Phase:", thePhase, "/", uploadPhases);
      setLoadingMessage("Upload Phase:", thePhase, "/", uploadPhases);
      setProgressPct((thePhase / uploadPhases) * 100);
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

      thePhase = thePhase + 1;
    }

    //console.log(fileMap);
    setLoading(false);
    console.timeEnd("syncDirectory", "s");

    return;
  };

  const recursiveReadDir = async (dir, timeStart) => {
    let progress = Date.now() - timeStart;
    progress = progress / 1000;
    console.log("Progress", progress);
    setProgressPct(progress);
    //wait a bit

    console.log("Reading dir : ", dir);
    const listitems = await puter.fs.readdir(dir);

    //to seconds

    const allFiles = [];
    const allDirs = [];
    for (const item of listitems) {
      if (item.is_dir) {
        allDirs.push(item.path);
        const [files, ddirs] = await recursiveReadDir(item.path, timeStart);
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

  //import from puter
  const getAllPuterFiles = async () => {
    setProgressPct(0);
    setLoading(true);
    setProgressPct(0);
    setLoadingMessage("Reading files from puter");
    const [files, dirs] = await recursiveReadDir(repo, Date.now());

    console.log(dirs);
    const repoDirs = repo.split("/");
    fs.mkdir("/" + repoDirs[0], (error, success) => {
      console.log("mkdir : ");
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
      setProgressPct((task / taskLength) * 100);
      console.log("Task", task, "/", taskLength);
      console.log("Reading content of ", path);
      const data = await puter.fs.read("." + path);
      console.log("Writing to fs :", path);
      setLoadingMessage(
        "Writing to fs :" + path + " " + task + "/" + taskLength
      );
      const relativePath = path.replace("/" + repo + "/", "");
      console.log("Relative path", relativePath);
      try {
        //await workerThread.add({ filepath: relativePath });
      } catch (error) {
        console.log(error);
      }

      const text = await data.text();
      const buffer = await data.arrayBuffer();

      const content = new TextEncoder().encode(text);
      fs.writeFile(path, buffer, async (error) => {
        if (error) {
          console.error(error);
          //setLoading(false);
        } else {
          console.log("File saved : ", relativePath);

          try {
            const status = await workerThread.status({
              filepath: relativePath,
            });
            console.log("Status", status);
            if (status != "unmodified" || status != "*unmodified") {
              console.log("Adding " + relativePath);
              await workerThread.add({ filepath: relativePath });
              setLoadingMessage("git add :" + relativePath);
            }
          } catch (error) {
            console.log(error);
          }

          //readDir(dir);
          //setLoading(false);
        }
      });
      //

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
    setLoading(false);
    gitStatus();
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
    setProgressPct(0);
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
        setProgressPct(100);
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
    console.log("Checking out", oid);
    const ress = await workerThread.checkout({
      ref: oid,
      force: true,
      noUpdateHead: true,
    });
    console.log(ress);
  };

  const checkoutAction = async (commit) => {
    setDiffCode({});
    setCommitMessage("");
    setMyCommitAuthor("");
    setCommitOid("");
    //getMasterDif(index);
    console.log("Checking out");
    console.log(commit);
    await checkout(commit.commit.oid);
    gitStatus();
  };

  const compareAction = async (commit, index) => {
    setCommitChanges({ addition: 0, deletion: 0 });
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

  const checkoutBranch = async (branch) => {
    setCommitsBehinds(0);
    setCurrentBranch(branch);
    await workerThread.checkout({ ref: branch });
    setTimeout(() => {
      gitStatus();
    }, 1000);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white justify-center">
      {loading && (
        <span className="p-20 m-2 w-full h-full absolute top-0 left-0 text-black flex flex-col justify-center items-center">
          <div className="bg-gray-400/30 backdrop-blur-md filter-blur rounded  m-20 w-full h-full flex flex-col items-center px-4">
            <div className="flex flex-row justify-center items-center w-full h-1/2">
              <span>{loadingMessage}</span>
            </div>

            <div className="flex row w-full h-12 bg-gray-200 rounded-full ">
              <div
                className="h-full text-center justify-center items-center text-xs text-white bg-green-500 rounded-full flex"
                style={{ width: `${progressPct}%` }}
              ></div>
              <span className="flex justify-center text-center text-lg absolute w-full mt-2 min-w-inset">
                {progressPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </span>
      )}

      {/* Left */}

      <LeftPannel
        repo={repo}
        setRepo={setRepo}
        doFullClone={doFullClone}
        allRepos={allRepos}
        gitStatus={gitStatus}
        getAllPuterFiles={getAllPuterFiles}
        syncDirectory={syncDirectory}
        dirName={dirName}
        gitFetch={gitFetch}
        commits={commits}
        checkoutAction={checkoutAction}
        compareAction={compareAction}
      />

      {/* Right */}

      <Rightpannel
        myCommitAuthor={myCommitAuthor}
        commitMessage={commitMessage}
        changes={changes}
        diffCode={diffCode}
        ViewDif={ViewDif}
        gitAdd={gitAdd}
        makeCommit={makeCommit}
        gitPush={gitPush}
        modifiedFiles={modifiedFiles}
        branches={branches}
        currentBranch={currentBranch}
        setCurrentBranch={setCurrentBranch}
        gitFetch={gitFetch}
        gitPull={gitPull}
        fetchMessage={fetchMessage}
        commitChanges={commitChanges}
        checkoutBranch={checkoutBranch}
        commitAuthorName={commitAuthorName}
        commitAuthorEmail={commitAuthorEmail}
        setCommitAuthorEmail={setCommitAuthorEmail}
        setCommitAuthorName={setCommitAuthorName}
        setCommitMessage={setCommitMessage}
        commitsBehinds={commitsBehinds}
        fetchTime={fetchTime}
        commitDescription={commitDescription}
        setCommitDescription={setCommitDescription}
        setDiffCode={setDiffCode}
      />
    </div>
  );
}

const LeftPannel = ({
  repo,
  setRepo,
  doFullClone,
  allRepos,
  gitStatus,
  getAllPuterFiles,
  syncDirectory,
  dirName,
  gitFetch,
  commits,
  checkoutAction,
  compareAction,
}) => {
  if (!allRepos) return null;

  return (
    <div className="flex flex-col w-1/3 border-r border-gray-600">
      <LeftTop
        repo={repo}
        setRepo={setRepo}
        doFullClone={doFullClone}
        allRepos={allRepos}
        gitStatus={gitStatus}
        getAllPuterFiles={getAllPuterFiles}
        syncDirectory={syncDirectory}
        dirName={dirName}
      />
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
  );
};

const Rightpannel = ({
  myCommitAuthor,
  commitMessage,
  changes,
  diffCode,
  ViewDif,
  gitAdd,
  makeCommit,
  gitPush,
  modifiedFiles,
  branches,
  currentBranch,
  setCurrentBranch,
  gitFetch,
  gitPull,
  fetchMessage,
  workerThread,
  gitStatus,
  commitChanges,
  checkoutBranch,
  commitAuthorName,
  commitAuthorEmail,
  setCommitAuthorEmail,
  setCommitAuthorName,
  setCommitMessage,
  commitsBehinds,
  fetchTime,
  commitDescription,
  setCommitDescription,
  setDiffCode,
}) => {
  return (
    <div className="flex flex-col w-2/3">
      <RightTop
        branches={branches}
        currentBranch={currentBranch}
        setCurrentBranch={setCurrentBranch}
        gitFetch={gitFetch}
        gitPull={gitPull}
        fetchMessage={fetchMessage}
        workerThread={workerThread}
        gitStatus={gitStatus}
        checkoutBranch={checkoutBranch}
        fetchTime={fetchTime}
        commitsBehinds={commitsBehinds}
        
      />
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
              <span>
                {myCommitAuthor}{" "}
                <span className="text-green-500">{`+${commitChanges.addition}`}</span>{" "}
                <span className="text-red-500">{`-${commitChanges.deletion}`}</span>
              </span>

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
            <div
              className="
          flex flex-col justify-between items-center mt-8 m-20  rounded bg-blue-900 text-white border
          "
            >
              <span className="w-full bg-black p-1 pl-1 m-0">
                <h2 className="text-md pl-1">
                  {modifiedFiles.length} Modified Files
                </h2>
              </span>

              {modifiedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex border-b border-black w-full p-1 pl-2"
                >
                  {file.status.startsWith("*") ? (
                    <input type="checkbox"></input>
                  ) : (
                    <input type="checkbox" checked></input>
                  )}
                  <span className="ml-2">
                    {file.file} is {file.status}
                  </span>
                </div>
              ))}
              <button
                className="bg-blue-500 hover:bg-blue-600 px-1 w-full"
                onClick={gitAdd}
              >
                Add All
              </button>
            </div>

            <div
              className="
          flex flex-col justify-between items-center mt-8 m-20 p-2 rounded bg-blue-900 text-white border
          "
            >
              <form className="w-full">
                <textarea
                  placeholder="Commit Message (Required)"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="text-sm font-medium bg-gray-800 text-white  border border-gray-700 p-2 rounded w-full h-32"
                ></textarea>
                <textarea
                  placeholder="Description"
                  value={commitDescription}
                  onChange={(e) => {
                    setCommitDescription(e.target.value);
                  }}
                  className="text-sm font-medium bg-gray-800 text-white  border border-gray-700 p-2 rounded w-full h-32"
                ></textarea>
              </form>
              <button
                className="bg-blue-500 hover:bg-blue-600  rounded mt-2  p-2 w-full"
                onClick={makeCommit}
              >
                Commit to {currentBranch}
              </button>
            </div>
          </div>
        )}

        {commitsBehinds > 0 && (
          <div
            className="
          flex flex-col justify-between items-center mt-8 m-20 p-2 rounded bg-blue-900 text-white border
          "
          >
            <span className="text-sm">
              {`You have ${commitsBehinds} local commit${
                commitsBehinds > 1 ? "s" : ""
              } waiting to be pushed to github`}
            </span>
            <button
              className="bg-gray-500 hover:bg-gray-700 p-0 m-0 rounded w-1/2 mt-2 text-black"
              onClick={gitPush}
            >
              Push to {currentBranch}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RightTop = ({
  branches,
  currentBranch,
  setCurrentBranch,
  gitFetch,
  gitPull,
  fetchMessage,
  workerThread,
  gitStatus,
  checkoutBranch,
  fetchTime,
  commitsBehinds,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-600 text-sm">
      <div className="flex items-center space-x-2">
        <GitCommitIcon className="w-5 h-5" />
        <select
          value={currentBranch}
          onChange={async (event) => {
            checkoutBranch(event.target.value);
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
          <span className="text-xs text-bold">
            Fetch{" "}
            {fetchTime == 0
              ? " (Not Fetched)"
              : moment(fetchTime * 1000).fromNow()}
          </span>{" "}
          <span className="text-xs">{fetchMessage}</span>
        </button>
        {commitsBehinds > 0 ? (
          <button
            className="text-lg my-1 py-2  px-8 min-w-fit font-semibold text-light bg-dark"
            onClick={gitPull}
          >
            Push {commitsBehinds} commit{commitsBehinds > 1 ? "s" : ""}
          </button>
        ) : (
          <button
            className={`text-lg my-1 py-2  px-8 min-w-fit font-semibold text-light bg-dark ${
              commitsBehinds == -1 ? "bg-green-500" : ""
            }`}
            onClick={gitPull}
          >
            Pull
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <AlertCircleIcon className="w-5 h-5 text-red-500" />
        <span className="text-sm">Cannot push</span>
      </div>
    </div>
  );
};

const LeftTop = ({
  repo,
  setRepo,
  doFullClone,
  allRepos,
  gitStatus,
  getAllPuterFiles,
  syncDirectory,
  dirName,
}) => {
  if (!allRepos) return null;

  return (
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
        <form className="flex w-full space-x-2 justify-between">
          <input
            type="text"
            placeholder="Enter repo name"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="mt-2 mb-4 text-sm font-medium text-black"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              doFullClone();
            }}
            className="bg-blue-600 px-1 hover:bg-blue-700"
          >
            Clone on Browser
          </button>
        </form>
        <button
          className="bg-blue-600 px-1 hover:bg-blue-700"
          onClick={gitStatus}
        >
          Status
        </button>
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
        <button
          onClick={(e) => {
            e.preventDefault();
            if (navigator.clipboard) {
              navigator.clipboard.writeText(dirName);
            } else {
              console.log("Clipboard API not available");
              console.log("doing the other way");
              const textarea = document.createElement("textarea");
              textarea.textContent = dirName;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 px-1"
        >
          Copy App Dir
        </button>
      </div>
    </div>
  );
};

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
