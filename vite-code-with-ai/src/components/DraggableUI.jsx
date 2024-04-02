
import React from "react";

const DraggableUI = ({
  id,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  getDivContent,
  draggingId,
  divs,
}) => {
  return (
    <div
      key={id}
      className={`w-full h-full dark:bg-dark bg-light dark:text-light text-dark border dark:border-light border-dark flex flex-col rounded shadow-lg  ${
        draggingId === id ? "opacity-30" : "opacity-100"
      }`}
    >
      <span className="flex justify-center border dark:border-light border-dark">
        <button
          draggable
          onDragStart={(e) => onDragStart(e, id)}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, id)}
          className={`absolute left-0 top-0  border dark:border-light border-dark rounded-lg w-8 shadow-lg hover:bg-gray-400  ${
            draggingId === id ? "opacity-10" : "opacity-100"
          } ${
            draggingId !== id && draggingId
              ? "bg-red-700"
              : "dark:bg-dark bg-light"
          }`}
          style={{ cursor: "grab" }}
        >
          👋
        </button>
        <span className="">
          <span className="w-full flex justify-center">
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </span>
      </span>
      {getDivContent(id)}
    </div>
  );
};

export default DraggableUI;