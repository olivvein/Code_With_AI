
import React, { useState } from "react";
import PropTypes from 'prop-types';





const NavBar = ({
  visibleApiKey,
  username,
  sendMenuAction,
  selectedPrompt,
  prompts,
  templates
}) => {
  const [openMenu, setOpenMenu] = useState("");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const handleHover = (menu) => {
    if(openMenu!=""){
      setOpenMenu(menu);
    }
  }

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
      name: "Templates",
      subMenu: templates.map((template,index) => {
        return { status: "active", name: template.name, action: "setTemplate-"+index};
      }),
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
      name: "Prompts",
      subMenu: [...prompts.map((prompt,index) => {
        if(index==selectedPrompt){
          return { status: "active", name: prompt.name+" ✓", action: "setPrompt-"+index};
        }else{
          return { status: "active", name: prompt.name, action: "setPrompt-"+index};
        }
      }),{ status: "active", name: "View", action: "viewPrompts" },{ status: "active", name: "Promplets", action: "viewCustomPrompt" }],
    },
    {
      name: "Database",
      subMenu: [
        { status: "active", name: "Delete All", action: "deleteAll" },
        { status: "inactive", name: "View", action: "viewAllKv" },
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
    <nav className="absolute w-full top-0 left-0 dark:bg-dark bg-light dark:text-light text-dark px-0 h-5 flex z-40">
      <div className=" w-full top-0 dark:bg-dark bg-light dark:text-light text-dark  px-0 flex justify-between">
        <div className="w-5/6 top-0 dark:bg-dark bg-light dark:text-light text-dark pt-3 px-0">
          <span className="left-0 top-0  px-2">
            <span>
              <b>Code With Ai</b>
            </span>
            <span className="absolute left-0 top-6 text-sm px-2">
              By SamLePirate
            </span>
          </span>
          {menuConfig.map((menu, index) => (
            <div key={index} className="relative inline-block">
              <span
                
                tabIndex={index} // Makes the div focusable
                // Handles focus event
                onBlur={() => {
                  setTimeout(() => setOpenMenu(""), 100);
                }}
                onMouseOver={() => {handleHover(menu.name)}}
                className={`${
                  openMenu == menu.name ? "bg-gray-700" : ""
                } cursor-pointer pt-3 pb-2 px-2 active:bg-gray-700  hover:bg-blue-800 hover:text-light hover:shadow-lg rounded-lg mt-2`}
                onClick={() => toggleMenu(menu.name)}
              >
                {menu.name}
              </span>
              {openMenu === menu.name && (
                <div className="absolute backdrop-blur-xl  dark:bg-dark/30 bg-light/30 dark:text-light text-dark  left-0 mt-2 w-48  rounded-md  border border-gray-700 shadow-lg z-50 flex flex-col justify-around">
                 
                  
                  {menu.subMenu.map((subMenu,index) => (
                    <button
                      key={index}
                      className={`rounded-xl  mx-1 text-left px-4 py-2 active:border text-sm  active:bg-gray-400 active:border-gray-700 active:text-dark transition-colors duration-100 ease-in-out hover:bg-blue-800/100 hover:text-light ${
                        subMenu.status == "inactive" ? "dark:text-gray-600 text-gray-400 " : "dark:text-light text-dark "
                      } ${
                        index==menu.subMenu.length-1 ? "mb-1" : ""
                      }
                      ${
                        index==0 ? "mt-1" : ""
                      }
                      ${subMenu.status == "inactive" ?"active:bg-dark/0 active:border-none active:dark:text-gray-600 active:text-gray-400 hover:bg-dark/0 dark:text-gray-600 text-gray-400  hover:dark:text-gray-600 hover:text-gray-500  cursor-auto":""}
                      `}
                      // onClick={() => {
                        
                      //   sendMenuAction(subMenu.action);
                      //   setTimeout(() => setOpenMenu(""), 300);
                        
                      // }}
                      onMouseDown={(e) => {
                        if(subMenu.status == "inactive"){
                          e.preventDefault();
                          return;
                        }
                        sendMenuAction(subMenu.action);
                        setTimeout(() => setOpenMenu(""), 300);
                        
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
        <div className="justify-end pt-3 px-0 ">
          <span className="cursor-pointer  pt-3 pb-2 px-2  hover:bg-gray-700 hover:shadow-lg rounded-lg">
            {visibleApiKey+username}
            
          </span>
        </div>
      </div>
    </nav>
  );
};

NavBar.propTypes = {
  visibleApiKey: PropTypes.string,
  username: PropTypes.string,
  sendMenuAction: PropTypes.func.isRequired,
  selectedPrompt: PropTypes.number,
  prompts: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })),
  templates: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })),
};

export default NavBar;