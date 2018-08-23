# Using Data in Gatsby

This is a four-part demo:

1. How to load data using a source plugin
2. How to load data using GraphQL schema stitching
3. How to access data using `StaticQuery`
4. How to access contextual data using page queries

## 1. Load data using a source plugin

First, let’s load some images of puppies from Pixabay.

```shell
# install the source plugin
npm install --save gatsby-source-pixabay babel-polyfill
```

Create `gatsby-config.js` and configure the plugin:

```js
require('babel-polyfill');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-pixabay',
      options: {
        key: process.env.PIXABAY_API_KEY,
        q: 'puppies'
      }
    }
  ]
};
```

Get your API key [from Pixabay](https://pixabay.com/api/docs/), then run:

```shell
PIXABAY_API_KEY=<your_api_key> npm run develop
```

In GraphiQL, we can now get a list of puppy pics!

```graphql
query {
  allPixabayPhoto {
    edges {
      node {
        webformatURL
      }
    }
  }
}
```

## 2. Load data using GraphQL schema stitching

Next, let’s add data by schema stitching the Star Wars API from GraphCMS into our site.

```shell
# install the plugin
npm install --save gatsby-source-graphql@next
```

Add it to our `gatsby-config.js`:

```diff
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
+     {
+       resolve: 'gatsby-source-graphql',
+       options: {
+         typeName: 'SWAPI',
+         fieldName: 'swapi',
+         url: 'https://api.graphcms.com/simple/v1/swapi'
+       }
+     }
    ]
  };
```

Start the develop server again:

```shell
PIXABAY_API_KEY=<your_api_key> npm run develop
```

Open `http://localhost:8000/___graphql` and query the SWAPI:

```diff
  {
+   swapi {
+     allFilms {
+       title
+     }
+   }
    allPixabayPhoto {
      edges {
        node {
          webformatURL
        }
      }
    }
  }
```

## 3. Display data using StaticQuery

Next, we want to show some data on the page. Let’s get a list of all the _Star Wars_ films in episode order. And also a picture of a puppy, because puppies are the best.

This query will return the same result no matter where it’s loaded — meaning no GraphQL query variables are required — so we can use `StaticQuery` to perform the query.

Open `src/pages/index.js` and edit it to contain the following:

```js
import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

export default () => (
  <StaticQuery
    query={graphql`
      {
        pixabayPhoto {
          webformatURL
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
        <img src={data.pixabayPhoto.webformatURL} alt="puppy" />
        {data.swapi.allFilms.map(film => (
          <li key={film.id}>{film.title}</li>
        ))}
      </>
    )}
  />
);
```

Save the file and run:

```shell
PIXABAY_API_KEY=<your_api_key> npm run develop
```

Visit `https://localhost:8000` and you should see a puppy and a list of _Star Wars_ movie titles.

## 4. Display data using context and page queries

In cases where the result of the query will change depending on which page is loaded, for example, when showing blog posts or — in this case — details about a _Star Wars_ movie, we can’t use `StaticQuery`.

Instead, we need to use a page query and provide GraphQL variables via Gatsby’s `createPage` API and `context` option.

To create this, let’s start by dynamically creating a page for each _Star Wars_ movie.

Create `gatsby-node.js` in the project root and add the following inside:

```js
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
```

Note that we’re passing `title` to the `context` option. This allows us to use it as a GraphQL variable in page queries.

Next, let’s create `src/templates/film.js` and add the following:

```js
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
```

Note the use of `$title`, which uses the `title` value from the `context` option we set in `gatsby-node.js`. This allows us to query for details about a specific film for its detail page.

Save the file and run:

```shell
PIXABAY_API_KEY=<your_api_key> npm run develop
```

Visit `https://localhost:8000/the-force-awakens` and you’ll see the title and director for _The Force Awakens_.
