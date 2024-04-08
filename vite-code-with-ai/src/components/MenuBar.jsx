import React, { useState, useEffect } from "react";

import { FolderOpenIcon, DocumentTextIcon } from "@heroicons/react/outline";
//menu icons
import { MenuIcon, XIcon } from "@heroicons/react/outline";
//apps icons
import { TerminalIcon, FolderIcon } from "@heroicons/react/outline";


const MenuBar = ({ name }) => {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full justify-start items-center p-4 dark:bg-black bg-white dark:text-light text-dark ">
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <MenuIcon className="h-10 w-10" />
        </button>
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <XIcon className="h-10 w-10" />
        </button>
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <TerminalIcon className="h-10 w-10" />
        </button>
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <FolderIcon className="h-10 w-10" />
        </button>
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <FolderOpenIcon className="h-10 w-10" />
        </button>
        <button onClick={(e)=>{}} className="flex items-center hover:bg-gray-500 hover:text-black rounded active:text-white">
          <DocumentTextIcon className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
