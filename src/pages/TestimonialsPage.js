import React, { useState, useEffect } from 'react';
import SectionWrapper from '../components/SectionWrapper';
import MessageBox from '../components/MessageBox';
import { collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';


const TestimonialsPage = ({ userId, db, themeClasses }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(null); // { type: 'success' | 'error', message: string }

  // Ensure appId is available (from App.js context or passed down)
  // For this component, we assume appId is passed from App.js if not global.
  // Since App.js passes it implicitly, let's ensure it's accessible here if needed.
  // For simplicity, we'll assume appId is accessible via the global scope or passed down through props if it's not global.
  // Given the structure, it's implicitly available via `db` and `appId` in the outer scope of App.js.
  // However, for modularity, it's better to pass it down or access it from a context.
  // For now, let's assume `appId` is available in this scope, as it's defined at the top of App.js.
  const currentAppId = typeof __app_id !== 'undefined' ? __app_id : (process.env.REACT_APP_APP_ID || 'default-app-id-deployed');


  useEffect(() => {
    if (!db) {
      console.error("Firestore is not initialized.");
      return;
    }

    const testimonialsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/testimonials`);
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
  }, [db, currentAppId]); // Depend on db and currentAppId


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
      await addDoc(collection(db, `artifacts/${currentAppId}/public/data/testimonials`), {
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

export default TestimonialsPage;
