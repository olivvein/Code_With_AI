const puterFunctionalitiesVanillaJs = `//appTitle: Enhanced Puter Functionalities Explorer

document.addEventListener("DOMContentLoaded", function() {
    const app = document.getElementById('app');
    app.style.height = "100vh";
    app.style.display = "flex";
    app.style.flexDirection = "column";
    app.style.justifyContent = "space-between";
    app.style.backgroundColor = "#282c34";
    app.style.color = "white";
    app.style.padding = "20px";
    
    app.innerHTML = \`
        <header style="text-align:center; font-size:24px; font-weight:bold;">Puter Functionalities Explorer</header>
        <div id="content" style="flex:1;"></div>
        <footer style="text-align:center;">© 2024 Enhanced Puter</footer>
    \`;

    const content = document.getElementById('content');
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.alignItems = "center";
    content.style.overflow = "auto";
    content.innerHTML = \`
        <div id="welcome" style="margin-top: 20px;"></div>
        <div id="chatContainer" style="width: 100%; max-width: 700px; margin-top: 20px;"></div>
        <div id="kvContainer" style="width: 100%; max-width: 700px; margin-top: 20px;"></div>
    \`;

    let username = '';
    let chatHistory = [];
    let keyValues = [];
    
    async function init() {
        if (!puter.auth.isSignedIn()) {
            await puter.auth.signIn();
        }
        const user = await puter.auth.getUser();
        username = user.username;
        document.getElementById('welcome').innerText = \`Welcome, \${username}\`;

        updateKeyValues();

        setupChatUI();
        setupKeyValueUI();
    }

    async function updateKeyValues() {
        keyValues = await puter.kv.list(true);
        keyValues.forEach((field)=>{
            if (field.key.indexOf("api_key")!==-1){
                field.value="sk-************";
            }
        });
        displayKeyValues();
    }

    function setupChatUI() {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = \`
            <div>Chat with audio response:</div>
            <div id="chatHistory" style="background: #333; padding: 10px; border-radius: 5px; overflow-y: auto; height: 200px;"></div>
            <input id="currentMessage" type="text" placeholder="Type a message..." style="width: calc(100% - 22px); margin-top: 10px; padding: 10px;">
            <button onclick="sendMessage()" style="margin-top: 10px; padding: 10px; background: #007bff; border: none; color: white; border-radius: 5px; cursor: pointer;">Send</button>
        \`;
    }

    function setupKeyValueUI() {
        const kvContainer = document.getElementById('kvContainer');
        kvContainer.innerHTML = \`
            <div>Key-Value Pairs:</div>
            <div id="keyValuePairs" style="background: #333; padding: 10px; border-radius: 5px; overflow-y: auto; height: 200px;"></div>
            <input id="newKey" type="text" placeholder="Key" style="width: calc(33% - 22px); margin-top: 10px; padding: 10px;">
            <input id="newValue" type="text" placeholder="Value" style="width: calc(33% - 22px); margin-top: 10px; padding: 10px; margin-left: 10px;">
            <button onclick="addOrUpdateKeyValue()" style="width: calc(33% - 22px); margin-top: 10px; padding: 10px; background: #28a745; border: none; color: white; border-radius: 5px; cursor: pointer;">Add/Update</button>
        \`;
        displayKeyValues();
    }

    function displayKeyValues() {
        const keyValuePairs = document.getElementById('keyValuePairs');
        keyValuePairs.innerHTML = keyValues.map((kv) => 
            \`<div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #555;">
                <div>\${kv.key}: \${kv.value}</div>
                <button onclick="deleteKeyValue('\${kv.key}')" style="padding: 5px 10px; background: #dc3545; border: none; color: white; border-radius: 5px; cursor: pointer;">Delete</button>
            </div>\`
        ).join('');
    }

    window.sendMessage = function() {
        const currentMessage = document.getElementById('currentMessage').value;
        const chatHistoryContainer = document.getElementById('chatHistory');
        chatHistory.push({ role: "user", content: currentMessage });
        chatHistoryContainer.innerHTML += \`<div style="background: #28a745; padding: 10px; border-radius: 5px; margin: 5px 0;">\${currentMessage}</div>\`;
        
        const messageList = [
            { role: "system", content: "A system message that guides the AI to respond appropriately" },
            { role: "user", content: currentMessage }
        ];
        puter.ai.chat(messageList).then((response) => {
            const chatResponse = response.toString();
            chatHistory.push({ role: "assistant", content: chatResponse });
            chatHistoryContainer.innerHTML += \`<div style="background: #007bff; padding: 10px; border-radius: 5px; margin: 5px 0;">\${chatResponse}</div>\`;
            document.getElementById('currentMessage').value = '';
            puter.ai.txt2speech(chatResponse).then(audio => audio.play());
        });
    };

    window.addOrUpdateKeyValue = async function() {
        const newKey = document.getElementById('newKey').value;
        const newValue = document.getElementById('newValue').value;
        await puter.kv.set(newKey, newValue);
        await updateKeyValues();
        document.getElementById('newKey').value = '';
        document.getElementById('newValue').value = '';
    };

    window.deleteKeyValue = async function(keyToDelete) {
        await puter.kv.del(keyToDelete);
        await updateKeyValues();
    };

    init();
});
`;

const puterFunctionalitiesReact = `//appTitle: Puter Functionalities Explorer

import React, { useState, useEffect } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';

twindSetup();

const App = () => {
    const [username, setUsername] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [keyValues, setKeyValues] = useState([]);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const signInAndFetchKeys = async () => {
            if (!puter.auth.isSignedIn()) {
                await puter.auth.signIn();
            }
            const user = await puter.auth.getUser();
            setUsername(user.username);

            const fetchedKeys = await puter.kv.list(true);
            fetchedKeys.forEach((field)=>{
              if (field.key === "openai_api_key"){
                field.value="sk-***********";
              }
            })
            setKeyValues(fetchedKeys);
        };
        signInAndFetchKeys();
    }, []);

    const sendMessage = () => {
        const messageList = [
            { role: "system", content: "A system message that guides the AI to respond appropriately" },
            { role: "user", content: currentMessage }
        ];
        setChatHistory(messageList);
        puter.ai.chat(messageList).then((response) => {
            const chatResponse = response.toString();
            setChatHistory(history => [...history, { role: "assistant", content: chatResponse }]);
            setCurrentMessage('');
            puter.ai.txt2speech(chatResponse).then(audio => audio.play());
        });
    };

    const addOrUpdateKeyValue = async () => {
        await puter.kv.set(newKey, newValue);
        const keyList = await puter.kv.list(true);
        keyList.forEach((field) => {
            if (field.key === "openai_api_key"){
                field.value = "sk-**********";
            }
        })
        setKeyValues(keyList);
        setNewKey('');
        setNewValue('');
    };

    const deleteKeyValue = async (keyToDelete) => {
        await puter.kv.del(keyToDelete);
        setKeyValues(await puter.kv.list(true));
    };

    const handleOpenFileDialog = async () => {
        try {
            const file = await puter.ui.showOpenFilePicker();
            const fileName = file.name;
            const fileContent = await (await file.read()).text();
            setFileName(fileName);
            setFileContent(fileContent);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    const handleSaveFileDialog = async () => {
        try {
            const file = await puter.ui.showSaveFilePicker(fileContent, 'example.txt');
            const fileName = file.name;
            setFileName(fileName);
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    return (
        <div className="h-full w-screen bg-gray-800 text-white p-4">
            <header className="text-center text-2xl font-bold">Puter Functionalities Explorer with Puter File Dialog Demo</header>
            <div className="mt-4 flex flex-col items-center h-full">
                <div>Welcome, {username}</div>

                {/* Chat Section */}
                <div className="mt-4 w-3/4 flex flex-col">
                    <div>Chat with audio response:</div>
                    <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                        {chatHistory.map((entry, index) => (
                            <div key={index} className={\`p-2 my-1 rounded \${entry.role === "assistant" ? "bg-blue-500" : "bg-green-500"}\`}>{entry.content}</div>
                        ))}
                    </div>
                    <input className="text-black p-1 rounded-b-lg" placeholder="Type a message..." value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} />
                    <button className="my-2 self-end px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={sendMessage}>Send</button>
                </div>

                {/* Puter File Dialog Section */}
                <div className="mt-4 w-3/4">
                    <div>Puter File Dialog Demo:</div>
                    <button className="my-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700" onClick={handleOpenFileDialog}>Open File</button>
                    <button className="my-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-700" onClick={handleSaveFileDialog}>Save File</button>
                    <div className="bg-gray-700 p-2 rounded-lg overflow-auto h-24 my-2">
                        {fileName && <div className="my-2">File Name: {fileName}</div>}
                        {fileContent && <div className="my-2">File Content: {fileContent}</div>}
                    </div>
                </div>

                {/* Key-Value Pairs Section */}
                <div className="mt-4 w-3/4">
                    <div>Key-Value Pairs:</div>
                    <div className="bg-gray-700 p-2 rounded-t-lg overflow-auto h-48">
                        {keyValues.map(({ key, value }) => (
                            <div key={key} className="flex justify-between items-center my-2">
                                <div>{JSON.stringify({[key]: value})}</div>
                                <button className="ml-2 px-2 py-1 bg-red-500 rounded hover:bg-red-700" onClick={() => deleteKeyValue(key)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <input className="text-black p-1 w-1/3 border rounded-bl-lg" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} />
                    <input className="text-black p-1 border w-1/3" placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} />
                    <button className="py-1.5 bg-green-500 w-1/3 rounded-br-lg hover:bg-green-700" onClick={addOrUpdateKeyValue}>Add/Update</button>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
`;

const iframeReact = `//appTitle: Full Page Wikipedia Viewer

import React from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';

twindSetup();

const WikipediaViewer = () => {
  return (
    <div className="w-full h-full bg-gray-900">
      <iframe
        src="https://www.wikipedia.org/"   // Change this url to you desired website
        className="w-full h-full"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
      ></iframe>
    </div>
  );
};

ReactDOM.render(<WikipediaViewer />, document.getElementById("app"));
`;

const iframeVanillaJsHtml = `<div style="position: fixed; top: 0; left: 0; height: 100%; width: 100%">
<iframe id="iframeToShow" style="height: 100%; width: 100%"></iframe>
</div>
`;

const iframeVanillaJs = `//appTitle: Full Page Wikipedia Viewer
document.addEventListener("DOMContentLoaded", function() {
    const iframe = document.getElementById('iframeToShow');
    iframe.src = "https://www.wikipedia.org/";  // Change this url to you desired website
});
`;

const FileExplorerJs = `//appTitle: Apps File Explorer

import React, { useState, useEffect } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';

twindSetup();

const FileExplorer = () => {
    const [currentPath, setCurrentPath] = useState('./');
    const [items, setItems] = useState([]);
    const [username, setUsername] = useState('');
    const [dirName, setDirName] = useState('');

    useEffect(() => {
        checkSignIn();
        listDirectory(currentPath);
    }, [currentPath]);

    const checkSignIn = () => {
        const isSignedIn = puter.auth.isSignedIn();
        if (!isSignedIn) {
            puter.auth.signIn();
        }
        puter.auth.getUser().then(user => {
            setUsername(user.username);
        });
    };

    const listDirectory = async (path) => {
        try {
            const items = await puter.fs.readdir(path);
            console.log(items)
            if (items.length > 0) {
                setDirName(items[0].dirname)
                setItems(items);
            }

        } catch (error) {
            console.error(\`Error reading directory: \${error}\`);
        }
    };

    const navigateDirectory = (item) => {
        if (item.is_dir) setCurrentPath(item.path);
    };

    const deleteItem = async (path) => {
        try {
            if (confirm('Are you sure you want to delete this item?')) {
                await puter.fs.delete(path);
                listDirectory(currentPath); // Refresh after deletion
            }
        } catch (error) {
            console.error(\`Error deleting item: \${error}\`);
        }
    };

    const goBack = () => {
        const newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setCurrentPath(newPath || './');
    };

    return (
        <div className="p-4">
            <header className="py-2">
                <h1 className="text-2xl font-semibold">File Explorer</h1>
                <p>Logged in as: {username}</p>
                <p>{dirName}</p>
                <button
                    onClick={goBack}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go Back
                </button>
            </header>
            <main className="mt-4">
                <ul>
                    {items.map(item => (
                        <li
                            key={item.path}
                            className="cursor-pointer hover:bg-gray-700 p-2 flex justify-between items-center"
                        >
                            <span onClick={() => navigateDirectory(item)}>
                                {item.name} {item.is_dir ? '(Folder)' : ''}
                            </span>
                            {item.is_dir && item.subdomains.length > 0 && (
                                <a
                                    href={item.subdomains[0].address}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-300 hover:text-blue-500 mr-2"
                                >
                                    Visit Subdomain
                                </a>
                            )}
                            <button
                                onClick={() => deleteItem(item.path)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
};

ReactDOM.render(<FileExplorer />, document.getElementById("app"));
`;

const FileExplorerHtml = `<div id="app" class="h-screen bg-gray-900 text-white"></div>
`;

const ThreeJs = `//appTitle: Three.js Puter Template

import React, { useEffect, useRef,useState } from "https://esm.sh/react";
import ReactDOM from "https://esm.sh/react-dom";
import * as THREE from "https://esm.sh/three";
import { OrbitControls } from 'https://esm.sh/three/examples/jsm/controls/OrbitControls';
import { setup as twindSetup } from 'https://cdn.skypack.dev/twind/shim';
import { FontLoader } from 'https://esm.sh/three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'https://esm.sh/three/examples/jsm/geometries/TextGeometry';

twindSetup();

const ThreeJsMouseInteractiveCubeAndTextApp = () => {
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const pointLightRef = useRef(new THREE.PointLight(0xffffff, 100, 500));
  const imageTextureForCube = 'https://corsproxy.io/?' + encodeURIComponent('https://puter.com/images/logo.png');

  const [username,setUsername]=useState("");

  useEffect(() => {
     const signInAndFetchKeys = async () => {
            if (!puter.auth.isSignedIn()) {
                await puter.auth.signIn();
            }
            const user = await puter.auth.getUser();
            setUsername(user.username);
            console.log("set username");

            
        };
        signInAndFetchKeys();
  },[]);

  useEffect(() => {
    if(username==""){
      return;
    }
    console.log(username);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("threejs-app-container").appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    camera.position.set(0, 0, 50);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    scene.add(pointLightRef.current);
    pointLightRef.current.position.set(0, 0, 50);

    const textureLoader = new THREE.TextureLoader();
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 1);
    cubeGeometry.scale(1, 1, -1); // Allows seeing inside the geometry for double-sided effect.
    const cubeMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load(imageTextureForCube),
      side: THREE.DoubleSide, // Ensures the material is visible from both sides.
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(0, -10, 0);
    scene.add(cubeMesh);

    const loadText = (user) => {
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        console.log("loader");
        const geometry = new TextGeometry(user, {
          font: font,
          size: 6,
          height: 2,
        });
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // Double-sided material.
        const mesh = new THREE.Mesh(geometry, material);
        geometry.center();

        mesh.position.set(0, 12, 0);
        scene.add(mesh);

        const animate = function() {
          requestAnimationFrame(animate);
          cubeMesh.rotation.y += 0.002;
          mesh.rotation.y += 0.002;
          orbitControls.update();
          renderer.render(scene, camera);
        };

        animate();
      });
    };

    loadText(username);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    document.addEventListener('mousemove', (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const { point, face } = intersects[0];
        if (face && face.normal) {
          pointLightRef.current.position.copy(point).add(face.normal.multiplyScalar(2));
        }
      }
    }, false);
    

  }, [username]);

  

  return <div></div>;
};

ReactDOM.render(<ThreeJsMouseInteractiveCubeAndTextApp />, document.getElementById("threejs-app-container"));
`;

const ThreeHtml = `<div id="threejs-app-container"></div>
<div id="background-image" class="bg-cover fixed inset-0 bg-no-repeat bg-center" style="background-image: url('https://puter.com/dist/images/wallpaper.webp'); z-index: -1;"></div>
`;

export const templates = [
    {
        name: "Full Page Wikipedia Viewer - React",
        js: iframeReact,
        html: "<div id='app' class='h-screen'></div>",
        description: "A simple app to view Wikipedia",
        framework: "react",
      },
      {
        name: "Full Page Wikipedia Viewer - Vanilla JS",
        js: iframeVanillaJs,
        html: iframeVanillaJsHtml,
        description: "A simple app to view Wikipedia",
        framework: "vanilla js",
      },
  {
    name: "Three.js React Template",
    js: ThreeJs,
    html: ThreeHtml,
    description: "A simple Three.js template",
    framework: "react",
  },
  {
    name: "Puter Functionalities Explorer - React",
    js: puterFunctionalitiesReact,
    html: "<div id='app'></div>",
    description: "A simple app to explore Puter's functionalities",
    framework: "react",
  },
  {
    name: "Puter Functionalities Explorer - Vanilla JS",
    js: puterFunctionalitiesVanillaJs,
    html: "<div id='app'></div>",
    description: "A simple app to explore Puter's functionalities",
    framework: "vanilla js",
  },
  {
    name: "Apps File Explorer - React",
    js: FileExplorerJs,
    html: FileExplorerHtml,
    description: "A File Manager to see App Directory",
    framework: "react",
  },
];
