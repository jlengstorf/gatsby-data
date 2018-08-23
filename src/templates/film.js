import React from 'react';
import { graphql } from 'gatsby';

export const query = graphql`
  query($title: String!) {
    swapi {
      Film(title: $title) {
        title
        director
      }
    }
  }
`;

export default ({ data }) => (
  <>
    <h1>{data.swapi.Film.title}</h1>
    <p>Directed by {data.swapi.Film.director}</p>
  </>
);
