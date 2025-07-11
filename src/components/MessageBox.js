import React from 'react';

const MessageBox = ({ message, type, onClose, themeClasses }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-700' : 'bg-red-700';
  const title = type === 'success' ? 'Success!' : 'Error!';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999] animate-fade-in">
      <div className={`${bgColor} rounded-xl p-6 max-w-sm w-full relative shadow-2xl text-white text-center animate-scale-in`}>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-white text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300 transform hover:scale-105 cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
