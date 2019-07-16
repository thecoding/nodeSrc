

'use strict';

const login = require('./login');
const api = require('./api');
const upload = require('./upload');
const download = require('./download');

module.exports =  app => {
  app.use('/admin', login);
  app.use('/api', api);
  app.use('/upload', upload);
  app.use('/download', download);
}


