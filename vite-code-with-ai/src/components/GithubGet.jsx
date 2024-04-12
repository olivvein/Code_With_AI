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
        },
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
        },
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
    <div className="my-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Search for repositories"
      />
      <button
        className="w-1/1 ml-2 p-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
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
          className="w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-4"
        />
      ) : (
        <select
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="w-1/2 dark:bg-light bg-dark dark:text-dark text-light border dark:border-dark border-light rounded p-2 "
        >
          {repos.map((repo, index) => (
            <option key={index} value={repo.full_name}>
              {repo.full_name}
            </option>
          ))}
        </select>
      )}
      <button
        className="w-1/1 ml-2 p-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={getReadme}
      >
        Get Readme
      </button>
    </div>
  );
};

export default GithubGet;
