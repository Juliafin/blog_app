`use strict`;
// /blog-posts endpoint

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models/blog_posts');

console.log(BlogPosts.create);
BlogPosts.create(
  'Neither awake nor Asleep',
  `After not receiving enough sleep, I spent the day trying to survive. I even found myself drifting sometimes, in that state between asleep and awake. Waking up early in the morning, I headed for my doctor's appointment early in the morning. When I got there, I waited about 15 minutes before the secretary asked me, "Do you have any appointment?". I responded with, "Yes". She then proceeds to double check my appointment in her computer system before realizing that my appointment is in fact next week. I thought I was losing my mind!`,
'Julia Finarovsky'),

BlogPosts.create(
  'Working on the Blog app',
  `There have been a lot of challenges related to coding this app. One of them is implementing modularization of http protocols. Currently testing some advanced features.`,
  'Julia Finarovsky'
);

// invoke jsonParser on all the protocols as middleware
router.use(jsonParser);

router.get('/', (req, res) => {
  return res.status(200).json(BlogPosts.get());
});

router.post('/', (req, res) => {
  const blogFields = ['author', 'content', 'title'];
  // console.log('this is the req.body:', req.body);
  const errors = [];
  blogFields.forEach( (blogfield) => {
    if (!(blogfield in req.body)) {
      errors.push(blogfield)
    }
  });
  const error = {missing_fields: errors};
  if (errors.length) {
    return res.status(400).json(error);
  }
  const addedBlogPost = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  // console.log("This is the added blog post before it it's sent back: ",addedBlogPost);
  return res.status(201).json(addedBlogPost);
});


router.delete('/:id', (req, res) => {
  const id = req.params.id;
  BlogPosts.delete(id);
  console.log(id);
  res.send(`The id entered if found, ${id} will be deleted`).end();
});

router.put('/:id', (req, res) => {
  const blogFields = ['author', 'content', 'title'];
  const errors = [];
  blogFields.forEach( (blogfield) => {
    // check that the appropriate fields are in the request
    if (!(blogfield in req.body)) {
      errors.push(blogfield);
      console.log(`The field ${blogfield} was missing from your request`);
    }
    if (!(errors)) { 
      const errorObj = {"Missing_fields": `${errors}`}
      return res.status(400).json({errorObj});
    }
  });

    // check that the ids match
  if (req.params.id !== req.body.id) {
    const error = `The path id ${req.params.id} and the body id ${req.body.id} do not match`;
    return res.status(400).json({error});
  }

  const successMsg = `Updating the blog entry`;
  const updatedPost = {
    id: req.params.id,
    author: req.body.author,
    content: req.body.content,
    title: req.body.title
  };
  console.log(successMsg);
  BlogPosts.update(updatedPost);
  return res.status(200).json({successMsg, updatedPost});

});

module.exports = router;
