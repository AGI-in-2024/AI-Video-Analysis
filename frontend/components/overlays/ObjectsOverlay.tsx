import React from 'react';

interface ObjectsOverlayProps {
  objects: Array<{ time: string; description: string }>;
  currentTime: number;
}

export function ObjectsOverlay({ objects, currentTime }: ObjectsOverlayProps) {
  const currentObjects = objects.filter(obj => parseFloat(obj.time) <= currentTime);
  
  return (
    <div className="absolute top-0 left-0 right-0 flex flex-wrap">
      {currentObjects.map((obj, index) => (
        <div key={index} className="bg-blue-500 bg-opacity-50 text-white m-1 p-1 rounded">
          {obj.description}
        </div>
      ))}
    </div>
  );
}