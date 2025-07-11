import React from 'react';
import SectionWrapper from '../components/SectionWrapper';

const ContactPage = ({ openContactModal, themeClasses }) => (
  <SectionWrapper id="contact" title="Contact Me" themeClasses={themeClasses}>
    <p className={`text-xl ${themeClasses.mainText} text-center mb-12 animate-fade-in-up-slow`}>
      Whether you're a fan, a producer, a director, or a corporate entity, I'd love to hear from you.
      Please select the most relevant option below.
    </p>
    <div className="flex flex-wrap justify-center gap-6">
      <button
        onClick={() => openContactModal('general')}
        className={`${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border ${themeClasses.buttonPrimaryBorder} animate-fade-in-up-slow`}
        style={{ animationDelay: '0.1s' }}
      >
        <i className="fas fa-envelope mr-3"></i> General Inquiry
      </button>
      <button
        onClick={() => openContactModal('producer-director')}
        className={`${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border ${themeClasses.buttonPrimaryBorder} animate-fade-in-up-slow`}
        style={{ animationDelay: '0.2s' }}
      >
        <i className="fas fa-microphone-alt mr-3"></i> Producers & Directors
      </button>
      <button
        onClick={() => openContactModal('corporate')}
        className={`${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border ${themeClasses.buttonPrimaryBorder} animate-fade-in-up-slow`}
        style={{ animationDelay: '0.3s' }}
      >
        <i className="fas fa-building mr-3"></i> Corporate & Licensing
      </button>
    </div>
  </SectionWrapper>
);

export default ContactPage;
