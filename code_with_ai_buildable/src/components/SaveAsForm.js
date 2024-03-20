import React from "react";

const SaveAsForm = ({ appName, setAppNameVal, saveAs, cancelSaveAs }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light bg-opacity-50 flex items-center justify-center z-50">
      <div className="dark:bg-dark bg-light rounded-lg p-4 w-3/4 h-3/4 border dark:border-light border-dark  ">
        <h1 className="text-2xl font-semibold dark:text-light text-dark">
          Save as
        </h1>
        <p className="dark:text-light text-dark">
          Save your project in a puter folder
        </p>
        <form
          onSubmit={(e) => {
            saveAs(e);
          }}
        >
          <input
            className="dark:bg-light bg-dark dark:text-dark text-light rounded p-2 border dark:border-light border-dark m-2 w-1/2"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/4 border dark:border-light border-dark ">
            Save as
          </button>
          <button
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/2 border dark:border-light border-dark "
            onClick={() => {
              cancelSaveAs(false);
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaveAsForm;
