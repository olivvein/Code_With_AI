import React from "react";

const DeployForm = ({
  appName,
  setAppNameVal,
  subdomain,
  setSubdomainVal,
  deploy,
  cancel,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl dark:bg-dark/30 bg-light/30 dark:text-light text-dark flex flex-col items-center justify-center z-50">
      <div className="w-3/4 h-3/4 shadow-xl backdrop-blur-3xl dark:bg-dark/50 bg-light/50 border dark:border-light border-dark flex flex-col rounded-lg  overflow-y-hidden justify-center items-center p-4">
        <h1 className="text-2xl font-semibold dark:text-light text-dark">
          Deploy
        </h1>
        <p className="dark:text-light text-dark">
          Deploy your app to a subdomain and create an app.
        </p>
        <form
          className="w-full justify-between flex flex-col items-center"
          onSubmit={() => {
            deploy();
            cancel(false);
          }}
        >
          <input
            className="dark:bg-light bg-dark dark:text-dark text-light rounded p-2 border dark:border-light border-dark m-2 w-1/4"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/4 border dark:border-light border-dark">
            Deploy
          </button>
          <button
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/4 border dark:border-light border-dark"
            onClick={() => {
              cancel(false);
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeployForm;
