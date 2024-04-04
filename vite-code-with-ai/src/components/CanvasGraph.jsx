import React, { useEffect, useRef } from 'react';

const GraphCanvas = ({ usedJSHeapSize, totalJSHeapSize }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the bar width and spacing
    const barWidth = 50;
    const barSpacing = 20;

    // Calculate the maximum value for scaling
    const maxValue = Math.max(usedJSHeapSize, totalJSHeapSize);

    // Calculate the scaling factor
    const scaleFactor = canvas.height / maxValue;

    // Draw the used JS heap size bar
    ctx.fillStyle = 'green';
    const usedBarHeight = usedJSHeapSize * scaleFactor;
    ctx.fillRect(barSpacing, canvas.height - usedBarHeight, barWidth, usedBarHeight);

    // Draw the total JS heap size bar
    ctx.fillStyle = 'red';
    const totalBarHeight = totalJSHeapSize * scaleFactor;
    ctx.fillRect(barSpacing * 2 + barWidth, canvas.height - totalBarHeight, barWidth, totalBarHeight);

    // Draw the labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Used', barSpacing, canvas.height - 5);
    ctx.fillText('Total', barSpacing * 2 + barWidth, canvas.height - 5);
  }, [usedJSHeapSize, totalJSHeapSize]);

  return <canvas ref={canvasRef} width={200} height={200} />;
};

export default GraphCanvas;