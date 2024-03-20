import React, { useState } from "react";
import axios from "axios";

const GithubGet = ({ setGithubReadme }) => {
  const [repo, setRepo] = useState("");
  const [search, setSearch] = useState("");
  const [repos, setRepos] = useState([]);

  const getReadme = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${repo}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.VERSION.raw",
          },
        }
      );
      setGithubReadme(response.data, repo);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const searchRepo = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${search}`,
        {
          headers: {
            Accept: "application/vnd.github.VERSION.raw",
          },
        }
      );
      if (response.data.items.length > 0) {
        setRepo(response.data.items[0].full_name);
        setRepos(response.data.items);
      } else {
        console.log("No repositories found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="m-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/2 dark:bg-light bg-dark dark:text-dark text-light border dark:border-dark border-light rounded p-2 "
        placeholder="Search for repositories"
      />
      <button
        className="w-1/2 dark:bg-dark bg-light dark:text-light text-dark rounded p-2 border dark:border-light border-dark"
        onClick={searchRepo}
      >
        Search
      </button>
      {repos.length == 0 ? (
        <input
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="user/repo"
          className="w-1/2 dark:bg-light bg-dark dark:text-dark text-light border dark:border-dark border-light rounded p-2 "
        />
      ) : (
        <select
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="w-1/2 dark:bg-light bg-dark dark:text-dark text-light border dark:border-dark border-light rounded p-2 "
        >
          {repos.map((repo) => (
            <option value={repo.full_name}>{repo.full_name}</option>
          ))}
        </select>
      )}
      <button
        className="w-1/2 dark:bg-dark bg-light dark:text-light text-dark rounded p-2 border dark:border-light border-dark"
        onClick={getReadme}
      >
        Get Readme
      </button>
    </div>
  );
};

export default GithubGet;
