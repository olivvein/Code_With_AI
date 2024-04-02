import React from "react";
import "../App.css";

const DraggableUI = ({
  insertDiv,
  insertHere,
  className,
  id,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  getDivContent,
  draggingId,
  divs,
  order,
}) => {
  return (
    <div
      key={id}
      draggable
      onClick={(e) => {
        e.preventDefault();
        if (insertDiv) {
          insertHere(order);
        }
      }}
      onDrop={(e) => onDrop(e, id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={(e) => onDragStart(e, id)}
      style={{ cursor: "grab" }}
      className={`w-full h-full dark:bg-dark bg-light dark:text-light text-dark border  flex flex-col rounded shadow-lg  ${
        draggingId === id ? "opacity-30 " : "opacity-100"
      } ${className}  ${
        (draggingId !== id && draggingId) || insertDiv
          ? "tilted "
          : "dark:border-light border-dark"
      }`}
    >
      {(draggingId !== id && draggingId) || insertDiv ? (
        <div
          draggable
          onClick={(e) => {
            e.preventDefault();
            if (insertDiv) {
              insertHere(order);
            }
          }}
          onDrop={(e) => onDrop(e, id)}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragStart={(e) => onDragStart(e, id)}
          style={{ cursor: "grab" }}
          className="absolute top-0 left-0 w-full h-full backdrop-blur dark:bg-dark/30 bg-light/30 z-50 flex flex-col justify-center"
        >
          <span className="text-2xl flex justify-center">
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </div>
      ) : null}
      <span
        className={`flex justify-center border dark:border-light border-dark ${
          (draggingId !== id && draggingId) || insertDiv
            ? ""
            : "dark:bg-dark bg-light"
        }`}
        
      >
        <button
          // draggable
          // onDragStart={(e) => onDragStart(e, id)}
          // onDragEnd={onDragEnd}
          // onDragOver={onDragOver}
          // onDrop={(e) => onDrop(e, id)}
          // onClick={(e) => {
          //   e.preventDefault();
          //   if (insertDiv) {
          //     insertHere(order);
          //   }
          // }}
          className={`absolute left-0 top-0  border dark:border-light border-dark rounded-lg w-8 shadow-lg hover:bg-gray-400  ${
            draggingId === id ? "opacity-90" : "opacity-100"
          } `}
          style={{ cursor: "grab" }}
        >
          👋
        </button>
        <span
          className=""
          // draggable
          // onClick={(e) => {
          //   e.preventDefault();
          //   if (insertDiv) {
          //     insertHere(order);
          //   }
          // }}
          // onDrop={(e) => onDrop(e, id)}
          // onDragEnd={onDragEnd}
          // onDragOver={onDragOver}
          // onDragStart={(e) => onDragStart(e, id)}
          // style={{ cursor: "grab" }}
        >
          <span
            className="w-full flex justify-center"
            // draggable
            // onClick={(e) => {
            //   e.preventDefault();
            //   if (insertDiv) {
            //     insertHere(order);
            //   }
            // }}
            // onDrop={(e) => onDrop(e, id)}
            // onDragEnd={onDragEnd}
            // onDragOver={onDragOver}
            // onDragStart={(e) => onDragStart(e, id)}
            // style={{ cursor: "grab" }}
          >
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </span>
      </span>
      {getDivContent(id)}
    </div>
  );
};

export default DraggableUI;
