import React, { useState } from "react";
import axios from "axios";

const MarkdownGet = ({ setGithubReadme }) => {
  const [url, setUrl] = useState("");

  const getMarkdown = async () => {
    try {
      const response = await axios.get(url);
      setGithubReadme(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="my-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <button
        className="w-1/1 ml-2 p-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={getMarkdown}
      >
        Insert Markdown To Chat
      </button>
    </div>
  );
};

export default MarkdownGet;
