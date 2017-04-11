`use strict`;
// /blog-posts endpoint

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {
  Blog
} = require('./models/models');

router.use(bodyParser.json());

router.get('/', (req, res) => {
  // console.log(req.query);

  const userFilters = {};
  const queryableFields = ['author', 'title'];
  queryableFields.forEach(field => {
    if (req.query[field]) {
      if (field === 'author') {
        let author = req.query[field].split(" ");
        // console.log(author);
        userFilters["author.firstName"] = author[0];
        userFilters["author.lastName"] = author[1];
      } else if(field === 'title') {
        userFilters[field] = req.query[field];
      }
      
    }
  });
  console.log(userFilters);

  Blog

    .find(userFilters)
    .then(blogs => {
      console.log(blogs);

      return res.json({
        blogs: blogs.map((blog) => blog.apiRender())

      });

    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'Internal server error'
      });
    });
});

router.get('/:id', (req, res) => {
  Blog
    .findById(req.params.id)
    .then( blog => res.json(blog.apiRender()))
    .catch( (err) => {
      console.error(err);
      res.status(500).json({message:"Internal server error: No ID match found"});
    });
});

router.post('/', (req, res) => {

  const requiredFields = ['title','author', 'content'];
  const missing = [];
  requiredFields.forEach(function (field) {
    if ( 
      (!(field in req.body)) ) {
      missing.push(field);
    }
  });

  if (missing.length !== 0) {
    const missingMsg = `The ${missing.join(", ")} field(s) are missing.`;
    console.error(missingMsg);
    return res.status(400).send(missingMsg);
  }

  // can blog.create with req.body if it's the same as schema

  Blog
    .create({
      title: req.body.title,
      content: req.body.content,
      author: {
        firstName: req.body.author.firstName,
        lastName: req.body.author.lastName
      }
    })
    .then(
      (blog) => {
        return res.status(201).json(blog.apiRender());
      }
    )
    .catch((err) => {
      console.error(err);
      res.status(500).json({message: "Internal Servor Error"});
    });
});


router.put('/:id', (req,res) => {

  if (!(req.params.id === req.body.id)) {
    const mismatchedId = `
      The Request path id ${req.params.id} and the request body id ${req.body.id} do not match.`;
    console.error(mismatchedId);
    res.status(400).json({message:mismatchedId});

  }

  const fieldsToUpdate= {};
  const possibleFields= ['firstName', 'lastName', 'content', 'title'];

  possibleFields.forEach((field) => {
    if ((field === 'firstName')  || (field === 'lastName') ) {
      fieldsToUpdate[`author.${field}`] = req.body.author[field];
    
    } else if((field === 'content') || (field === 'title') ) {
      fieldsToUpdate[field] = req.body[field];
    }
  });
  console.log(fieldsToUpdate);

  Blog
    .findByIdAndUpdate(req.params.id, {$set: fieldsToUpdate})
    .then( (blog) => {return res.status(201).json({updated: blog}); } )
    .catch( (err) => {
      console.error(err);
      res.status(500).json({message: `Internal server error, couldn't update the item`});
    });

});

router.delete('/:id', (req, res) => {
  Blog
    .findByIdAndRemove(req.params.id)
    .then( (blog) => {
      return res.status(200).json({item_deleted: blog});
    })
    .catch( (err) => {
      console.error(err);
      res.status(500).json({message: "Internal server error, item not found."});
    });
});




module.exports = router;