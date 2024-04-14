import React, { useEffect, useRef,useState} from "react";

const LogSection = (name) => {
  const preRef = useRef(null);
  const [consoleContent, setConsoleContent] = useState([]);

  useEffect(() => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          
          const newLog=preRef.current.innerText.split("\n");
          console.log(newLog);
          setConsoleContent(newLog);
          //preRef.current.innerText=preRef.current.innerText.replace("FileSystem Socket: Disconnected","")
        }
      }
    });

    if (preRef.current) {
      observer.observe(preRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div id="logContainer" className="w-full h-full bg-dark">
      <div className="dark:bg-dark bg-light w-full" onClick={(e)=>{e.preventDefault();preRef.current.innerText=""}}>Clear</div>
      <pre
        ref={preRef}
        className="absolute z-0 w-0 h-0 opacity-50 bottom-12  dark:bg-dark bg-light dark:text-light text-dark"
        id="logs"
        style={{ overflow: "auto" }}
      ></pre>

      <div
        className="flex flex-col opacity-50 bottom-12 w-full h-full dark:bg-dark bg-light dark:text-light text-dark"
        style={{ overflow: "auto" }}
      >
        {consoleContent.map((log, index) => (
          <p className={`w-full flex border-b  border-white ${log.indexOf("consoleError")!=-1?"text-red-500":""} `} key={index}>{log.replace("consoleError","")}</p>
        ))}
      </div>
    </div>
  );
};

export default LogSection;