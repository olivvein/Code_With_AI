import React, { useState, useEffect } from "react";
import GithubGet from "./GithubGet";
import MarkdownGet from "./MarkdownGet";

const ChatView = ({
  inputSubmit,
  inputMessage,
  setInputVal,
  messageFinished,
  fullMessage,
  chatMessages,
  resetChatMessages,
  setChatMessages,
  jsCode,
  htmlCode,
}) => {
  //a function to sanatize the html tags so that it can be shown in html as text without being executed
  const sanatizeHtmlsTags = (html) => {
    const sanatised=html
      .replace(/<script/g, "&lt;script")
      .replace(/script>/g, "script&gt;");

    const lines=sanatised.split("\n");

    //count the number of ```
    let count=0;
    for(let i=0;i<lines.length;i++){
      if(lines[i].includes("```")){
        count++;
        
      }
    }
    //if the count is odd then add a ``` at the end
    if(count%2==1){
      lines.push("```");
    }

    //get what is inside ```, can be multiple as an array of array of lines
    let codeBlocks=[];
    let currentBlock=[];
    let insideBlock=false;
    let codeLang=[];
    for(let i=0;i<lines.length;i++){
      if(lines[i].includes("```")){
        if(lines[i].includes("```html")){
          codeLang.push("html");
        }

        if(lines[i].includes("```jsx")){
          codeLang.push("jsx");
        }else{
          if(lines[i].includes("```js")){
            codeLang.push("js");
          }
        }


        if(insideBlock){
          codeBlocks.push(currentBlock);
          currentBlock=[];
        }
        insideBlock=!insideBlock;
      }else{
        if(insideBlock){
          currentBlock.push(lines[i]);
        }
      }
    }

    //if the codeBlocks is empty then return the lines
    if(codeBlocks.length==0){
      return lines;
    }

    //return codeBlocks inside pre tags
    const codeblocks=codeBlocks.map((block,index)=>{

      return (
        <div className="bg-black rounded-t border border-gray-400 mb-2 shadow-xl"  key={index}>
          <div className="border-b border-gray-400 p-2 mx-1 overflow-x-scroll" >{codeLang[index]}</div>
          <pre className="p-2 mx-1  my-2 mt-0 overflow-x-scroll max-h-1/2 overscroll-y-scroll" key={index}>{block.join("\n")}</pre>
        </div>
      );
    });

    return codeblocks;
    

  };

  

  const [githubReadme, setGithubReadme] = useState("");

  const setGithubReadmeVal = (readme, repo) => {
    setGithubReadme(readme);

    //append new message to chat
    const toAppend = {
      role: "user",
      content: `Do you know this repo ${repo} README.md?
    ${readme}
    `,
    };
    const toAppend2 = {
      role: "assistant",
      content: `Yes I knw it well, what you want me to do based on ${repo}`,
    };
    setChatMessages([...chatMessages, toAppend, toAppend2]);
  };

  const setCodeToChat = () => {
    const messageContent = `This is my updated code: \n\`\`\`html\n${htmlCode}\n\`\`\`\n\`\`\`javascript\n${jsCode}\n\`\`\`\nKeep 100% of it.`;
    const toAppend = { role: "user", content: messageContent };
    const toAppend2 = {
      role: "assistant",
      content:
        "Ok, I will keep 100% of this code and write the full app with your next request. What you want me to add to that app?\nMy next response will be this code with additional functionalities.",
    };
    setChatMessages([...chatMessages, toAppend, toAppend2]);
  };

  const MobileView = window.innerWidth < 800 ? true : false;

  return (
    <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
      <div className="w-full h-full p-2">
        <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
          {!MobileView && (
            <div className="flex w-full flex-col justify-between">
              <GithubGet setGithubReadme={setGithubReadmeVal} />
              <MarkdownGet setGithubReadme={setGithubReadmeVal} />
              <div className="my-2">
                <button
                  className="w-1/2 dark:bg-dark bg-light dark:text-light text-dark rounded p-2 border dark:border-light border-dark"
                  onClick={setCodeToChat}
                >
                  Add Code to Chat
                </button>
              </div>
            </div>
          )}
          <div className="w-full h-4/6 dark:bg-dark bg-light dark:text-light text-dark overflow-y-scroll">
            {chatMessages.map((message, index) => {
              if (message.role !== "system") {
                return (
                  <div key={index} className={`w-full overflow-y-scroll p-4`}>
                    <div
                      className={` p-4 m-4 w-5/6 mx-2 px-2  opacity-100 overflow-y-scroll rounded  dark:text-light text-dark  ${
                        message.role === "assistant"
                          ? "dark:bg-green-800 bg-green-800"
                          : "dark:bg-blue-800 bg-blue-800"
                      }`}
                    >
                      {message.role == "user"
                        ? message.content 
                        : sanatizeHtmlsTags(message.content).map((line, index) => (
                            line
                          ))
                      }
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 dark:bg-dark bg-light absolute bottom-0 w-full flex">
        <textarea
          type="text"
          rows={Math.max(inputMessage.split("\n").length, 2)}
          placeholder={`Make a weather app for Ales, France
          Make a btc graph , What are the news?
          `}
          className="bg-light text-dark ml-2 mb-2 h-3/4 w-full m-auto border dark:border-light border-dark rounded p-2 w-5/6"
          onKeyPress={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              inputSubmit(event);
            }
          }}
          value={inputMessage}
          onChange={setInputVal}
        />
        <button
          onClick={resetChatMessages}
          className="bottom-0 dark:bg-dark bg-light border dark:border-light border-dark hover:bg-gray-900 dark:text-light text-dark rounded mx-2 w-1/4"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default ChatView;
