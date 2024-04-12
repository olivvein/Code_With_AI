//appTitle: Puter Functionalities Explorer

import { useState, useEffect } from "react";
import axios from "axios";
import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";

const HOST = "http://localhost:3000";
let puter = window.puter;

const LocalFileExplorer = () => {
  const [currentPath, setCurrentPath] = useState(
    "/Users/olivierveinand/Documents/DEV",
  );
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  useEffect(() => {
    console.log("Effect");
    // get HOST api/health
    axios
      .get(HOST + "/api/health", {
        headers: { Authorization: `Bearer ${puter.authToken}` },
      })
      .then((response) => {
        console.log("Health:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching health:", error);
      });
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(HOST + "/api/dir", {
        params: { path: currentPath },
        headers: { Authorization: `Bearer ${puter.authToken}` },
      });
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleBack = () => {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
  };

  const handleFileClick = async (file) => {
    if (file.isDirectory) {
      setCurrentPath(`${currentPath}/${file.name}`);
    } else {
      setSelectedFile(`${currentPath}/${file.name}`);
      try {
        const response = await axios.get(HOST + "/api/file", {
          params: { path: `${currentPath}/${file.name}` },
          headers: { Authorization: `Bearer ${puter.authToken}` },
        });
        setFileContent(response.data.content);
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }
  };

  const renderFileIcon = (file) => {
    if (file.isDirectory) {
      return <FolderIcon className="w-6 h-6 text-blue-500" />;
    } else {
      return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">File Explorer</h2>
        <ul>
          <li
            className="flex items-center py-2 cursor-pointer"
            onClick={() => handleBack()}
          >
            <span className="ml-2">..</span>
          </li>
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center py-2 cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              {renderFileIcon(file)}
              <span className="ml-2">{file.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 text-white">
        {selectedFile && (
          <div>
            <h3 className="text-lg font-bold mb-2">{selectedFile}</h3>
            <pre className="text-white">{fileContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalFileExplorer;
