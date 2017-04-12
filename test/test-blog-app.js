const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const errorconsole = require('debug')('Error');
const dataconsole = require('debug')('Data'); 
const {app, runServer, closeServer} = require('../server');
const faker = require('faker');
const should = chai.should();
const {TEST_DATABASE_URL} = require('../config');
const {Blog} = require('../models/models');

chai.use(chaiHttp);
mongoose.Promise = global.Promise;

function generateFakeBlogs(numberOfBlogs) {
  const seedData = [];
  let fakeBlog;
  for (let i = 0; i < numberOfBlogs; i++) {
    fakeBlog = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      }
    // seed data pushed into array
    };

  }
    if (numberOfBlogs === 1) {
      return fakeBlog;
    } else {

      seedData.push(fakeBlog);
    }
  // dataconsole("%O", seedData);
  return seedData;

}

function seedBlogDb(blogArr) {
    // returns a promise
  return Blog.insertMany(blogArr);
}


function dismantleDB() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

// begin tests

describe('Blogging App endpoints', function () {


  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedBlogDb(generateFakeBlogs(19));
  });

  afterEach(function () {
    return dismantleDB();
  });

  after(function () {
    return closeServer();
  });


  describe('GET endpoint:', function () {

    it('should return all existing blogs', function () {

      let res;

      return chai.request(app)

      .get('/blog-posts')
      .then(function(_res) {

        res = _res;
        // debug(_res.body);

        res.should.have.status(200);
        res.body.blogs.should.have.length.of.at.least(1);
        
        return Blog.count();
      })
      .then(function (count) {
        res.body.blogs.should.have.length.of(count);
      })
      .catch( (err) => errorconsole(err));
      
    });

  });


  it('Should return blogs with the right fields', function() {

    let resBlog;
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.blogs.should.have.length.of.at.least(1);
      
      res.body.blogs.forEach(function(blog) {
        blog.should.be.a('object');
        blog.should.include.keys(
          'id', 'title', 'content', 'author');

      });
      // dataconsole(res.body);

      resBlog = res.body.blogs[0];
      return Blog.findById(resBlog.id);
    })
    .then(function(blog){
      // console.log(typeof(resBlog._id))
      // console.log(typeof(blog._id))

      resBlog.id.should.equal(blog.id);
      resBlog.content.should.equal(blog.content);
      resBlog.title.should.equal(blog.title);
      // dataconsole(resBlog);
      // dataconsole(blog)
      resBlog.author.should.contain(blog.author.firstName);
      resBlog.author.should.contain(blog.author.lastName);
      
    });
  });


  describe('POST endpoint:', function () {

    it('should add a new blog on posting', function () {
      
      const fakeBlog = generateFakeBlogs(1);
      // dataconsole(fakeBlog);
      return chai.request(app)
        .post('/blog-posts')
        .send(fakeBlog)
        .then(function (res) {
          
          // tests the post response
          // dataconsole(res.body);
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'content', 'title', 'author');
          
          res.body.should.not.be.null;
          res.body.content.should.equal(fakeBlog.content);
          res.body.title.should.equal(fakeBlog.title);

          return Blog.findById(res.body.id);
        })
        // test the database that it actually contains the posted object
        .then(function (blog) { 
          dataconsole(blog);
          blog.title.should.equal(fakeBlog.title);
          blog.content.should.equal(fakeBlog.content);
          blog.author.firstName.should.equal(fakeBlog.author.firstName);
          blog.author.lastName.should.equal(fakeBlog.author.lastName);
        })
      .catch((err) => {errorconsole(err)});
                
    });
  });


  describe('PUT endpoint:', function () {

    it('Should update blog fields sent via PUT', function () {
    
      const updatedBlog = {
        author: {
          firstName: "Julia",
          lastName: "Finarovsky"
        },
        title: "It's really really late but I have to finish this."
      };

      return Blog
      .findOne()
      .then(function (blog) {
        updatedBlog.id = blog.id;

        return chai.request(app)
        .put(`/blog-posts/${updatedBlog.id}`)
        .send(updatedBlog);
      })
      .then(function (res) {
        res.should.have.status(201);

        return Blog.findById(updatedBlog.id);
      })
      .then(function(blog){
        // dataconsole(blog);
        blog.title.should.equal(updatedBlog.title);
        blog.author.firstName.should.equal(updatedBlog.author.firstName);
        blog.author.lastName.should.equal(updatedBlog.author.lastName);
      })
      .catch((err) => {errorconsole(err)});
    });
  });


  describe('DELETE endpoint:', function () {

    it('Should delete a restaurant by ID', function () {

      let deletedBlog;

      return Blog

        .findOne()
        .then(function(_blog){
          deletedBlog = _blog;
          return chai.request(app)
          .delete(`/blog-posts/${_blog.id}`);
        })
        .then(function (res) {
          res.should.have.status(200);
          // dataconsole(res);
          res.body.item_deleted._id.should.equal(deletedBlog.id);

          return Blog.findById(deletedBlog.id);
        })
        .then(function (_blog) {
          should.not.exist(_blog);
        })
      .catch((err) => {errorconsole(err)});
        
    });
  });
}); // close server tests

