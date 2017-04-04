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

  it("Should accept a blog post with the required fields on a POST request", function () { 

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

  }); //ends field missing on post test "dtest"

  it('Should update blog posts on PUT requests', function () {  

    const blogPost = {
      "author": "Julia Finarovsky",
      "title": "New tropical theme for vscode",
      "content": `I am someone that really likes clarity and readability. And intersecting with my interest in tweeking my development environment, I decided to make a theme that would be more colorful and have a high contrast. I figured out that I needed to create a Microsoft account and install the publisher module via npm to do it. Finally, the theme is up on the extension marketplace,and I look forward to feedback!"`
    };

    return chai.request(app)
    .get('/blog-posts')
    .then(function (res) { 
      blogPost.id = res.body[res.body.length-1].id;
      
      return chai.request(app)
      .put(`/blog-posts/${blogPost.id}`)
      .send(blogPost)
      .then(function (res) { 
        res.should.have.status(200);
        console.log(res.body)
        res.body.should.be.a('object');
        res.body.updatedPost.should.be.a('object');
        res.body.should.have.keys('updatedPost', 'successMsg');
        res.body.updatedPost.should.include.keys('author', 'title', 'content', 'id');
        res.body.updatedPost.id.should.not.be.null;
        console.log(res.body.updatedPost.id)
        res.body.updatedPost.should.deep.equal(Object.assign(blogPost,
        {id:res.body.updatedPost.id} ));
      });

    });

    

  }); //ends main PUT request test

  it("Should return an error if the ids do not match for the put request ", function () {

    const missingFieldsblogPost = {
      "author": "Julia Finarovsky",
      "title": "Staying up late",
      "content": `So I enjoy staying up late. It's been a life long obsession of mine. To feel like I am in control of my own freedom. And feeling like I am my own person. Although waking up early sucks.`      
    };

    return chai.request(app)
    .get('/blog-posts')
    .then(function (res) { 
      const wrongID = res.body[res.body.length-1].id;
      missingFieldsblogPost.id = res.body[0].id;
      return chai.request(app)
      .put(`/blog-posts/${wrongID}`)
      .send(missingFieldsblogPost)
      .catch(function (err) { 
        err.should.be.a('error');
        err.should.have.status(400);
        err.response.text.should.be.a('string');
        err.response.text.should.contain(wrongID, missingFieldsblogPost.id);
      });

    });

  }); // ends fields not matching


  it("Should delete the appropriate item on a DELETE request", function () {   

    return chai.request(app)
    .get('/blog-posts')
    .then(function (res) {
      console.log(res.body); 

      const idToDelete = res.body[0].id;

      return chai.request(app)
      .delete(`/blog-posts/${idToDelete}`)
      .then(function (res) {  
        res.should.have.status(200);
        res.text.should.be.a('string');
        res.text.should.contain(idToDelete);
        console.log(res.text);
      })

    })  
  })
  
  


}); // close server tests