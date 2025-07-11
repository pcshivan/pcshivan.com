import React from 'react';
import SectionWrapper from '../components/SectionWrapper';

const MerchPage = ({ themeClasses }) => {
  const merchItems = [
    {
      id: 'm1',
      name: 'PC Shivan T-Shirt',
      price: '$29.99',
      imageUrl: './images/merch/t-shirt-design.png', // Updated image path
      buyLink: '#',
    },
    {
      id: 'm2',
      name: 'Signature Hoodie',
      price: '$59.99',
      imageUrl: './images/merch/signature-hoodie-front.jpg', // Updated image path
      buyLink: '#',
    },
    {
      id: 'm3',
      name: 'Limited Edition Vinyl',
      price: '$39.99',
      imageUrl: './images/merch/limited-edition-vinyl.jpg', // Updated image path
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

export default MerchPage;
