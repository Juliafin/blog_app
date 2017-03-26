`use strict`;

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


router.get('/', (req, res) => {
  res.status(200).json(BlogPosts.get());
});

module.exports = router;
