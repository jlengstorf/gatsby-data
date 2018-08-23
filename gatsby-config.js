require('babel-polyfill');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-pixabay',
      options: {
        key: process.env.PIXABAY_API_KEY,
        q: 'puppies'
      }
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        typeName: 'SWAPI',
        fieldName: 'swapi',
        url: 'https://api.graphcms.com/simple/v1/swapi'
      }
    }
  ]
};
