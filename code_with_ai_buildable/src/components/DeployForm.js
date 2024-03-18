
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
      <div className="dark:bg-dark bg-light rounded-lg p-4">
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
            className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
            placeholder="App Name"
            onChange={setAppNameVal}
            value={appName}
          />
          <button className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2">
            Deploy
          </button>
        </form>
        <button
          className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2"
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