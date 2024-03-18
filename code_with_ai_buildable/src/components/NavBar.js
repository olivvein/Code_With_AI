
import React, { useState } from "react";

const NavBar = ({
  inputSubmit,
  setGptValue,
  gptVal,
  resetApiKey,
  visibleApiKey,
  username,
  inputMessage,
  setInputVal,
  chatProvider,
  setChatProvider,
  ollamaConfig,
  sendMenuAction,
}) => {
  const [openMenu, setOpenMenu] = useState("");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const menuConfig = [
    {
      name: "File",
      subMenu: [
        { status: "active", name: "New", action: "new" },
        { status: "inactive", name: "Open", action: "open" },
        { status: "inactive", name: "Import", action: "import" },
        { status: "inactive", name: "Save", action: "save" },
        { status: "active", name: "Save As", action: "saveAs" },
        { status: "active", name: "Deploy", action: "deploy" },
      ],
    },
    {
      name: "Edit",
      subMenu: [
        { status: "inactive", name: "Undo", action: "undo" },
        { status: "inactive", name: "Copy", action: "copy" },
        { status: "inactive", name: "Cut", action: "cut" },
        { status: "inactive", name: "Paste", action: "paste" },
      ],
    },
    {
      name: "View",
      subMenu: [
        { status: "inactive", name: "Fullscreen", action: "fullscreen" },
        { status: "inactive", name: "Dark Mode", action: "darkMode" },
      ],
    },
    {
      name: "Help",
      subMenu: [
        { status: "inactive", name: "About Us", action: "aboutUs" },
        { status: "active", name: "User Guide", action: "userGuide" },
      ],
    },
  ];

  return (
    <nav className="absolute w-full top-0 left-0 dark:bg-dark bg-light dark:text-light text-dark top-0 px-0 h-5 flex   z-50">
      <div className=" w-full top-0 dark:bg-dark bg-light dark:text-light text-dark  px-0 flex justify-between">
        <div className="w-3/4 top-0 dark:bg-dark bg-light dark:text-light text-dark py-2 px-0">
          <span className="left-0 py-4 px-2">
            <span>
              <b>Code With Ais</b>
            </span>
            <span className="absolute left-0 top-6 text-sm px-2">
              By SamLePirate
            </span>
          </span>
          {menuConfig.map((menu, index) => (
            <div className="relative inline-block">
              <span
                tabIndex={index} // Makes the div focusable
                // Handles focus event
                onBlur={() => {
                  setTimeout(() => toggleMenu(menu.name), 100);
                }}
                className={`${
                  openMenu == menu.name ? "bg-gray-700" : ""
                } cursor-pointer pt-3 pb-2 px-2 active:bg-gray-700  hover:bg-gray-700 hover:shadow-lg rounded-lg`}
                onClick={() => toggleMenu(menu.name)}
              >
                {menu.name}
              </span>
              {openMenu === menu.name && (
                <div className="absolute left-0 mt-2 w-48 dark:bg-dark bg-light rounded-md animate-appear border border-gray-700 shadow-lg z-50 ">
                  {menu.subMenu.map((subMenu) => (
                    <button
                      className={`w-full text-left block px-4 py-2 border border-gray-700 text-sm text-gray-300 active:bg-gray-400 active:border-gray-700 active:text-dark transition-colors duration-100 ease-in-out hover:bg-gray-700 ${
                        subMenu.status == "inactive" ? "text-gray-600" : ""
                      }`}
                      onClick={() => {
                        setOpenMenu("");
                        sendMenuAction(subMenu.action);
                      }}
                    >
                      {subMenu.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="justify-end py-2 px-0">
          <span className="cursor-pointer cursor-pointer pt-3 pb-2 px-2  hover:bg-gray-700 hover:shadow-lg rounded-lg">
            {visibleApiKey}
            {username}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;