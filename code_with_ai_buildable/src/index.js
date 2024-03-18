
import React from "react";
import ReactDOM from "react-dom";
import { setup as twindSetup } from "twind/shim";
import DraggableApp from "./App";

twindSetup({
  darkMode: "media",
  theme: {
    extend: {
      backgroundColor: {
        dark: "#111827",
        light: "#d4d4d4",
      },
      textColor: {
        light: "#d4d4d4",
        dark: "#111827",
      },
      borderColor: {
        light: "#d4d4d4",
        dark: "#111827",
      },
      animation: {
        fade: "fadeOut 5s ease-in-out",
        appear: "fadeIn 0.2s ease-in-out",
      },
      // that is actual animation
      keyframes: (theme) => ({
        fadeOut: {
          "0%": { opacity: "100%" },
          "100%": { opacity: "0%" },
        },
        fadeIn: {
          "0%": { opacity: "0%" },
          "100%": { opacity: "100%" },
        },
      }),
    },
  },
  preflight: {
    ".cursors-layer > .monaco-mouse-cursor-text": {
      position: "absolute !important",
      //color: 'black !important',
      //'background-color':'white',
    },
    ".cursors-layer >  .monaco-mouse-cursor-text::before": {
      content: '""',
      position: "absolute",
      left: "0",
      top: "0",
      bottom: "0",
      width: "1px",
      backgroundColor: "white",
    },
  },
});

ReactDOM.render(<DraggableApp />, document.getElementById("app"));