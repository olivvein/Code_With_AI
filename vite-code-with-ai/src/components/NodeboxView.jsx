import React, { useEffect, useRef } from "react";
import { Nodebox } from "@codesandbox/nodebox";

const NodeboxView = () => {
  const iframeRef = useRef(null);
  const previewIframeRef = useRef(null);

  useEffect(() => {
    const emulator = new Nodebox({
      iframe: iframeRef.current,
    });

    const runEmulator = async () => {
      await emulator.connect();

      await emulator.fs.init({
        "package.json": JSON.stringify({
          name: "my-app",
        }),
        "main.js": `import http from 'http';
    
    const server = http.createServer((req, res) => {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Hello from Nodebox')
    });
    
    server.listen(3000,"0.0.0.0", () => {
        console.log('Server is ready!');
    })`,
      });

      const shell = emulator.shell.create();
      const serverCommand = await shell.runCommand("node", ["main.js"]);

      const { url } = await emulator.preview.getByShellId(serverCommand.id);
      previewIframeRef.current.setAttribute("src", url);
    };

    runEmulator();
  }, []);

  return (
    <>
      <iframe id="nodebox-runtime-iframe" ref={iframeRef} />
      <iframe id="nodebox-preview-iframe" ref={previewIframeRef} />
    </>
  );
};

export default NodeboxView;
