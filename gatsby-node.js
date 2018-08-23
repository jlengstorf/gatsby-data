exports.createPages = ({ graphql, actions: { createPage } }) =>
  new Promise((resolve, reject) => {
    resolve(
      graphql(`
        {
          swapi {
            allFilms {
              title
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        result.data.swapi.allFilms.forEach(film => {
          createPage({
            path: film.title.toLowerCase().replace(/\s+/g, '-'),
            component: require.resolve('./src/templates/film.js'),
            context: {
              title: film.title
            }
          });
        });
      })
    );
  });
