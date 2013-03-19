/**
 * 配置项
 **/
var mongo = require("mongoskin");
var db_url = exports.db_url = "Y3OUFapNY6rS:aLiiXpVB23@127.0.0.1:20088/PrZTlC6C6hEl";
exports.config = {
    port: 80,
    session_secret: "woaidushu-ilovereading-yutingzhao",
    db: mongo.db(db_url),
    auth_cookie_name: 'idushu'
};
