import React, { useRef, useEffect } from "react";
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
  draggingOrder,
}) => {
  const divRef = useRef(null);

  useEffect(() => {
    const div = divRef.current;
    return;
    if (div) {
      div.addEventListener("touchstart", (e) => onDragStart(e, id, order), {
        passive: true,
      });
      div.addEventListener("touchmove", onDragOver, { passive: true });
      div.addEventListener("touchend", onDragEnd, { passive: true });
    }
    return () => {
      if (div) {
        div.removeEventListener("touchstart", (e) => onDragStart(e, id, order));
        div.removeEventListener("touchmove", onDragOver);
        div.removeEventListener("touchend", onDragEnd);
      }
    };
  }, [id, order]);

  const MobileView = window.innerWidth < 800 ? true : false;

  return (
    <div
      ref={divRef}
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
      onDragStart={(e) => {
        onDragStart(e, id, order);
      }}
      style={{ cursor: "grab" }}
      className={`w-full h-full dark:bg-dark bg-light dark:text-light text-dark   flex flex-col rounded shadow-lg  drop-shadow-[0_5px_5px_rgba(255,255,255,0.25)] ${
        draggingId === id ? "opacity-30 " : "opacity-100"
      } ${
        (draggingId !== id && draggingId) || insertDiv
          ? `${draggingOrder > order ? "tilted-right " : "tilted-left "}`
          : ` border dark:border-light border-dark ${
              className?.indexOf("tilted") == -1 ? "notTilted" : ""
            } `
      } ${className} `}
    >
      {(draggingId !== id && draggingId) || insertDiv ? (
        <div
          draggable
          onClick={(e) => {
            e.preventDefault();
            if (insertDiv) {
              insertHere(order);
            }
            if (MobileView) {
              try {
                //onDrop(e, id);
                //onDragOver(e);

                onDragEnd(e);
                console.log(e);

                //add dataTransfert to event
                e.dataTransfer = new DataTransfer();
                //e.dataTransfer.setData("id", id);
                e.dataTransfer.setData("id", draggingId);

                onDrop(e, id);
                //alert("Clicked : "+id+" : "+order);
              } catch (error) {
                console.log(error);
              }
            }
          }}
          onDrop={(e) => onDrop(e, id)}
          onDragEnd={(e) => {
            onDragEnd(e);
          }}
          onDragOver={(e) => {
            onDragOver(e);
          }}
          //onTouchStart={(e) => onDragStart(e, id,order)}
          //onTouchEnd={(e)=>{onDrop(e, id)}}
          onDragStart={(e) => {
            onDragStart(e, id, order);
          }}
          style={{ cursor: "grab" }}
          className="absolute top-0 left-0 w-full h-full backdrop-blur dark:bg-dark/30 bg-light/30 z-50 flex flex-col justify-center"
        >
          <span className="text-2xl flex justify-center">
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </div>
      ) : (
        <></>
      )}
      <span
        className={`flex justify-center  ${
          (draggingId !== id && draggingId) || insertDiv
            ? ""
            : "dark:bg-dark bg-light"
        }`}
      >
        <span>
          <span className="w-full flex justify-center">
            {divs.find((div) => div.id === id).content.props.name}
          </span>
        </span>
      </span>
      <span className="w-full h-full border-t dark:border-t-light border-t-dark">
        {getDivContent(id)}
      </span>
    </div>
  );
};

export default DraggableUI;
