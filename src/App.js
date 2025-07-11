// File: src/App.js
/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// Import page components
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import MusicPage from './pages/MusicPage';
import MerchPage from './pages/MerchPage';
import ContactPage from './pages/ContactPage';
import TestimonialsPage from './pages/TestimonialsPage';

// Import utility components
import SocialIcon from './components/SocialIcon';
import Modal from './components/Modal';
import MessageBox from './components/MessageBox';

// Import themes
import { themes } from './utils/themes';

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


const App = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactFormType, setContactFormType] = useState('general');
  const [userId, setUserId] = useState(null);
  const [messageBox, setMessageBox] = useState(null); // { type: 'success' | 'error', message: string }
  const navigate = useNavigate(); // Use useNavigate hook for programmatic navigation

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
        setMessageBox({ type: 'error', message: 'Firebase is not configured correctly. Some features may not work. Please ensure REACT_APP_APP_ID and REACT_APP_FIREBASE_CONFIG environment variables are set in Cloudflare Workers settings.' });
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
          <Link to="/" className={`${themeClasses.headerHover} transition-colors duration-300`}>PC SHIVAN</Link>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-lg font-inter">
          <Link to="/" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Home</Link>
          <Link to="/about" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>About</Link>
          <Link to="/music" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Music</Link>
          <Link to="/merch" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Merch</Link>
          <Link to="/testimonials" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Testimonials</Link>
          <Link to="/contact" className={`${themeClasses.mainText} ${themeClasses.headerHover} transition-colors duration-300 font-semibold transform hover:scale-105`}>Contact</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-20"> {/* Add padding-top to account for fixed header */}
        <Routes>
          <Route path="/" element={<HomePage scrollToSection={() => navigate('/music')} themeClasses={themeClasses} />} />
          <Route path="/about" element={<AboutPage themeClasses={themeClasses} />} />
          <Route path="/music" element={<MusicPage themeClasses={themeClasses} />} />
          <Route path="/merch" element={<MerchPage themeClasses={themeClasses} />} />
          <Route path="/contact" element={<ContactPage openContactModal={openContactModal} themeClasses={themeClasses} />} />
          <Route path="/testimonials" element={<TestimonialsPage userId={userId} db={db} themeClasses={themeClasses} />} />
          {/* Fallback route for 404 - can be a custom component */}
          <Route path="*" element={<h2 className="text-center text-4xl text-red-500 mt-20">404: Page Not Found</h2>} />
        </Routes>
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
