/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

// Ensure these global variables are defined in the Canvas environment
// ESLint is now aware of these globals due to the comment above.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
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
  <section id={id} className="relative py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-gray-900 to-black text-white min-h-screen flex flex-col justify-center items-center overflow-hidden">
    {/* Subtle geometric background pattern for layering and depth */}
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
    <h2 className="relative z-10 text-5xl md:text-6xl font-extrabold mb-12 text-center text-purple-400 drop-shadow-lg font-cinzel tracking-wide animate-fade-in-up-slow">
      {title}
    </h2>
    <div className="relative z-10 max-w-6xl w-full">
      {children}
    </div>
  </section>
);

// Modal component for contact forms with improved animations
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-xl p-8 max-w-lg w-full relative shadow-2xl border border-purple-600 animate-scale-in">
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
const MessageBox = ({ message, type, onClose }) => {
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

// --- Page Components ---

const HomePage = ({ scrollToSection }) => (
  <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://placehold.co/1920x1080/1a1a2e/e0b0ff?text=PC+SHIVAN+MUSIC')" }}>
    {/* Dynamic background overlay for artistic effect with subtle pulse */}
    <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/50 to-black opacity-80 animate-pulse-subtle"></div>
    <div className="relative z-10 text-center text-white p-8 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 shadow-2xl border border-purple-700 max-w-4xl mx-4 transform animate-fade-in-up-hero">
      <h1 className="text-6xl md:text-8xl font-extrabold mb-4 leading-tight drop-shadow-lg font-cinzel tracking-wider">
        PC SHIVAN
      </h1>
      <p className="text-2xl md:text-3xl font-light text-purple-300 mb-8 font-inter italic">
        Innovative Music Composer | Artist | Visionary
      </p>
      <button
        onClick={() => scrollToSection('music')}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl border border-purple-400 cursor-pointer"
      >
        Explore My Music
      </button>
    </div>
  </section>
);

const AboutPage = () => (
  <SectionWrapper id="about" title="About PC Shivan">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center animate-fade-in-left-slow">
        <img
          src="https://placehold.co/500x500/333333/e0b0ff?text=PC+Shivan+Portrait"
          alt="PC Shivan Portrait"
          className="rounded-full shadow-2xl border-4 border-purple-600 object-cover w-64 h-64 md:w-80 md:h-80 transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="text-lg leading-relaxed text-gray-300 animate-fade-in-right-slow">
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

const MusicPage = () => {
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
    <SectionWrapper id="music" title="My Music">
      <div className="text-center mb-12 animate-fade-in-up-slow">
        <p className="text-xl text-gray-300 mb-6">
          Dive into my latest compositions and explore my diverse musical universe.
        </p>
        <a
          href="https://open.spotify.com/artist/pcshivanofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg border border-green-300 cursor-pointer"
        >
          <i className="fab fa-spotify mr-2"></i> Listen on Spotify
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {musicTracks.map((track, index) => (
          <div key={track.id} className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 border border-purple-700 group animate-fade-in-item" style={{ animationDelay: `${index * 0.15}s` }}>
            <img
              src={track.imageUrl}
              alt={track.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="p-6">
              <h3 className="text-3xl font-bold text-purple-400 mb-2 font-cinzel">{track.title}</h3>
              <p className="text-gray-400 text-lg mb-4 font-inter">{track.artist} - {track.genre}</p>
              {track.spotifyEmbed && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
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
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-md cursor-pointer"
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

const MerchPage = () => {
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
    <SectionWrapper id="merch" title="Merchandise">
      <p className="text-xl text-gray-300 text-center mb-12 animate-fade-in-up-slow">
        Show your support and grab some exclusive PC Shivan merchandise!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {merchItems.map((item, index) => (
          <div key={item.id} className="bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 border border-purple-700 group animate-fade-in-item" style={{ animationDelay: `${index * 0.15}s` }}>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="p-6 text-center">
              <h3 className="text-3xl font-bold text-purple-400 mb-2 font-cinzel">{item.name}</h3>
              <p className="text-gray-300 text-2xl mb-4 font-inter">{item.price}</p>
              <a
                href={item.buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-md cursor-pointer"
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

const ContactPage = ({ openContactModal }) => (
  <SectionWrapper id="contact" title="Contact Me">
    <p className="text-xl text-gray-300 text-center mb-12 animate-fade-in-up-slow">
      Whether you're a fan, a producer, a director, or a corporate entity, I'd love to hear from you.
      Please select the most relevant option below.
    </p>
    <div className="flex flex-wrap justify-center gap-6">
      <button
        onClick={() => openContactModal('general')}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border border-purple-400 animate-fade-in-up-slow"
        style={{ animationDelay: '0.1s' }}
      >
        <i className="fas fa-envelope mr-3"></i> General Inquiry
      </button>
      <button
        onClick={() => openContactModal('producer-director')}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border border-purple-400 animate-fade-in-up-slow"
        style={{ animationDelay: '0.2s' }}
      >
        <i className="fas fa-microphone-alt mr-3"></i> Producers & Directors
      </button>
      <button
        onClick={() => openContactModal('corporate')}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto border border-purple-400 animate-fade-in-up-slow"
        style={{ animationDelay: '0.3s' }}
      >
        <i className="fas fa-building mr-3"></i> Corporate & Licensing
      </button>
    </div>
  </SectionWrapper>
);

const TestimonialsPage = ({ userId, db }) => {
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
    // Removed orderBy('timestamp', 'desc') to avoid potential index issues on initial deployment.
    // Data will be sorted in memory.
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

  const getRandomBgColor = () => {
    const colors = ['bg-purple-800', 'bg-indigo-800', 'bg-blue-800', 'bg-pink-800'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <SectionWrapper id="testimonials" title="Fan Love & Testimonials">
      <p className="text-xl text-gray-300 text-center mb-12 animate-fade-in-up-slow">
        Your words inspire me! Share your thoughts and become a part of the PC Shivan community.
      </p>

      <form onSubmit={handleSubmitTestimonial} className="bg-gray-800 p-8 rounded-xl shadow-xl mb-12 border border-purple-700 max-w-2xl mx-auto animate-fade-in-up-slow">
        <h3 className="text-3xl font-bold text-purple-400 mb-6 text-center font-cinzel">Leave a Testimonial</h3>
        <div className="mb-6">
          <label htmlFor="name" className="block text-gray-300 text-lg font-bold mb-2">Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
            required
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-300 text-lg font-bold mb-2">Your Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 resize-y transition-colors duration-200"
            required
            placeholder="Share your experience or thoughts..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-purple-400 cursor-pointer"
        >
          Submit Testimonial
        </button>
      </form>

      <MessageBox
        message={showSubmissionMessage?.message}
        type={showSubmissionMessage?.type}
        onClose={() => setShowSubmissionMessage(null)}
      />

      {testimonials.length === 0 ? (
        <p className="text-center text-gray-400 text-xl">No testimonials yet. Be the first to leave one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`p-6 rounded-xl shadow-xl transform ${getRandomRotation()} ${getRandomBgColor()} text-white border border-gray-700 animate-fade-in-item`}
              style={{ minHeight: '200px', animationDelay: `${index * 0.15}s` }}
            >
              <p className="text-lg italic mb-4 font-inter">"{testimonial.message}"</p>
              <p className="text-right text-purple-200 font-semibold font-inter">- {testimonial.name}</p>
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

  // Firebase Auth and DB Initialization
  useEffect(() => {
    const initializeFirebase = async () => {
      if (!auth || !db) {
        setMessageBox({ type: 'error', message: 'Firebase is not configured correctly. Some features may not work.' });
        console.error("Firebase Auth or DB is not initialized. Check firebaseConfig and global variables.");
        return;
      }

      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
          console.log("Signed in with custom token.");
        } else {
          await signInAnonymously(auth);
          console.log("Signed in anonymously.");
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
        setMessageBox({ type: 'error', message: `Authentication failed: ${error.message}` });
      }
    };

    initializeFirebase();
  }, []); // Run only once on component mount

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
    <div className="min-h-screen bg-gray-950 font-inter">
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
        `}
      </style>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 z-40 shadow-lg py-4 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center backdrop-blur-sm">
        <div className="text-white text-3xl font-extrabold tracking-wider mb-4 md:mb-0 font-cinzel">
          {/* Changed href from "#" to "/" for better accessibility and semantic correctness */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="hover:text-purple-400 transition-colors duration-300">PC SHIVAN</a>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-lg font-inter">
          <button onClick={() => navigate('home')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">Home</button>
          <button onClick={() => navigate('about')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">About</button>
          <button onClick={() => navigate('music')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">Music</button>
          <button onClick={() => navigate('merch')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">Merch</button>
          <button onClick={() => navigate('testimonials')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">Testimonials</button>
          <button onClick={() => navigate('contact')} className="text-gray-300 hover:text-purple-400 transition-colors duration-300 font-semibold transform hover:scale-105">Contact</button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-20"> {/* Add padding-top to account for fixed header */}
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage scrollToSection={scrollToSection} />;
            case 'about':
              return <AboutPage />;
            case 'music':
              return <MusicPage />;
            case 'merch':
              return <MerchPage />;
            case 'contact':
              return <ContactPage openContactModal={openContactModal} />;
            case 'testimonials':
              return <TestimonialsPage userId={userId} db={db} />;
            default:
              return <HomePage scrollToSection={scrollToSection} />;
          }
        })()}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-950 to-gray-900 py-10 px-4 md:px-8 lg:px-16 text-center text-gray-400 border-t border-purple-800">
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
      <Modal isOpen={showContactModal} onClose={closeContactModal}>
        <h3 className="text-3xl font-bold text-purple-400 mb-6 text-center font-cinzel">
          {getContactSubject(contactFormType)}
        </h3>
        <form onSubmit={handleContactSubmit}>
          <div className="mb-4">
            <label htmlFor="contact-name" className="block text-gray-300 text-lg font-bold mb-2">Your Name:</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contact-email" className="block text-gray-300 text-lg font-bold mb-2">Your Email:</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contact-subject" className="block text-gray-300 text-lg font-bold mb-2">Subject:</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              value={getContactSubject(contactFormType)}
              readOnly
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 cursor-not-allowed"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="contact-message" className="block text-gray-300 text-lg font-bold mb-2">Message:</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 resize-y transition-colors duration-200"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
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
      />
    </div>
  );
};

export default App;
