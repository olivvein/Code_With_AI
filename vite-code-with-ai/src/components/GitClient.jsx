//appTitle: Git Clone with Isomorphic Git

import React, { useState, useEffect } from "react";
import git from "https://esm.sh/isomorphic-git";
import http from "https://esm.sh/isomorphic-git/http/web";
import FS from 'https://esm.sh/@isomorphic-git/lightning-fs';

//import * as git from 'isomorphic-git';
//import http from "isomorphic-git/http/web";
//import FS from '@isomorphic-git/lightning-fs';




const GitClient = ({name}) => {
    const [cloneStatus, setCloneStatus] = useState('');
    const [files, setFiles] = useState([]);
    const fs = new FS("localRoot4");

    const handleClone = async () => {
        setCloneStatus('Cloning...');
        try {
            await git.clone({
                fs,
                http,
                dir: '/olivvein/wmo-emoji',
                url: 'https://github.com/olivvein/wmo-emoji',
                singleBranch: true,
                depth: 1,
                corsProxy: 'https://cors.isomorphic-git.org'
            });

            fs.readdir("/olivvein/wmo-emoji", (error, data) => {
                setFiles(data);

            });

            fs.readFile("/olivvein/wmo-emoji/README.md", 'utf8', (err, data) => {
                console.log(err);
                console.log(data);
            });

            setCloneStatus('Clone successful!');
        } catch (error) {
            setCloneStatus(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        console.log(files);
    }, [files])

    return (
        <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
            <button
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-700 transition-colors"
                onClick={handleClone}
            >
                Clone olivvein/wmo-emoji
            </button>
            <p className="mt-4">{cloneStatus}</p>
        </div>
    );
};

export default GitClient;


