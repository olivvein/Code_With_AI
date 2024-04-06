import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import PerformanceMonitor from "./PerformanceMonitor";

let puter = window.puter;
const NavBar = ({
  visibleApiKey,
  username,
  sendMenuAction,
  selectedPrompt,
  prompts,
  templates,
  theNames,
  visiblesIds,
}) => {
  const [openMenu, setOpenMenu] = useState("");
  const [viewCount, setViewCount] = useState(0);
  const MobileView = window.innerWidth < 800 ? true : false;

  useEffect(() => {
    const getCount = async () => {
      const theApp = await puter.apps.get("code-with-ai");
      //console.log(theApp);
      setViewCount(theApp.stats.open_count);
      console.log("The Stats:", theApp.stats.open_count);
    };

    getCount();
    //every minute
    const interval = setInterval(() => {
      getCount();
    }, 60000);
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const handleHover = (menu) => {
    if (openMenu != "") {
      setOpenMenu(menu);
    }
  };

  const menuConfig = [
    {
      name: "File",
      subMenu: [
        { status: "active", name: "New", action: "new" },
        { status: "inactive", name: "Open", action: "open" },
        { status: "inactive", name: "Import", action: "import" },
        { status: "inactive", name: "Save", action: "save" },
        { status: "inactive", name: "separator", action: "none" },
        { status: "active", name: "Save As", action: "saveAs" },
        { status: "active", name: "Deploy", action: "deploy" },
      ],
    },
    {
      name: "Templates",
      subMenu: templates.map((template, index) => {
        return {
          status: "active",
          name: template.name,
          action: "setTemplate-" + index,
        };
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
      subMenu: [
        ...prompts.map((prompt, index) => {
          if (index == selectedPrompt) {
            return {
              status: "active",
              name: prompt.name + " ✓",
              action: "setPrompt-" + index,
            };
          } else {
            return {
              status: "active",
              name: prompt.name,
              action: "setPrompt-" + index,
            };
          }
        }),
        { status: "inactive", name: "separator", action: "none" },
        { status: "active", name: "View", action: "viewPrompts" },
        { status: "active", name: "Promplets", action: "viewCustomPrompt" },
      ],
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
        ...theNames.map((name, index) => {
          if (visiblesIds[index]) {
            return {
              status: "inactive",
              name: name + " ✓",
              action: "toggleId-" + index,
            };
          } else {
            return {
              status: "active",
              name: name,
              action: "toggleId-" + index,
            };
          }
        }),
        { status: "inactive", name: "separator", action: "none" },
        {
          status: "active",
          name: "Preview Fullscreen",
          action: "fullscreen-preview",
        },
        {
          status: "active",
          name: MobileView ? "Chat + Preview" : "Chat + Code + Preview",
          action: "normal-view",
        },
        { status: "active", name: "Chat Settings", action: "chat-settings" },
        { status: "active", name: "Console", action: "console-log" },
        { status: "active", name: "Code Fullscreen", action: "code-view" },
        { status: "active", name: "Code + Preview", action: "code-preview" },
        { status: "active", name: "Chat + Preview", action: "chat-preview" },
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

  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {MobileView == false ? (
        <nav
          id="theNavbar"
          className="absolute w-full p-0 m-0 top-0 left-0 dark:bg-dark bg-light dark:text-light text-dark px-0 h-5 flex z-40 text-sm "
        >
          <div className=" w-full top-0 dark:bg-dark bg-light dark:text-light text-dark  px-0 flex justify-between">
            <div className="w-4/6 top-0 dark:bg-dark bg-light dark:text-light text-dark pt-1 px-0 flex">
              <span className="left-0 top-0  px-2 flex flex-col">
                <span className=" left-0 top-0 text-sm px-2">
                  <b>{`Code With Ai ${viewCount.toString()}`}</b>
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
                    onMouseOver={() => {
                      handleHover(menu.name);
                    }}
                    className={`${
                      openMenu == menu.name ? "bg-gray-700" : ""
                    } cursor-pointer pt-1 pb-1 px-2 active:bg-gray-700  hover:bg-blue-800 hover:text-light hover:shadow-lg rounded-lg mt-2`}
                    onClick={() => toggleMenu(menu.name)}
                  >
                    {menu.name}
                  </span>
                  {openMenu === menu.name && (
                    <div className="absolute backdrop-blur-xl  dark:bg-dark/60 bg-light/60 dark:text-light text-dark  left-0 mt-2 w-48  rounded-md  border border-gray-700 transition-appear opacity-100 shadow-lg z-50 flex flex-col justify-around">
                      {menu.subMenu.map((subMenu, index) => (
                        <>
                          {subMenu.name == "separator" ? (
                            <div className="border-b border-gray-500 mx-2 my-1"></div>
                          ) : (
                            <button
                              key={index}
                              className={`rounded-xl  mx-1 text-left px-4 py-2 active:border text-sm  active:bg-gray-400 active:border-gray-700 active:text-dark transition-colors duration-100 ease-in-out hover:bg-blue-800/100 hover:text-light ${
                                subMenu.status == "inactive"
                                  ? "dark:text-gray-500 text-gray-400 "
                                  : "dark:text-light text-dark "
                              } ${
                                index == menu.subMenu.length - 1 ? "mb-1" : ""
                              }
                      ${index == 0 ? "mt-1" : ""}
                      ${
                        subMenu.status == "inactive"
                          ? " active:bg-none active:border-dark/0 active:bg-dark/0 active:dark:text-gray-600 active:text-gray-400 hover:bg-dark/0 dark:text-gray-600 text-gray-400  hover:dark:text-gray-600 hover:text-gray-500  cursor-auto"
                          : ""
                      }
                      `}
                              onMouseDown={(e) => {
                                if (subMenu.status == "inactive") {
                                  e.preventDefault();
                                  return;
                                }
                                sendMenuAction(subMenu.action);
                                setTimeout(() => setOpenMenu(""), 300);
                              }}
                            >
                              {subMenu.name}
                            </button>
                          )}
                        </>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="justify-end pt-1 px-0 ">
              <PerformanceMonitor />
              <span className="cursor-pointer  pt-1 pb-1 px-2  hover:bg-gray-700 hover:shadow-lg rounded-lg">
                {visibleApiKey + username}
              </span>
            </div>
          </div>
        </nav>
      ) : (
        //Mobile View
        <nav
          id="theNavbar"
          className="fixed w-full p-0 m-0 top-0 left-0 dark:bg-dark bg-light dark:text-light text-dark px-0 h-8 flex z-30 text-sm"
        >
          <div
            tabIndex="9999942"
            onBlur={() => {
              setTimeout(() => {
                if (openMenu === "okokokok") {
                  setShowMenu(false);
                }
              }, 300);
            }}
            className="w-full  top-0 dark:bg-dark bg-light dark:text-light text-dark px-0 flex flex-col"
          >
            <div className="w-full h-8 top-0 dark:bg-dark bg-light dark:text-light text-dark pt-1 px-0 flex justify-between">
              <span className="left-0 top-0 px-2 flex flex-col">
                <span
                  className="left-0 top-0 text-lg px-2 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();

                    setShowMenu(!showMenu);
                    setOpenMenu("");
                  }}
                >
                  <b>{`⊪ Code With Ai`}</b>
                </span>
              </span>
              <div className="justify-end pt-1 px-0">
                <span className="cursor-pointer pt-1 pb-1 px-2 hover:bg-gray-700 hover:shadow-lg rounded-lg text-lg">
                  {visibleApiKey + username}
                </span>
              </div>
            </div>
            {showMenu && (
              <div className="absolute w-full  h-[88vh] top-8 backdrop-blur-xl  dark:bg-dark/30 bg-light/30 dark:text-light text-dark px-0 flex flex-col text-lg">
                {menuConfig.map((menu, index) => (
                  <div key={index} className=" h-full flex flex-row">
                    <span
                      tabIndex={index}
                      onBlur={() => {
                        setTimeout(() => {
                          //setOpenMenu("");
                          //setShowMenu(false);
                        }, 100);
                      }}
                      onMouseOver={() => {
                        // handleHover(menu.name);
                      }}
                      className={`w-28 flex flex-col border dark:bg-dark bg-light shadow-lg z-50 dark:border-light border-dark justify-around ${
                        openMenu == menu.name ? "bg-gray-700" : ""
                      } cursor-pointer pt-1 pb-1 px-2 active:bg-gray-700/80 hover:bg-blue-800 hover:text-light hover:shadow-lg rounded-lg mt-2`}
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenu(menu.name);
                      }}
                    >
                      {menu.name}
                    </span>
                    <span
                      className="w-8/12"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(false);
                        setOpenMenu("");
                      }}
                    ></span>

                    {openMenu === menu.name && ( //show submenu
                      <div className="fixed  overflow-y-scroll ml-28 w-2/3 top-0 left-1 backdrop-blur-xl  dark:bg-dark/90 bg-light/90 dark:text-light text-dark mt-2 rounded-md border border-gray-700  shadow-lg z-50 flex flex-col justify-between">
                        {menu.subMenu.map((subMenu, index) => (
                          <>
                            {subMenu.name == "separator" ? (
                              <div className="border-b border-gray-500 mx-2 my-1"></div>
                            ) : (
                              <button
                                key={index}
                                className={`rounded-xl mx-1 text-left px-4 py-2 active:border text-sm active:bg-gray-400 active:border-gray-700 active:text-dark  hover:bg-blue-800 hover:text-light ${
                                  subMenu.status == "inactive"
                                    ? "dark:text-gray-500 text-gray-400 "
                                    : "dark:text-light text-dark "
                                } 
                                ${
                                  index == menu.subMenu.length - 1 ? "mb-1" : ""
                                }
                                ${index == 0 ? "mt-1" : ""}
                                ${
                                  subMenu.status == "inactive"
                                    ? " active:bg-none active:border-dark/0 active:bg-dark/0 active:dark:text-gray-600 active:text-gray-400 hover:bg-dark/0 dark:text-gray-600 text-gray-400 hover:dark:text-gray-600 hover:text-gray-500 cursor-auto"
                                    : ""
                                }
                                `}
                                onMouseDown={(e) => {
                                  if (subMenu.status == "inactive") {
                                    e.preventDefault();
                                    return;
                                  }
                                  //setShowMenu(false);
                                  sendMenuAction(subMenu.action);

                                  setTimeout(() => {
                                    setOpenMenu(""), setShowMenu(false);
                                  }, 300);
                                }}
                              >
                                {subMenu.name}
                              </button>
                            )}
                          </>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  );
};

NavBar.propTypes = {
  visibleApiKey: PropTypes.string,
  username: PropTypes.string,
  sendMenuAction: PropTypes.func.isRequired,
  selectedPrompt: PropTypes.number,
  prompts: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ),
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ),
};

export default NavBar;
