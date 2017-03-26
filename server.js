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

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on port:  ${process.env.PORT || 8080}` );
});
