/* eslint-env worker */

/* globals LightningFS git MagicPortal GitHttp */
importScripts(
  "https://unpkg.com/@isomorphic-git/lightning-fs",
  "https://unpkg.com/isomorphic-git@beta",
  "https://unpkg.com/isomorphic-git@beta/http/web/index.umd.js",
  "https://unpkg.com/magic-portal"
);

let fs = new LightningFS("localRoot4", { wipe: false });
const portal = new MagicPortal(self);
//self.addEventListener("message", ({ data }) => console.log(data));

(async () => {
  let mainThread = await portal.get("mainThread");
  let dir = "/";
  portal.set("workerThread", {
    setDir: async (_dir) => {
      dir = _dir;
    },
    checkout: async (args) => {
      git.checkout({
        ...args,
        fs,
        dir,
        onProgress(evt) {
          mainThread.progress(evt);
        },
      });
    },
    clone: async (args) => {
      fs = new LightningFS("localRoot4", { wipe: true });
      return git.clone({
        ...args,
        fs,
        http: GitHttp,
        dir,
        onProgress(evt) {
          mainThread.progress(evt);
        },
        onMessage(msg) {
          mainThread.print(msg);
        },
        onAuth(url) {
          console.log(url);
          return mainThread.fill(url);
        },
        onAuthFailure({ url, auth }) {
          return mainThread.rejected({ url, auth });
        },
      });
    },
    getFileStateChanges: async (commitHash1, commitHash2) => {
      return git.walk({
        fs,
        dir,
        trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
        map: async function (filepath, [A, B]) {
          // ignore directories
          if (filepath === ".") {
            return;
          }
          if ((await A.type()) === "tree" || (await B.type()) === "tree") {
            return;
          }

          // generate ids
          const Aoid = await A.oid();
          const Boid = await B.oid();

          // determine modification type
          let type = "equal";
          if (commitHash1==undefined){
            type="create";
          }
          let content=await B.content();
          if (Aoid !== Boid) {
            type = "modify";
            content = await B.content();
          }
          if (Aoid === undefined) {
            type = "add";
            content = await B.content();
          }
          if (Boid === undefined) {
            type = "remove";
          }
          
          if (Aoid === undefined && Boid === undefined) {
            console.log("Something weird happened:");
            console.log(A);
            console.log(B);
          }

          try {
            content = new TextDecoder().decode(content);
          }
          catch (e) {
            console.log(e);
          }
          if (filepath.indexOf('pnpm-lock.yaml') !== -1) {
            content="";
          }

          mainThread.sendChange({
            path: `/${filepath}`,
            type: type,
            content: content,
          });
        },
      });
    },
    listBranches: (args) => git.listBranches({ ...args, fs, dir }),
    listFiles: (args) => git.listFiles({ ...args, fs, dir }),
    log: (args) => git.log({ ...args, fs, dir }),
  });
})();
