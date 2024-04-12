import React from "react";

const LogSection = (name) => {
  return (
    <div className="w-full h-full bg-dark">
      <div className="dark:bg-dark bg-light w-full">Console</div>
      <pre
        className="opacity-50 bottom-12 w-full h-full dark:bg-dark bg-light dark:text-light text-dark"
        id="logs"
        style={{ overflow: "auto" }}
      ></pre>
    </div>
  );
};

export default LogSection;
