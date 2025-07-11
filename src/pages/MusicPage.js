import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import SocialIcon from '../components/SocialIcon'; // Ensure SocialIcon is imported if needed

const MusicPage = ({ themeClasses }) => {
  const musicTracks = [
    {
      id: '1',
      title: 'Echoes of Tomorrow',
      artist: 'PC Shivan',
      genre: 'Electronic, Cinematic',
      imageUrl: './images/music/echoes-of-tomorrow-cover.jpg', // Updated image path
      spotifyEmbed: 'https://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6?utm_source=generator', // Example Spotify embed
      buyLink: '#', // Placeholder for actual sales link
    },
    {
      id: '2',
      title: 'Urban Pulse',
      artist: 'PC Shivan',
      genre: 'Hip Hop, Fusion',
      imageUrl: './images/music/urban-pulse-cover.png', // Updated image path
      spotifyEmbed: 'https://open.spotify.com/embed/track/4WqB9o4u1z0r9Y1D2B9Y1D?utm_source=generator', // Example Spotify embed
      buyLink: '#',
    },
    {
      id: '3',
      title: 'Serene Depths',
      artist: 'PC Shivan',
      genre: 'Ambient, Orchestral',
      imageUrl: './images/music/serene-depths-cover.jpg', // Updated image path
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
                <div className="mb-4 rounded-lg overflow-hidden border ${themeClasses.inputBorder}">
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

export default MusicPage;
