var db = require('../config').config.db;

var user = db.collection("user");
var book = db.collection("book");

exports.user = user;
exports.book = book;