
import React from "react";
import Markdown from "markdown-to-jsx";

const MarkDownView = ({ content, className }) => {
  const SnippetView = ({ children, ...props }) => {
    const isJsx =
      children.indexOf("import ") != -1 || children.indexOf("const ") != -1
        ? "jsx"
        : "html";
    return (
      <>
        <div
          {...props}
          className="flex flex-col  dark:bg-black bg-white  rounded-lg"
        >
          <span className="w-full top-0 px-2 bg-gray-600 rounded-t-lg flex justify-between">
            <span>{isJsx}</span>
            <span>copy</span>
          </span>
          <span className="w-full p-4 overflow-scroll">{children}</span>
        </div>
      </>
    );
  };

  const LiView = ({ children, ...props }) => (
    <>
      {" "}
      - {children}
      <br></br>
    </>
  );

  const TheH4 = ({ children, ...props }) => (
    <div className="mt-4">{children}</div>
  );

  return (
    <Markdown
      className={className}
      options={{
        overrides: {
          h1: {
            props: {
              className: "text-lg font-bold py-2",
            },
          },
          h2: {
            props: {
              className: "text-lg  py-2 underline",
            },
          },
          h3: {
            props: {
              className: "text-md underline py-2",
            },
          },
          h4: {
            component: TheH4,
            props: {
              className: "py-2",
            },
          },
          pre: {
            props: {
              className:
                "dark:bg-black bg-white dark:text-light text-dark border rounded-lg  mt-3",
            },
          },
          code: {
            component: SnippetView,
          },
          li: {
            component: LiView,
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default MarkDownView;