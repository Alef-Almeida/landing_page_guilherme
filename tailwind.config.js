/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './script.js', './contact.js'],
  theme: {
    extend: {
      colors: {
        ink: '#17324D',
        sky: '#DDECF5',
        peach: '#F5B79C',
        sand: '#F8F5F1',
        mist: '#EEF6F8',
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 70px rgba(23,50,77,.10)',
      },
    },
  },
};
