const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


// begin tests

describe('Blogging App', function () { 


before(function () { 
  return runServer();
 });


after(function () {
  return closeServer();
});

 
      
  const blogFields = ['author', 'content', 'title', 'id'];
  
  it('Should get a list of blog posts on a GET request', function () { 
    return chai.request(app)
    .get('/blog-posts')
    .then(function (res) { 
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.length.should.be.at.least(1);


      res.body.forEach(function(field) {

        field.should.be.a('object');
        field.should.include.keys(blogFields) 
      });
    });
  }); // close normal GET request tests

  it("Should accept a blog post with the required fields", function () { 

    const sampleBlogPost = {
      "author": "Julia Finarovsky",
      "title": "Unwanted phone calls",
      "content": `So I just received another spam phone call as I was working on this project. And I told the representative Richard that I will be reporting his company to the do not call registry. It's ridiculous that we can get interupted in the morning and that companies break the law like this. It's absolutely unacceptable`
    };
    return chai.request(app)
    .post('/blog-posts')
    .send(sampleBlogPost)
    .then(function (res) { 
      // console.log('This is the response from the server for Post:', res.body)
      res.should.have.status(201);
      res.body.should.be.a('object');
      res.body.should.not.be.empty;
      res.body.should.have.all.keys('content', 'author', 'title', 'id', 'publishDate');
      res.body.id.should.not.be.null;
      
    })

  }) // ends regular POST test


  it("Should return an error message with the appropriate error if there is a field missing in the POST object", function () { 
    const missingFieldBlogPost = {
      "author": "Julia Finarovsky",
      "content": `I'm enjoying coding so much that I intentionally forgot to leave out the title.`
    };

    return chai.request(app)
    .post('/blog-posts')
    .send(missingFieldBlogPost)
    .catch(function (err) { 
      // console.log(err.response.body);
      err.should.have.status(400);
      err.should.be.a('Error');
      err.response.body.should.not.be.empty;
      err.response.body.should.be.a('object');
      err.response.body.should.include.keys('missing_fields');
    });

  });


}); // close server tests