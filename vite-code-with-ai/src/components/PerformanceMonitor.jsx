import React, { useState, useEffect } from "react";
import GraphCanvas from "./CanvasGraph";

const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({
    memory: window.performance.memory,
    navigation: window.performance.navigation,
    timing: window.performance.timing,
  });
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData({
        memory: window.performance.memory,
        navigation: window.performance.navigation,
        timing: window.performance.timing,
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      // Check the origin of the message if needed
      // if (event.origin === 'http://example.com') {
      const receivedMemoryInfo = event.data;
      setMemoryInfo(receivedMemoryInfo);
      // }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">Window Performance Monitoring</h1>
      <div className="w-full text-center overflow-y-scroll">
      <GraphCanvas usedJSHeapSize={performanceData.memory.usedJSHeapSize } totalJSHeapSize={performanceData.memory.totalJSHeapSize } />
        {memoryInfo ? (
          
          <div>
             <GraphCanvas usedJSHeapSize={memoryInfo.usedJSHeapSize } totalJSHeapSize={memoryInfo.totalJSHeapSize } />
            <h2>Information de la mémoire</h2>
            <p>Taille utilisée du tas JS : {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} Mb</p>
            <p>Taille totale du tas JS : {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} Mb</p>
            <p>Limite de la taille du tas JS : {(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} Mb</p>
           
          </div>
          ) : (
            <p>Aucune information de mémoire reçue pour le moment.</p>
          )}
          <h2 className="text-lg font-semibold">Mémoire</h2>
          <p>Taille totale du tas JS : {(performanceData.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} Mb</p>
          <p>Taille utilisée du tas JS : {(performanceData.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} Mb</p>
          <p>Limite de la taille du tas JS : {(performanceData.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} Mb</p>
        <h2 className="text-lg font-semibold mt-4">Navigation Timing</h2>
        <p>Redirect Count: {performanceData.navigation.redirectCount}</p>
        <p>Type: {performanceData.navigation.type}</p>

        <h2 className="text-lg font-semibold mt-4">Performance Timing</h2>
        <p>Connect End: {performanceData.timing.connectEnd}</p>
        <p>Load Event End: {performanceData.timing.loadEventEnd}</p>
        <p>Navigation Start: {performanceData.timing.navigationStart}</p>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
