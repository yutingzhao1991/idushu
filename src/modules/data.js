var Book = require('./db').book;
var User = require('./db').user;

var check = require('validator').check,
	sanitize = require('validator').sanitize;

exports.getbooks = function(req, res, next){
	if(!req.session || !req.session.user){
		res.send(JSON.stringify({
				result: "error",
				errorMessage: "forbidden"
			}));
		return;
	}
	var u = req.session.user; 
	Book.find({
		username: u.username
	}).toArray(function(err, result){
		if(err){
			res.send(JSON.stringify({
				result: "error",
				errorMessage: err
			}));
			return;
		}
		var books = {};
		var item = null;
		for(var i=0; i<result.length; i++){
			item = result[i];
			books[item.id] = {
				id: item.id,
				name: item.name,
				status: item.status,
				createtime: item.createtime
			}
		}
		res.send(JSON.stringify({
			result: "ok",
			content: {
				username: u.username,
				books: books
			}
		}));
	});
}

exports.addbook = function(req, res, next){
	var method = req.method.toLowerCase();
  // post
  if (method == 'post') {
  	if(!req.session || !req.session.user){
		res.send(JSON.stringify({
				result: "error",
				errorMessage: "forbidden"
			}));
		return;
	}
	var u = req.session.user; 
  	var name = sanitize(req.body.name).trim();
  	var status = sanitize(req.body.status).trim();
  	var id = sanitize(req.body.id).trim();
  	var createtime = sanitize(req.body.createtime).trim();
  	//校验
  	//....

  	var saveObj = {
  		id: id,
  		name: name,
  		username: u.username,
  		status: status,
  		createtime: createtime
  	}

  	Book.save(saveObj, function(err){
  		if(err){
  			res.send(JSON.stringify({
				result: "error",
				errorMessage: err
			}));
  		}else{
  			res.send(JSON.stringify({
				result: "ok",
				content: saveObj
			}));
  		}
  	});
  }else{
  	res.send("forbidden");
  }
}

exports.setbook = function(req, res, next){
	if(!req.session || !req.session.user){
		res.send(JSON.stringify({
				result: "error",
				errorMessage: "forbidden"
			}));
		return;
	}
	res.send('ok!');
}

exports.removebook = function(req, res, next){
	if(!req.session || !req.session.user){
		res.send('forbidden!');
		return;
	}
	var id = sanitize(req.body.id).trim();
	var username = req.session.user.username;
	Book.remove({
		id: id,
		username: username
	}, function(err){
		if(err){
			res.send(JSON.stringify({
				result: "error",
				errorMessage: err
			}));
		}else{
  			res.send(JSON.stringify({
				result: "ok"
			}));
  		}
	});
}
