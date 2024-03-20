
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
    <div className="fixed top-0 left-0 w-full h-full dark:bg-dark bg-light bg-opacity-50 flex items-center justify-center z-50">
      <div className="dark:bg-dark bg-light rounded-lg p-4 w-3/4 h-3/4 border dark:border-light border-dark  ">
        <h1 className="text-2xl font-semibold dark:text-light text-dark">
          Deploy
        </h1>
        <p className="dark:text-light text-dark">
          Deploy your app to a subdomain and create an app.
        </p>
        <form
          onSubmit={() => {
            deploy();
            cancel(false);
          }}
        >
          <input
            className="dark:bg-light bg-dark dark:text-dark text-light rounded p-2 border dark:border-light border-dark m-2 w-1/2"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/4 border dark:border-light border-dark">
            Deploy
          </button>
        </form>
        <button
          className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2  w-1/4 border dark:border-light border-dark"
          onClick={() => {
            cancel(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeployForm;