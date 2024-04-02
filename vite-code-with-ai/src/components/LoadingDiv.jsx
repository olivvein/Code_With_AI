import React from "react";

const LoadingDiv = ({message}) => {
    return (
      <div className="relative w-full h-full flex justify-center items-center">
        <div className="absolute border-b border-blue-500 rounded-full w-64 h-64 animate-spin opacity-50"></div>
        <div className="absolute border-t border-blue-500 rounded-full w-40 h-40 animate-spin opacity-75"></div>
        <div className="absolute border-l border-green-500 rounded-full w-16 h-16 animate-spin animate-pulse"></div>
        <div className="absolute inset-0 flex justify-center items-center">
          <p className="text-2xl font-semibold text-white animate-pulse">{message}</p>
        </div>
        <div className="absolute w-full h-full flex justify-center items-center">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-3 bg-blue-500 rounded-full animate-ping"></div>
            <div className="h-3 bg-red-500 rounded-full animate-ping "></div>
            <div className="h-3 bg-green-500 rounded-full animate-ping "></div>
          </div>
        </div>
      </div>
    );
  };

  export default LoadingDiv;