import React from "react";

export const Button = ({ children, onClick, className, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-[#89AC46] text-white rounded-md hover:bg-[#76a03a] transition ${className}`}
    >
      {children}
    </button>
  );
};
