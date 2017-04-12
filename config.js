exports.DATABASE_URL = process.env.DATABASE_URL ||
                      global.DATABASE_URL ||
                      'mongodb://Julie:heartstoeveryone@ds157380.mlab.com:57380/blog_data';
exports.TEST_DATABASE_URL = 'mongodb://Jules:thisismine@ds143030.mlab.com:43030/test_db_jul';
exports.PORT = process.env.PORT || 8080;