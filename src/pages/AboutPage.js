import React from 'react';
import SectionWrapper from '../components/SectionWrapper';

const AboutPage = ({ themeClasses }) => (
  <SectionWrapper id="about" title="About PC Shivan" themeClasses={themeClasses}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center animate-fade-in-left-slow">
        <img
          src="./images/pcshivan-portrait.jpg" // Updated image path
          alt="PC Shivan Portrait"
          className={`rounded-full shadow-2xl border-4 ${themeClasses.buttonPrimaryBorder} object-cover w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-300`}
        />
      </div>
      <div className={`text-lg leading-relaxed ${themeClasses.mainText} animate-fade-in-right-slow`}>
        <p className="mb-6">
          PC Shivan is a visionary music composer who seamlessly blends traditional melodies with cutting-edge soundscapes, creating a unique auditory experience. With a passion for innovation and a keen ear for detail, Shivan crafts music that resonates deeply with listeners, pushing the boundaries of contemporary composition.
        </p>
        <p className="mb-6">
          His work spans various genres, always infused with a distinctive style that is both modern and timeless. From evocative film scores to pulsating electronic tracks, PC Shivan's compositions are a testament to his versatility and artistic prowess. He is dedicated to connecting with his audience, inviting them into his sonic universe.
        </p>
        <p>
          Join PC Shivan on a musical journey where creativity knows no bounds and every note tells a story.
        </p>
      </div>
    </div>
  </SectionWrapper>
);

export default AboutPage;
