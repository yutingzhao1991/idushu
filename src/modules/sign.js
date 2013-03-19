
var config = require('../config').config;
var crypto = require('crypto');

var check = require('validator').check,
	sanitize = require('validator').sanitize;

var User = require('./db').user;


//sign up
exports.signup = function(req,res,next){
	var method = req.method.toLowerCase();
	if(method == 'get'){
		res.redirect('/signup.html');
		return;
	}
	if(method == 'post'){
		var name = sanitize(req.body.name).trim();
		name = sanitize(name).xss();
		var pass = sanitize(req.body.pass).trim();
		pass = sanitize(pass).xss();

		if(name == '' || pass ==''){
			res.redirect('/signup.html?error=用户名或者密码为空');
			return;
		}

		if(name.length < 5){
			res.redirect('/signup.html?error=用户名过短');
			return;
		}

		User.findOne({ 'username': name },function(err,user){
			if(err) return next(err);
			if(user){
				res.redirect('/signup.html?error=该用户已经存在');
				return;
			}
			// md5 the pass
			pass = md5(pass);

			User.save({
				username: name,
				password: pass
			}, function(err) {
				if (err) {
					console.log(err.toString());
					res.end(err.toString());
				} else {
					res.redirect('/');
				}
			});
		});
	}
};



/**
 * Handle user login.
 * 
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */

exports.login = function(req, res, next) {
	var loginname = sanitize(req.body.name).trim().toLowerCase();
	var pass = sanitize(req.body.pass).trim();
	
	if (!loginname || !pass) {
		return res.redirect('/login.html?error=用户名或者密码为空');
	}

	User.findOne({ 'username': loginname }, function(err, user) {
		if (err) return next(err);
		if (!user) {
			return res.redirect('/login.html?error=该用户不存在');
		}
		pass = md5(pass);
		if (pass !== user.password) {
			return res.redirect('/login.html?error=密码错误');
		}
		// store session cookie
		gen_session(user, res);
    	//just jump to ./index.html page 
		res.redirect('/');
	});
};

// sign out
exports.signout = function(req, res, next) {
	req.session.destroy();
	res.clearCookie(config.auth_cookie_name, { path: '/' });
	res.redirect('/');
};

// auth_user middleware
exports.auth_user = function(req,res,next){
	if(req.session.user){
		return next();
	}else{
		var cookie = req.cookies[config.auth_cookie_name];
		if(!cookie) return next();

		var auth_token = decrypt(cookie, config.session_secret);
		var auth = auth_token.split('\t');
		var user_name = auth[0];
		User.findOne({username:user_name},function(err,user){
			if(err) return next(err);
			if(user){
				req.session.user = user;
				return next();
			}else{
				return next();	
			}
		});	
	}
};

// private
function gen_session(user,res) {
	var auth_token = encrypt(user.username + '\t' + user.password, config.session_secret);
	res.cookie(config.auth_cookie_name, auth_token, {path: '/',maxAge: 1000*60*60*24*7}); //cookie 有效期1周			
}
function encrypt(str,secret) {
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}
function decrypt(str,secret) {
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}
function md5(str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str;
}
function randomString(size) {
	size = size || 6;
	var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';	
	var max_num = code_string.length + 1;
	var new_pass = '';
	while(size>0){
	  new_pass += code_string.charAt(Math.floor(Math.random()* max_num));
	  size--;	
	}
	return new_pass;
}
