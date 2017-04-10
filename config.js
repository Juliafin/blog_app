exports.DATABASE_URL = process.env.DATABASE_URL ||
                      global.DATABASE_URL ||
                      'mongodb://Julie:heartstoeveryone@ds157380.mlab.com:57380/blog_data';

exports.PORT = process.env.PORT || 8080;