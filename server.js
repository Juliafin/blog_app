`use strict`;

const express = require('express');
const morgan = require('morgan');

const app = express();

const blog_posts_router = require('./blog_posts_router');

app.use(morgan('combined'));
app.use(express.static('clientview'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/clientview/index.html');
});

app.use('/blog-posts', blog_posts_router);


// add server functions to export for tests
let server;

function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise( (resolve,reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);

    }).on('error', err => {
      reject(err);
    });
  });
}

function closeServer() {
  return new Promise( (resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      } 
      resolve();
    });
  }); 
}

if(require.main === module) {
  runServer()
  .catch( err => {console.error(`There was an error: ${err}`);
  });
};


module.exports = {app, runServer, closeServer};
