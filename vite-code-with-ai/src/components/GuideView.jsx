
import React from "react";
import Markdown from "markdown-to-jsx";

const GuideView = ({ setShowGuideView }) => {
  const SnippetView = ({ children, ...props }) => {
    const isJsx =
      children.indexOf("import ") != -1 || children.indexOf("const ") != -1
        ? "jsx"
        : "html";
    return (
      <>
        <div
          {...props}
          className="flex flex-col  dark:bg-black bg-white  rounded-lg"
        >
          <span className="w-full top-0 px-4 rounded-t-lg flex justify-between">
            <span>{isJsx}</span>
            <span>copy</span>
          </span>
          <span className="w-full p-4 overflow-scroll">{children}</span>
        </div>
      </>
    );
  };

  const LiView = ({ children, ...props }) => (
    <>
      {" "}
      - {children}
      <br></br>
    </>
  );

  const TheH4 = ({ children, ...props }) => (
    <div className="mt-4">{children}</div>
  );

  const guideMessage = `# User Guide

  [<img src="/github-mark.svg">](https://github.com/olivvein/Code_With_AI)



## Code Editor
- Based on Monaco editor (Vs Code) 
- Same shortcut
- Multiple cursor
- Syntax Highliting
  
You don't need to install any dependencies
Simply add it like normaly. In the Babel transpile, all import are appended with "https://esm.sh" which host a ton of ES6 modules
### 3 Files : 
- html : the html template where react components are injected
- javascript : the react/javascript code
- Babel : The Executed Code transpiled from React (jsx) to js. Don't modify it as it has no effect. It is just a representation of the transpiled jsx code.
## App Preview
- Each time the code is modified, the app preview is updated
## SaveAs
- Enter a Name and the project will be saved on App folder
- A message pop up wen it is successfull (2-10 sec)
## Deploy
- Enter a Name and the project deployed as an App 
- A message pop up wen it is successfull (2-10 sec)
## Chat Settings
Select your language model : 
- puter : gpt-3.5-turbo, no streaming, free
- openAi : every model available, streaming, require api key. The api key is stored in puter kv field openai_api_key. Only the app has access.
- liteLLM : every model avaliable on litellm[proxy], streaming.
## Chat View
- Enter to submit message
- Shift+Enter to create a new line
- You can ask the AI what you want to build.
- If you have specific libraries in mind just tell it.
- When you press play, Crazy Typing Cat Appears to let you now that the AI is working
- At the end of the generation , Crazy Typing Cat dissapear, The App Preview is updated with the new code and the message history is shown.
- The AI remember past message in the same session so you can ask "Make a cool clock app" Then when it's done "Perfect, add a color background animation to it"
When the code is not working and it will happen, it might be several issue : 
- Code is not completed
- twindSetup() is not instanciated, just add it after import of tailwind
- On the console, check the errors, AI often hallucinate a package that does everything perfectly like 
\`\`\`
import {TripleAGame} from "https://esm.sh/triple-a-game"
\`\`\`
## Prompt ingenering
The AI is told to be an excellent React Developper
It has been provided with several free api url like :
\`\`\`
https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true=> "current_weather"
https://api.coingecko.com/api 
https://api.multiversx.com/economics?extract=price for EGLD=> "price"
https://www.francetvinfo.fr/titres.rss => entries "title" and "summary" and "links[0] as href " and "links[1] as image " For the News with feedparser library
\`\`\`
#### You can provide it more in the message in the same way.
If you want to make an interactive game, ask it to use p5.js
Try using Three.js for 3d graphics (puter ai is not that good for it)
## Console
a simple javascript console view that show console.log and console.error (in red)
- require to use JSON.stringify to show objects as it display a string on the console
 ## LiteLLM
 LiteLLM can let you access a lot of llm
 
 - Free : ollama => llama, dolphin-mixtral, mistral, ....
 - Paid : Anthropic Claude, Google AI, Hugginface, Mistral
 install litellm and litellm[proxy]
\`\`\`sh
pip install litell litellm[proxy]
\`\`\`
#### create a config.yaml file like:
\`\`\`yaml
model_list: 
  - model_name: ollama/dolphin-mistral
    litellm_params:
      model: ollama/dolphin-mistral
  - model_name: ollama/phi
    litellm_params:
      model: ollama/phi
  - model_name: claude-3-opus-20240229
    litellm_params:
      model: claude-3-opus-20240229
      api_key: sk-****************
\`\`\`
#### run litellm[proxy]
\`\`\`sh
litellm --config config.yaml
\`\`\`
#### It should be running on port 4000
  `;

  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl dark:bg-dark/30 bg-light/30 dark:text-light text-dark flex flex-col items-center justify-center z-50">
      <div className="w-3/4 h-3/4 backdrop-blur-3xl dark:bg-dark/50 bg-light/50 border flex flex-col rounded-lg  overflow-y-hidden justify-between">
        <span className="w-full top-0  bg-gray-600 rounded-t-lg flex justify-between">
          <button
            onClick={() => {
              setShowGuideView(false);
            }}
            className="w-1/4 dark:bg-dark bg-light border rounded-lg px-2"
          >
            About Me
          </button>
          <h1>User Guide</h1>
          <button
            onClick={() => {
              setShowGuideView(false);
            }}
            className="w-1/4 dark:bg-dark bg-light border rounded-lg px-2"
          >
            close
          </button>
        </span>
        <div className="w-full h-full overflow-y-scroll p-4">
          <Markdown
            options={{
              overrides: {
                h1: {
                  props: {
                    className: "text-lg font-bold py-2",
                  },
                },
                h2: {
                  props: {
                    className: "text-lg  py-2 underline",
                  },
                },
                h3: {
                  props: {
                    className: "text-md underline py-2",
                  },
                },
                h4: {
                  component: TheH4,
                  props: {
                    className: "py-2",
                  },
                },
                pre: {
                  props: {
                    className:
                      "dark:bg-black bg-white dark:text-light text-dark border rounded-lg  mt-3",
                  },
                },
                code: {
                  component: SnippetView,
                },
                li: {
                  component: LiView,
                },
              },
            }}
          >
            {guideMessage}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default GuideView;