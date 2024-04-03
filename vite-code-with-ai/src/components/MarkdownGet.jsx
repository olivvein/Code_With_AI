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
        className="w-1/2 dark:bg-light bg-dark dark:text-dark text-light border dark:border-dark border-light rounded p-2 "
      />
      <button
        className="w-1/2 dark:bg-dark bg-light dark:text-light text-dark rounded p-2 border dark:border-light border-dark"
        onClick={getMarkdown}
      >
        Insert Markdown To Chat
      </button>
    </div>
  );
};

export default MarkdownGet;
