/*!
 * nodeclub - route.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var sign = require("./modules/sign");
var data = require("./modules/data");


exports = module.exports = function(app) {
  app.get('/test', function(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  });

  app.post('/userlogin', sign.login);
  app.get('/userlogout', sign.signout);
  app.post('/usersignup', sign.signup);

  app.post('/data/getbooks', data.getbooks);
  app.post('/data/addbook', data.addbook);
  app.post('/data/setbook', data.setbook);
  app.post('/data/removebook', data.removebook);
};
