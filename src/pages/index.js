import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

export default () => (
  <StaticQuery
    query={graphql`
      {
        pixabayPhoto {
          previewURL
        }
        swapi {
          allFilms(orderBy: episodeId_ASC) {
            id
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <h1>Star Wars Films</h1>
        <img src={data.pixabayPhoto.previewURL} alt="puppy" />
        {data.swapi.allFilms.map(film => (
          <li key={film.id}>{film.title}</li>
        ))}
      </>
    )}
  />
);
