import React from 'react';
import SectionWrapper from '../components/SectionWrapper'; // Assuming SectionWrapper is now in components

const HomePage = ({ scrollToSection, themeClasses }) => (
  <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('./images/hero-background.jpg')" }}> {/* Updated image path */}
    {/* Dynamic background overlay for artistic effect with subtle pulse */}
    <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black opacity-80 animate-pulse-subtle"></div>
    <div className={`relative z-10 text-center text-white p-8 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 shadow-2xl border ${themeClasses.cardBorder} max-w-4xl mx-4 transform animate-fade-in-up-hero`}>
      <h1 className="text-6xl md:text-8xl font-extrabold mb-4 leading-tight drop-shadow-lg font-cinzel tracking-wider">
        PC SHIVAN
      </h1>
      <p className={`text-2xl md:text-3xl font-light ${themeClasses.accentText} mb-8 font-inter italic`}>
        Innovative Music Composer | Artist | Visionary
      </p>
      <button
        onClick={() => scrollToSection('/music')} // Updated to use router path
        className={`${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl border ${themeClasses.buttonPrimaryBorder} cursor-pointer`}
      >
        Explore My Music
      </button>
    </div>
  </section>
);

export default HomePage;
