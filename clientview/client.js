

function initialBlogPosts() {
  $.getJSON('/blog-posts', function(blogPosts) {
    console.log(blogPosts);

    blogPosts.forEach(function(blog_entry){
      var blogTemplate = `
      <article class="blog-entry">
        <h2 class="blog-title">${blog_entry.title}</h2>
        <p class="blog-content">${blog_entry.content}</p>
        <address class="author">~${blog_entry.author}</address>
      </article>`;
      console.log(blog_entry);
      $('.blog-container').append(blogTemplate);
      console.log ('blog entry appended');
    });
  });
}

initialBlogPosts();
