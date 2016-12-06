module.exports = function (db) {

	return {
		requireAuthentication: function(req,res,next) {//Next is for middleware
			var token = req.get('Auth');

			db.user.findByToken(token).then (function (user) {
				req.user = user;
				next();
			}, function () {
				res.status(401).send();
			});
		}
	}
}