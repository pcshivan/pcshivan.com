import React from 'react';

const SocialIcon = ({ href, iconClass, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-300 hover:text-purple-400 transition-colors duration-300 mx-3 text-2xl transform hover:scale-110 cursor-pointer"
    aria-label={label}
  >
    <i className={iconClass}></i>
  </a>
);

export default SocialIcon;
