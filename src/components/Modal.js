import React from 'react';

const Modal = ({ isOpen, onClose, children, themeClasses }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`${themeClasses.modalBg} rounded-xl p-8 max-w-lg w-full relative shadow-2xl border ${themeClasses.modalBorder} animate-scale-in`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-300 cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
