/*!
 * nodeclub - app.js
 */

/**
 * Module dependencies.
 */

var path = require('path');
var express = require('express');
var config = require('./config').config;
var routes = require('./routes');

var app = express.createServer();

// 定义共享环境
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.session_secret,
	}));
	app.use(require('./modules/sign').auth_user);
});
// 定义开发环境
app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
// 定义生产环境
app.configure('production', function(){
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
});

// routes
routes(app);
app.listen(config.port);

console.log("app start at port:"+config.port);
