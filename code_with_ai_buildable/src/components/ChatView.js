
import React from "react";
import MarkDownView from "./MarkDownView";

const ChatView = ({
  inputSubmit,
  inputMessage,
  setInputVal,
  messageFinished,
  fullMessage,
  chatMessages,
  resetChatMessages,
}) => {

  //a function to sanatize the html tags so that it can be shown in html as text without being executed
  const sanatizeHtmlsTags = (html) => {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }


  return (
    <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
      <div className="w-full h-full">
        <div className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark">
          <div className="w-full h-5/6 dark:bg-dark bg-light dark:text-light text-dark overflow-y-scroll">
            {chatMessages.map((message, index) => {
              if (message.role !== "system") {
                return (
                  <div key={index} className={`w-full overflow-y-scroll p-4`}>
                    <MarkDownView
                      content={
                        message.role == "user"
                          ? "# " + message.content
                          : sanatizeHtmlsTags(message.content)
                      }
                      className={` p-4 m-4 w-5/6 mx-2 px-2  opacity-100 overflow-y-scroll rounded  dark:text-light text-dark  ${
                        message.role === "assistant"
                          ? "dark:bg-red-800 bg-red-400"
                          : "dark:bg-blue-800 bg-blue-800"
                      }`}
                    />
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