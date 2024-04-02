import React, { useState, useEffect } from "react";
import MarkDownView from "./MarkDownView";

let puter=window.puter;

const CustomPrompt = ({ setShowCustomPrompt, updatePrompts }) => {
  const [userPrompts, setUserPrompts] = useState([]); // userPrompts is an array of objects of type {name: string, content: string, active: boolean}
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const getPrompts = async () => {
    try {
      const userPrompts = await puter.kv.get("user_prompts");
      if (userPrompts) {
        const parsedPrompts = JSON.parse(userPrompts);
        setUserPrompts(parsedPrompts);
        updatePrompts();
      }
    } catch (error) {
      console.error("Failed to fetch user prompts:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching user prompts...");

    getPrompts();
  }, []);

  const setNameVal = (e) => {
    setName(e.target.value);
  };

  const setContentVal = (e) => {
    setContent(e.target.value);
  };

  const addPrompt = async () => {
    try {
      const newPrompt = { name, content };
      const updatedPrompts = [...userPrompts, newPrompt];
      await puter.kv.set("user_prompts", JSON.stringify(updatedPrompts));
      setUserPrompts(updatedPrompts);
      setName("");
      setContent("");
      getPrompts();
    } catch (error) {
      console.error("Failed to add prompt:", error);
    }
  };

  const deletePrompt = async (index, e) => {
    e.preventDefault();
    console.log("Deleting prompt at index:", index);
    try {
      const updatedPrompts = userPrompts.filter((_, i) => i !== index);
      await puter.kv.set("user_prompts", JSON.stringify(updatedPrompts));
      setUserPrompts(updatedPrompts);
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  const changeActivateAndSave = (e, prompt, index) => {
    e.preventDefault();
    //only update the prompt index
    //save every prompt in the userPrompts array
    const theUpdater = async () => {
      try {
        //modify the prompt at index andk keep the rest the same
        const updatedPrompt = { ...prompt, active: !prompt.active };
        const updatedPrompts = [...userPrompts];
        updatedPrompts[index] = updatedPrompt;
        await puter.kv.set("user_prompts", JSON.stringify(updatedPrompts));
        setUserPrompts(updatedPrompts);
        getPrompts();
      } catch (error) {
        console.error("Failed to update prompt:", error);
      }
    };
    theUpdater();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-xl dark:bg-dark/30 bg-light/30 dark:text-light text-dark flex flex-col items-center justify-center z-50">
      <div className="w-3/4 h-5/6 backdrop-blur-3xl dark:bg-dark/50 bg-light/50 border flex flex-col rounded-lg  overflow-scroll justify-between p-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Promplets
          </h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              value={name}
              onChange={setNameVal}
              className="w-full p-2 my-2 border border-gray-300 rounded shadow-sm"
              placeholder="Prompt name"
            />
            <textarea
              value={content}
              onChange={setContentVal}
              className="w-full h-24 p-2 my-2 border border-gray-300 rounded shadow-sm"
              placeholder="Prompt content"
            />
            <button
              type="button"
              onClick={addPrompt}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Prompt
            </button>
          </form>
        </div>
        {userPrompts.map((prompt, index) => (
          <div
            key={index}
            className="flex justify-between items-center mb-2 border "
          >
            <div className="flex flex-col">
              <h3 className="text-md font-semibold text-gray-800 dark:text-white">
                {prompt.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-200">
                <MarkDownView content={prompt.content}></MarkDownView>
              </p>
            </div>
            <div>
              {/* Placeholder buttons */}

              <button
                className={`${
                  prompt.active
                    ? "bg-blue-500 hover:bg-blue-700"
                    : "bg-red-500 hover:bg-red-700"
                } text-white font-bold py-2 px-4 rounded`}
                onClick={(e) => {
                  changeActivateAndSave(e, prompt, index);
                }}
              >
                {prompt.active ? "Active" : "Non Active"}
              </button>
              <button
                onClick={(e) => {
                  deletePrompt(index, e);
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          className="dark:bg-dark bg-light dark:text-light text-dark rounded p-2 m-2 border dark:border-light border-dark"
          onClick={(e) => {
            e.preventDefault();
            setShowCustomPrompt(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomPrompt;
