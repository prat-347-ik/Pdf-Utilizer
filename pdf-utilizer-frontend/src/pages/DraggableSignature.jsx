import React, { useRef } from "react";
import Draggable from "react-draggable";

const DraggableSignature = ({ signature, position, setPosition }) => {
  const dragRef = useRef(null);

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable nodeRef={dragRef} position={position} onDrag={handleDrag}>
      <div ref={dragRef} className="absolute cursor-move">
        <img src={signature} alt="Signature" className="w-24 h-12" />
      </div>
    </Draggable>
  );
};

export default DraggableSignature;
