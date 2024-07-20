//appTitle: Git Clone with Isomorphic Git

import React, { useState, useEffect } from "react";
import git from "https://esm.sh/isomorphic-git";
import http from "https://esm.sh/isomorphic-git/http/web";
import FS from "https://esm.sh/@isomorphic-git/lightning-fs";
import MagicPortal from "magic-portal";

//import * as git from 'isomorphic-git';
//import http from "isomorphic-git/http/web";
//import FS from '@isomorphic-git/lightning-fs';

const GitClient = ({ name }) => {
  const [cloneStatus, setCloneStatus] = useState("");
  const [files, setFiles] = useState([]);
  const fs = new FS("localRoot4", { wipe: false });
  const [worker, setWorker] = useState(null);
  const [portal, setPortal] = useState(null);
  const [workerThread, setWorkerThread] = useState(null);
  useEffect(() => {
    // Create a new web worker
    const myWorker = new Worker(
      new URL("../utils/gitWorker.js", import.meta.url),
    );

    const pp = new MagicPortal(myWorker);

    //myWorker.addEventListener("message", ({ data }) => console.log(data));

    const mainThread = {
      async print(message) {
        console.log(message);
      },
      async progress(evt) {
        //console.log(evt);
        return;
      },
      async fill(url) {
        let username = window.prompt("Username:");
        let password = window.prompt("Password:");
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
  }, []);

  useEffect(() => {
    if (!portal) return;
    const getWorkerThread = async () => {
      const wt = await portal.get("workerThread");
      setWorkerThread(wt);
    };
    getWorkerThread();
  }, [portal]);

  const handleClone = async () => {
    setCloneStatus("Cloning...");
    try {
      await git.clone({
        fs,
        http,
        onProgress: (event) => {
          console.log(event);
        },
        dir: "/olivvein/wmo-emoji",
        url: "https://github.com/olivvein/wmo-emoji",
        singleBranch: true,
        depth: 1,
        corsProxy: "https://cors.isomorphic-git.org",
      });

      fs.readdir("/olivvein/wmo-emoji", (error, data) => {
        setFiles(data);
      });

      fs.readFile("/olivvein/wmo-emoji/README.md", "utf8", (err, data) => {
        console.log(err);
        console.log(data);
      });

      setCloneStatus("Clone successful!");
    } catch (error) {
      setCloneStatus(`Error: ${error.message}`);
    }
  };

  const doFullClone = async () => {
    console.log("Clone started");


    await workerThread.setDir("/");

    await workerThread.clone({
      corsProxy: "https://cors.isomorphic-git.org",
      url: "https://github.com/olivvein/wmo-emoji",
    });

    let branches = await workerThread.listBranches({ remote: "origin" });
    //$("log").textContent += "BRANCHES:\n" + branches.map((b) => `  ${b}`).join("\n") + "\n";

    console.log(branches);

    let files = await workerThread.listFiles({});
    //$("log").textContent += "FILES:\n" + files.map((b) => `  ${b}`).join("\n") + "\n";

    console.log(files);

    let commits = await workerThread.log({});
    //$("log").textContent += "LOG:\n" + commits  .map((c) => `  ${c.oid.slice(0, 7)}: ${c.commit.message}`) .join("\n") + "\n";
    console.log(commits);
  };

  useEffect(() => {
    console.log(files);
  }, [files]);

  return (
    <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
      <button
        className="px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition-colors"
        onClick={handleClone}
      >
        Clone olivvein/wmo-emoji
      </button>

      <button
        className="px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition-colors"
        onClick={doFullClone}
      >
        Clone olivvein/wmo-emoji Worker
      </button>
      <p className="mt-4">{cloneStatus}</p>
    </div>
  );
};

export default GitClient;
