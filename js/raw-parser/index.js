var getBody = require('raw-body');

exports = module.exports = raw;

function raw(options){
	options = options || {};
	var trim = options.trim !== false;

	return function parser(req, res, next) {
		if (req._body) return next();
		req.body = req.body || {};

		// flag as parsed
		req._body = true;

		// parse
		getBody(req, {
			limit: options.limit || '100kb',
			length: req.headers['content-length'],
			encoding: 'utf8'
		}, function (err, buf) {
			if (err) return next(err);
			
			req.body._raw = trim?buf.trim():buf;
			
			next();
		});
	};
}