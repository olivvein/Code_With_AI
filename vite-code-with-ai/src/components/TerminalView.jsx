// AppTitle: Enhanced Terminal App with @xterm/xterm and ls command simulation

import React, { useEffect, useState } from "react";
import { Terminal } from "xterm";

const TerminalView = () => {
  useEffect(() => {
    let command = "";
    const terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#000000",
      },
    });
    terminal.open(document.getElementById("terminal-container"));
    terminal.writeln(
      'Welcome to the React Terminal! Type "ls" to list sample files.'
    );

    terminal.onKey(({ key, domEvent }) => {
      const printable =
        !domEvent.altKey &&
        !domEvent.altGraphKey &&
        !domEvent.ctrlKey &&
        !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        terminal.write("\r\n");
        console.log(command);

        executeCommand(command);
        command = "";
      } else if (domEvent.keyCode === 8) {
        // Do not delete the prompt
        console.log("return");
        console.log(terminal._core.buffer > 2);
        if (terminal._core.buffer.x > 2 || true) {
          terminal.write("\b \b");
          command = command.substring(0, command.length - 1);
        }
      } else if (printable || true) {
        terminal.write(key);
        console.log(key);
        command = command + key;
      }
    });

    function executeCommand(command) {
      switch (command) {
        case "ls":
          terminal.writeln("file1.txt\tfile2.txt\tdirectory/");
          break;
        default:
          const res = eval(command);
          console.log(res);
          terminal.writeln(`${res}`);
      }
    }
  }, []);

  return null;
};

export default TerminalView;
