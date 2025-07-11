/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// Firebase configuration for deployed environment (read from environment variables)
// Safely access process.env, providing fallbacks if 'process' is not defined (e.g., in browser/Worker runtime)
const deployedAppId = (typeof process !== 'undefined' && process.env.REACT_APP_APP_ID) ? process.env.REACT_APP_APP_ID : 'default-app-id-deployed';
const deployedFirebaseConfig = (typeof process !== 'undefined' && process.env.REACT_APP_FIREBASE_CONFIG) ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {};

// Use Canvas globals if available (for Canvas environment), otherwise use deployed values
const appId = typeof __app_id !== 'undefined' ? __app_id : deployedAppId;
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : deployedFirebaseConfig;
// __initial_auth_token is specific to Canvas; for deployed app, rely on standard Firebase auth flow
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// Initialize Firebase outside of the component to avoid re-initialization
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback for local development or environments without Firebase config
  app = null;
  db = null;
  auth = null;
}


// --- Utility Components ---

// SocialIcon component for consistent social media links with enhanced styling
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

// SectionWrapper for consistent section styling with layered background and subtle animation
const SectionWrapper = ({ id, title, children }) => (
  <section id={id} className="relative py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-theme-bg-start to-theme-bg-end text-theme-text min-h-screen flex flex-col justify-center items-center overflow-hidden">
    {/* Subtle geometric background pattern for layering and depth */}
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
    <h2 className="relative z-10 text-5xl md:text-6xl font-extrabold mb-12 text-center text-theme-accent drop-shadow-lg font-cinzel tracking-wide animate-fade-in-up-slow">
      {title}
    </h2>
    <div className="relative z-10 max-w-6xl w-full">
      {children}
    </div>
  </section>
);

// Modal component for contact forms with improved animations
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

// Message Box component for alerts/confirmations with improved animations
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

// --- Theme Definitions ---
const themes = {
  'dark-purple': {
    name: 'Dark Purple',
    bodyBg: 'bg-gray-950',
    headerBg: 'bg-gray-900',
    headerText: 'text-white',
    headerHover: 'hover:text-purple-400',
    footerBg: 'bg-gradient-to-t from-gray-950 to-gray-900',
    footerBorder: 'border-purple-800',
    mainText: 'text-gray-300',
    accentText: 'text-purple-400',
    buttonPrimaryBg: 'bg-gradient-to-r from-purple-600 to-indigo-700',
    buttonPrimaryHover: 'hover:from-purple-700 hover:to-indigo-800',
    buttonPrimaryBorder: 'border-purple-400',
    buttonSpotifyBg: 'bg-gradient-to-r from-green-500 to-teal-600',
    buttonSpotifyHover: 'hover:from-green-600 hover:to-teal-700',
    buttonSpotifyBorder: 'border-green-300',
    cardBg: 'bg-gray-800',
    cardBorder: 'border-purple-700',
    inputBg: 'bg-gray-700',
    inputBorder: 'border-gray-600',
    inputFocusBorder: 'focus:border-purple-500',
    modalBg: 'bg-gray-800',
    modalBorder: 'border-purple-600',
    themeBgStart: 'gray-900',
    themeBgEnd: 'black',
  },
  'dark-blue': {
    name: 'Dark Blue',
    bodyBg: 'bg-blue-950',
    headerBg: 'bg-blue-900',
    headerText: 'text-white',
    headerHover: 'hover:text-cyan-400',
    footerBg: 'bg-gradient-to-t from-blue-950 to-blue-900',
    footerBorder: 'border-cyan-800',
    mainText: 'text-blue-200',
    accentText: 'text-cyan-400',
    buttonPrimaryBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    buttonPrimaryHover: 'hover:from-blue-700 hover:to-indigo-800',
    buttonPrimaryBorder: 'border-blue-400',
    buttonSpotifyBg: 'bg-gradient-to-r from-green-500 to-teal-600',
    buttonSpotifyHover: 'hover:from-green-600 hover:to-teal-700',
    buttonSpotifyBorder: 'border-green-300',
    cardBg: 'bg-blue-800',
    cardBorder: 'border-cyan-700',
    inputBg: 'bg-blue-700',
    inputBorder: 'border-blue-600',
    inputFocusBorder: 'focus:border-cyan-500',
    modalBg: 'bg-blue-800',
    modalBorder: 'border-cyan-600',
    themeBgStart: 'blue-900',
    themeBgEnd: 'black',
  },
};

// --- Page Components ---

const HomePage = ({ scrollToSection, themeClasses }) => (
  <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://placehold.co/1920x1080/1a1a2e/e0b0ff?text=PC+SHIVAN+MUSIC')" }}>
    {/* Dynamic background overlay for artistic effect with subtle pulse */}
    <div className="absolute inset-0 bg-gradient-to-br from-black via-theme-accent-900/50 to-black opacity-80 animate-pulse-subtle"></div>
    <div className="relative z-10 text-center text-white p-8 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 shadow-2xl border ${themeClasses.cardBorder} max-w-4xl mx-4 transform animate-fade-in-up-hero">
      <h1 className="text-6xl md:text-8xl font-extrabold mb-4 leading-tight drop-shadow-lg font-cinzel tracking-wider">
        PC SHIVAN
      </h1>
      <p className="text-2xl md:text-3xl font-light ${themeClasses.accentText} mb-8 font-inter italic">
        Innovative Music Composer | Artist | Visionary
      </p>
      <button
        onClick={() => scrollToSection('music')}
        className={`${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl border ${themeClasses.buttonPrimaryBorder} cursor-pointer`}
      >
        Explore My Music
      </button>
    </div>
  </section>
);

const AboutPage = ({ themeClasses }) => (
  <SectionWrapper id="about" title="About PC Shivan" themeClasses={themeClasses}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center animate-fade-in-left-slow">
        <img
          src="https://placehold.co/500x500/333333/e0b0ff?text=PC+Shivan+Portrait"
          alt="PC Shivan Portrait"
          className="rounded-full shadow-2xl border-4 ${themeClasses.buttonPrimaryBorder} object-cover w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-300"
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

const MusicPage = ({ themeClasses }) => {
  const musicTracks = [
    {
      id: '1',
      title: 'Echoes of Tomorrow',
      artist: 'PC Shivan',
      genre: 'Electronic, Cinematic',
      imageUrl: 'https://placehold.co/300x300/4a4e69/e0b0ff?text=Echoes',
      spotifyEmbed: 'https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6?utm_source=generator', // Example Spotify embed
      buyLink: '#', // Placeholder for actual sales link
    },
    {
      id: '2',
      title: 'Urban Pulse',
      artist: 'PC Shivan',
      genre: 'Hip Hop, Fusion',
      imageUrl: 'https://placehold.co/300x300/22223b/e0b0ff?text=Urban',
      spotifyEmbed: 'https://open.spotify.com/embed/track/4WqB9o4u1z0r9Y1D2B9Y1D?utm_source=generator', // Example Spotify embed
      buyLink: '#',
    },
    {
      id: '3',
      title: 'Serene Depths',
      artist: 'PC Shivan',
      genre: 'Ambient, Orchestral',
      imageUrl: 'https://placehold.co/300x300/0f0f0f/e0b0ff?text=Serene',
      spotifyEmbed: 'https://open.spotify.com/embed/track/2LhB9o4u1z0r9Y1D2B9Y1D?utm_source=generator', // Example Spotify embed
      buyLink: '#',
    },
  ];

  return (
    <SectionWrapper id="music" title="My Music" themeClasses={themeClasses}>
      <div className="text-center mb-12 animate-fade-in-up-slow">
        <p className={`text-xl ${themeClasses.mainText} mb-6`}>
          Dive into my latest compositions and explore my diverse musical universe.
        </p>
        <a
          href="https://open.spotify.com/artist/pcshivanofficial"
          target="_blank"
          rel="noopener noreferrer"
          className={`${themeClasses.buttonSpotifyBg} ${themeClasses.buttonSpotifyHover} text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg border ${themeClasses.buttonSpotifyBorder} cursor-pointer`}
        >
          <i className="fab fa-spotify mr-2"></i> Listen on Spotify
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {musicTracks.map((track, index) => (
          <div key={track.id} className={`${themeClasses.cardBg} rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 border ${themeClasses.cardBorder} group animate-fade-in-item`} style={{ animationDelay: `${index * 0.15}s` }}>
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="p-6">
              <h3 className={`text-3xl font-bold ${themeClasses.accentText} mb-2 font-cinzel`}>{track.title}</h3>
              <p className={`text-gray-400 text-lg mb-4 font-inter`}>{track.artist} - {track.genre}</p>
              {track.spotifyEmbed && (
                <div className={`mb-4 rounded-lg overflow-hidden border ${themeClasses.inputBorder}`}>
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src={track.spotifyEmbed}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Spotify Embed for ${track.title}`}
                  ></iframe>
                </div>
              )}
              <a
                href={track.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-md cursor-pointer`}
              >
                Buy Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

const MerchPage = ({ themeClasses }) => {
  const merchItems = [
    {
      id: 'm1',
      name: 'PC Shivan T-Shirt',
      price: '$29.99',
      imageUrl: 'https://placehold.co/300x300/6a0572/ffffff?text=T-Shirt',
      buyLink: '#',
    },
    {
      id: 'm2',
      name: 'Signature Hoodie',
      price: '$59.99',
      imageUrl: 'https://placehold.co/300x300/4b0082/ffffff?text=Hoodie',
      buyLink: '#',
    },
    {
      id: 'm3',
      name: 'Limited Edition Vinyl',
      price: '$39.99',
      imageUrl: 'https://placehold.co/300x300/8a2be2/ffffff?text=Vinyl',
      buyLink: '#',
    },
  ];

  return (
    <SectionWrapper id="merch" title="Merchandise" themeClasses={themeClasses}>
      <p className={`text-xl ${themeClasses.mainText} text-center mb-12 animate-fade-in-up-slow`}>
        Show your support and grab some exclusive PC Shivan merchandise!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {merchItems.map((item, index) => (
          <div key={item.id} className={`${themeClasses.cardBg} rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 border ${themeClasses.cardBorder} group animate-fade-in-item`} style={{ animationDelay: `${index * 0.15}s` }}>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="p-6 text-center">
              <h3 className={`text-3xl font-bold ${themeClasses.accentText} mb-2 font-cinzel`}>{item.name}</h3>
              <p className={`text-gray-300 text-2xl mb-4 font-inter`}>{item.price}</p>
              <a
                href={item.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-md cursor-pointer`}
              >
                Buy Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

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

const TestimonialsPage = ({ userId, db, themeClasses }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    if (!db) {
      console.error("Firestore is not initialized.");
      return;
    }

    const testimonialsCollectionRef = collection(db, `artifacts/${appId}/public/data/testimonials`);
    const q = query(testimonialsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTestimonials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort testimonials in memory to ensure latest are first
      setTestimonials(fetchedTestimonials.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }, (error) => {
      console.error("Error fetching testimonials:", error);
      setShowSubmissionMessage({ type: 'error', message: 'Failed to load testimonials. Please try again later.' });
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db]);

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    if (!name || !message) {
      setShowSubmissionMessage({ type: 'error', message: 'Please fill in both your name and message.' });
      return;
    }
    if (!db) {
      setShowSubmissionMessage({ type: 'error', message: 'Database not available. Cannot submit testimonial.' });
      console.error("Firestore is not initialized. Cannot submit testimonial.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/testimonials`), {
        name,
        message,
        userId: userId, // Store the user ID for context
        timestamp: serverTimestamp(),
      });
      setName('');
      setMessage('');
      setShowSubmissionMessage({ type: 'success', message: 'Thank you for your testimonial! It will appear shortly.' });
    } catch (error) {
      console.error("Error adding testimonial:", error);
      setShowSubmissionMessage({ type: 'error', message: 'Failed to submit testimonial. Please try again.' });
    }
  };

  const getRandomRotation = () => {
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  };

  // Dynamically get random background color based on current theme's palette
  const getRandomBgColor = () => {
    const defaultColors = ['bg-purple-800', 'bg-indigo-800', 'bg-blue-800', 'bg-pink-800'];
    const themeSpecificColors = {
      'dark-purple': ['bg-purple-800', 'bg-indigo-800', 'bg-gray-700'],
      'dark-blue': ['bg-blue-800', 'bg-cyan-800', 'bg-gray-700'],
    };
    const availableColors = themeSpecificColors[themeClasses.id] || defaultColors;
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  return (
    <SectionWrapper id="testimonials" title="Fan Love & Testimonials" themeClasses={themeClasses}>
      <p className={`text-xl ${themeClasses.mainText} text-center mb-12 animate-fade-in-up-slow`}>
        Your words inspire me! Share your thoughts and become a part of the PC Shivan community.
      </p>

      <form onSubmit={handleSubmitTestimonial} className={`${themeClasses.cardBg} p-8 rounded-xl shadow-xl mb-12 border ${themeClasses.cardBorder} max-w-2xl mx-auto animate-fade-in-up-slow`}>
        <h3 className={`text-3xl font-bold ${themeClasses.accentText} mb-6 text-center font-cinzel`}>Leave a Testimonial</h3>
        <div className="mb-6">
          <label htmlFor="name" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-4 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} transition-colors duration-200`}
            required
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Your Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            className={`w-full p-4 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} resize-y transition-colors duration-200`}
            required
            placeholder="Share your experience or thoughts..."
          ></textarea>
        </div>
        <button
          type="submit"
          className={`w-full ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border ${themeClasses.buttonPrimaryBorder} cursor-pointer`}
        >
          Submit Testimonial
        </button>
      </form>

      <MessageBox
        message={showSubmissionMessage?.message}
        type={showSubmissionMessage?.type}
        onClose={() => setShowSubmissionMessage(null)}
        themeClasses={themeClasses}
      />

      {testimonials.length === 0 ? (
        <p className={`text-center ${themeClasses.mainText} text-xl`}>No testimonials yet. Be the first to leave one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`p-6 rounded-xl shadow-xl transform ${getRandomRotation()} ${getRandomBgColor()} text-white border ${themeClasses.inputBorder} animate-fade-in-item`}
              style={{ minHeight: '200px', animationDelay: `${index * 0.15}s` }}
            >
              <p className="text-lg italic mb-4 font-inter">"{testimonial.message}"</p>
              <p className={`text-right ${themeClasses.accentText} font-semibold font-inter`}>- {testimonial.name}</p>
              {testimonial.userId && (
                <p className="text-right text-xs text-gray-400 mt-2 font-inter">User ID: {testimonial.userId}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};


// --- Main App Component ---

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactFormType, setContactFormType] = useState('general');
  const [userId, setUserId] = useState(null);
  const [messageBox, setMessageBox] = useState(null); // { type: 'success' | 'error', message: string }

  // Theme state and persistence
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    // Initialize theme from localStorage or default to 'dark-purple'
    return localStorage.getItem('theme') || 'dark-purple';
  });
  const themeClasses = themes[currentThemeId];

  // Firebase Auth and DB Initialization
  useEffect(() => {
    const initializeFirebase = async () => {
      if (!auth || !db) {
        setMessageBox({ type: 'error', message: 'Firebase is not configured correctly. Some features may not work. Please ensure REACT_APP_APP_ID and REACT_APP_FIREBASE_CONFIG environment variables are set in Cloudflare Pages.' });
        console.error("Firebase Auth or DB is not initialized. Check firebaseConfig and global variables.");
        return;
      }

      try {
        // For deployed app, initialAuthToken is null, so it will sign in anonymously
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
          console.log("Signed in with custom token (Canvas environment).");
        } else {
          await signInAnonymously(auth);
          console.log("Signed in anonymously (Deployed environment).");
        }

        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("User UID:", user.uid);
          } else {
            setUserId(null);
            console.log("No user signed in.");
          }
        });
      } catch (error) {
        console.error("Firebase authentication error:", error);
        setMessageBox({ type: 'error', message: `Authentication failed: ${error.message}. Please check your Firebase project setup and security rules.` });
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', currentThemeId);
  }, [currentThemeId]);


  const navigate = (page) => {
    setCurrentPage(page);
    // Optional: Smooth scroll to top of page when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openContactModal = (type) => {
    setContactFormType(type);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactFormType('general'); // Reset type
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;

    // Construct mailto link
    const mailtoLink = `mailto:contact@pcshivan.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

    // Open email client
    window.location.href = mailtoLink;

    setMessageBox({ type: 'success', message: 'Your message is ready to be sent via your email client!' });
    closeContactModal();
  };

  const getContactSubject = (type) => {
    switch (type) {
      case 'producer-director':
        return 'Collaboration Inquiry (Producer/Director)';
      case 'corporate':
        return 'Corporate/Licensing Inquiry';
      case 'general':
      default:
        return 'General Inquiry';
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bodyBg} font-inter transition-colors duration-500`}>
      {/* Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" xintegrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0V4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      {/* Google Fonts for Inter and Cinzel */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />
      {/* Tailwind CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden; /* Prevent horizontal scroll */
        }
        /* Custom scrollbar for a sleek look */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a2e;
        }
        ::-webkit-scrollbar-thumb {
          background: #6b46c1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #805ad5;
        }
        .drop-shadow-lg {
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }

        /* Keyframe for subtle pulsing background */
        @keyframes pulse-subtle {
          0% { opacity: 0.8; }
          50% { opacity: 0.85; }
          100% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 10s infinite ease-in-out;
        }

        /* Keyframes for fade-in and scale animations for a seamless feel */
        @keyframes fade-in-up-hero {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up-hero {
          animation: fade-in-up-hero 1.2s ease-out forwards;
        }

        @keyframes fade-in-up-slow {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up-slow {
          animation: fade-in-up-slow 1s ease-out forwards;
        }

        @keyframes fade-in-left-slow {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-left-slow {
          animation: fade-in-left-slow 1s ease-out forwards;
        }

        @keyframes fade-in-right-slow {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right-slow {
          animation: fade-in-right-slow 1s ease-out forwards;
        }

        @keyframes fade-in-item {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-item {
          animation: fade-in-item 0.7s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        /* Ensure cursor pointer for all clickable elements */
        button, a {
          cursor: pointer;
        }

        /* Theme slider specific styles */
        .theme-slider-container {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 100;
            display: flex;
            align-items: center;
            background-color: rgba(30, 30, 50, 0.8); /* Dark translucent background */
            padding: 10px 15px;
            border-radius: 9999px; /* Pill shape */
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px); /* Frosted glass effect */
            border: 1px solid rgba(128, 90, 213, 0.5); /* Purple border */
            transition: background-color 0.5s, border-color 0.5s;
        }

        .theme-slider-label {
            color: #e0b0ff; /* Purple accent text */
            font-size: 0.9rem;
            font-weight: 600;
            margin-right: 10px;
        }

        .theme-toggle-button {
            width: 60px; /* Width of the toggle button */
            height: 30px; /* Height of the toggle button */
            background-color: #4a4a6a; /* Default track color */
            border-radius: 15px; /* Half of height for pill shape */
            position: relative;
            cursor: pointer;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            padding: 0 3px;
        }

        .theme-toggle-button.active {
            background-color: #6b46c1; /* Active track color (purple) */
        }

        .theme-toggle-circle {
            width: 24px; /* Size of the circle */
            height: 24px; /* Size of the circle */
            background-color: #e0b0ff; /* Circle color (light purple) */
            border-radius: 50%;
            position: absolute;
            transition: transform 0.3s;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .theme-toggle-button.active .theme-toggle-circle {
            transform: translateX(30px); /* Move to the right for active state */
        }
        `}
      </style>

      {/* Header */}
      <header className={`fixed top-0 left-0 w-full ${themeClasses.headerBg} bg-opacity-90 z-40 shadow-lg py-4 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center backdrop-blur-sm transition-colors duration-500`}>
        <div className={`text-3xl font-extrabold tracking-wider mb-4 md:mb-0 font-cinzel ${themeClasses.headerText}`}>
          {/* Changed href from "#" to "/" for better accessibility and semantic correctness */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('home'); }} className={`${themeClasses.headerHover} transition-colors duration-300`}>PC SHIVAN</a>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-lg font-inter">
          <button onClick={() => navigate('home')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Home</button>
          <button onClick={() => navigate('about')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>About</button>
          <button onClick={() => navigate('music')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Music</button>
          <button onClick={() => navigate('merch')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Merch</button>
          <button onClick={() => navigate('testimonials')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Testimonials</button>
          <button onClick={() => navigate('contact')} className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Contact</button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-20"> {/* Add padding-top to account for fixed header */}
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage scrollToSection={scrollToSection} themeClasses={themeClasses} />;
            case 'about':
              return <AboutPage themeClasses={themeClasses} />;
            case 'music':
              return <MusicPage themeClasses={themeClasses} />;
            case 'merch':
              return <MerchPage themeClasses={themeClasses} />;
            case 'contact':
              return <ContactPage openContactModal={openContactModal} themeClasses={themeClasses} />;
            case 'testimonials':
              return <TestimonialsPage userId={userId} db={db} themeClasses={themeClasses} />;
            default:
              return <HomePage scrollToSection={scrollToSection} themeClasses={themeClasses} />;
          }
        })()}
      </main>

      {/* Footer */}
      <footer className={`${themeClasses.footerBg} py-10 px-4 md:px-8 lg:px-16 text-center ${themeClasses.mainText} border-t ${themeClasses.footerBorder} transition-colors duration-500`}>
        <div className="mb-6">
          <SocialIcon href="https://www.instagram.com/pcshivanofficial" iconClass="fab fa-instagram" label="Instagram" />
          <SocialIcon href="https://www.linkedin.com/in/pcshivan" iconClass="fab fa-linkedin-in" label="LinkedIn" />
          <SocialIcon href="https://x.com/pcshivan" iconClass="fab fa-twitter" label="X (Twitter)" />
          <SocialIcon href="https://www.facebook.com/pcshivan" iconClass="fab fa-facebook-f" label="Facebook" />
          <SocialIcon href="https://open.spotify.com/artist/pcshivanofficial" iconClass="fab fa-spotify" label="Spotify" />
        </div>
        <p className="text-sm mb-2 font-inter">&copy; {new Date().getFullYear()} PC Shivan. All rights reserved.</p>
        <p className="text-xs font-inter">Built with passion and cutting-edge technology.</p>
        {userId && <p className="text-xs mt-2 font-inter">Your User ID: {userId}</p>}
      </footer>

      {/* Contact Modal */}
      <Modal isOpen={showContactModal} onClose={closeContactModal} themeClasses={themeClasses}>
        <h3 className={`text-3xl font-bold ${themeClasses.accentText} mb-6 text-center font-cinzel`}>
          {getContactSubject(contactFormType)}
        </h3>
        <form onSubmit={handleContactSubmit}>
          <div className="mb-4">
            <label htmlFor="contact-name" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Your Name:</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              className={`w-full p-3 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} transition-colors duration-200`}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contact-email" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Your Email:</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              className={`w-full p-3 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} transition-colors duration-200`}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contact-subject" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Subject:</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              value={getContactSubject(contactFormType)}
              readOnly
              className={`w-full p-3 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} cursor-not-allowed`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="contact-message" className={`block ${themeClasses.mainText} text-lg font-bold mb-2`}>Message:</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              className={`w-full p-3 rounded-lg ${themeClasses.inputBg} ${themeClasses.mainText} border ${themeClasses.inputBorder} focus:outline-none ${themeClasses.inputFocusBorder} resize-y transition-colors duration-200`}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className={`w-full ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHover} text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-300 transform hover:scale-105 shadow-lg cursor-pointer`}
          >
            Send Message
          </button>
        </form>
      </Modal>

      {/* Global Message Box */}
      <MessageBox
        message={messageBox?.message}
        type={messageBox?.type}
        onClose={() => setMessageBox(null)}
        themeClasses={themeClasses}
      />

      {/* Theme Slider Button */}
      <div className="theme-slider-container">
        <span className="theme-slider-label">Theme:</span>
        <div
          className={`theme-toggle-button ${currentThemeId === 'dark-purple' ? 'active' : ''}`}
          onClick={() => setCurrentThemeId(currentThemeId === 'dark-purple' ? 'dark-blue' : 'dark-purple')}
        >
          <div className="theme-toggle-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
