const mongoose = require('mongoose');

const blogSchema = mongoose.Schema( {
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  }
});

blogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`;
});

blogSchema.methods.apiRender = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName
  };
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = {Blog};