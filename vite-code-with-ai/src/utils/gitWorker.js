/* eslint-env worker */
/* globals LightningFS git MagicPortal GitHttp */
importScripts(
  "https://unpkg.com/@isomorphic-git/lightning-fs",
  "https://unpkg.com/isomorphic-git@beta",
  "https://unpkg.com/isomorphic-git@beta/http/web/index.umd.js",
  "https://unpkg.com/magic-portal"
);

let fs = new LightningFS("fs", { wipe: true });
const portal = new MagicPortal(self);
//self.addEventListener("message", ({ data }) => console.log(data));

(async () => {
  let mainThread = await portal.get("mainThread");
  let dir = "/";
  portal.set("workerThread", {
    setDir: async (_dir) => {
      dir = _dir;
    },
    clone: async (args) => {
      fs = new LightningFS("fs", { wipe: true });
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
    listBranches: (args) => git.listBranches({ ...args, fs, dir }),
    listFiles: (args) => git.listFiles({ ...args, fs, dir }),
    log: (args) => git.log({ ...args, fs, dir }),
  });
})();
