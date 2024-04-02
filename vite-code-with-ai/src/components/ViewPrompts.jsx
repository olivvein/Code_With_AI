import React, { useState, useEffect } from "react";

const ViewPrompts = ({ prompts, selectedPrompt,setShowViewPrompts ,userStringPrompt}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl dark:bg-dark/30 bg-light/30 dark:text-light text-dark flex flex-col items-center justify-center z-50">
      <pre className="w-3/4 h-5/6 backdrop-blur-3xl dark:bg-dark/50 bg-light/50 border flex flex-col rounded-lg  overflow-scroll justify-between">
        {prompts[selectedPrompt].content+"\n//Your prompt : \n"+userStringPrompt}
      </pre>
      <button
        className="w-1/4 dark:bg-dark bg-light border rounded-lg px-2"
        onClick={() => {
            setShowViewPrompts(false);
        }}
      >
        Close
      </button>
    </div>
  );
};

export default ViewPrompts;
