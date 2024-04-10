import React , {useEffect,useState} from "react";
import LoadingDiv from "./LoadingDiv";

function CustomIframe({
  jsCode,
  htmlCode,
  consoleLog,
  transpileJSX,
  messageFinished,
  mode,
}) {
  const cats = [
    "https://i.giphy.com/7NoNw4pMNTvgc.webp",
    "https://c.tenor.com/y2JXkY1pXkwAAAAC/tenor.gif",
  ];

  const [localCode,setLocalCode]=useState("");

  const isModule = jsCode.includes("import") || jsCode.includes("export");
  const moduleTag = isModule ? "type=module" : "";


  let fullHtmlCode =jsCode?
    `<html>${htmlCode}<script src="https://js.puter.com/v2/"></` +
    `script><script ${moduleTag}>const puter = window.puter;\n${transpileJSX(
      jsCode
    )}<` +
    `/script><div class="fixed bottom-0"><pre class="fixed opacity-50 bottom-12 w-full dark:bg-dark bg-light dark:text-light text-dark" id="logs2"></pre></div><script>${consoleLog}</` +
    `script></html>`:"";

  //store fullHtmlCode in localStorage
  if(mode=="normal"){
    if (typeof window !== "undefined") {
      console.log("Setting fullHtmlCode in localStorage");
      localStorage.setItem("fullHtmlCode", fullHtmlCode);
    }
  }else{
    fullHtmlCode=localStorage.getItem("fullHtmlCode");
    fullHtmlCode=localCode;
  }



  useEffect(() => {
    let id=null;
    if(mode!="normal"){
      //every second
      id=setInterval(() => {
        //get logs
        console.log("getting html");
        fullHtmlCode=localStorage.getItem("fullHtmlCode");
        setLocalCode(fullHtmlCode);
      }, 1000);
    }
    return () => {
      if(mode!="normal"){
      clearInterval(id);
      }
    };


  },[mode]);


  

  

  return (
    <>
      {(messageFinished == 0 || htmlCode == "" || jsCode == "") && (
        <LoadingDiv message={"Loading ...."} />
      )}
      {messageFinished == 1 && (
        <iframe
          className="w-full h-full dark:bg-dark bg-light dark:text-light text-dark border dark:border-light border-dark rounded shadow-lg"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
          allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; document-domain; encrypted-media; execution-while-not-rendered; execution-while-out-of-viewport; fullscreen; picture-in-picture; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; navigation-override; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; wake-lock; xr-spatial-tracking"
          srcDoc={
            jsCode === ""
              ? ""
              : messageFinished
              ? fullHtmlCode
              : ""
          }
        />
      )}
    </>
  );
}

export default CustomIframe;
