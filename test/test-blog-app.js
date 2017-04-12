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

function seedBlogDb(numberOfBlogs) {
  const seedData = [];

  for (let i = 0; i <= numberOfBlogs; i++) {
    const fakeBlog = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      }
    // seed data pushed into array
    };
    seedData.push(fakeBlog);

  }
    // returns a promise
  // dataconsole("%O", seedData);
  return Blog.insertMany(seedData);
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
    return seedBlogDb(20);
  })

  afterEach(function () {
    return dismantleDB();
  })

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
      res.should.have.status(200)
      res.should.be.json;
      res.body.blogs.should.have.length.of.at.least(1);
      
      res.body.blogs.forEach(function(blog) {
        blog.should.be.a('object');
        blog.should.include.keys(
          'id', 'title', 'content', 'author');

      });
      // dataconsole(res.body);

      resBlog = res.body.blogs[0].apiRender();
      return Blog.findById(resBlog.id)
    })
    .then(function(blog){
      // console.log(typeof(resBlog._id))
      // console.log(typeof(blog._id))
      blog = Blog.apiRender();
      resBlog.id.should.equal(blog.id);
      resBlog.content.should.equal(blog.content);
      resBlog.title.should.equal(blog.title);
      dataconsole(resBlog);
      dataconsole(blog)
      // resBlog.author.should.equal(blog.author);
      


    })


  

  })




}); // close server tests