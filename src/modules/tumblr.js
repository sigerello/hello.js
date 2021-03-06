const hello = require('../hello.js');

{

	hello.init({

		tumblr: {

			// Ensure that you define an oauth_proxy
			oauth: {
				version: '1.0a',
				auth: 'https://www.tumblr.com/oauth/authorize',
				request: 'https://www.tumblr.com/oauth/request_token',
				token: 'https://www.tumblr.com/oauth/access_token'
			},

			// Set default window height
			login(p) {
				p.options.popup.width = 600;
				p.options.popup.height = 510;
			},

			base: 'https://api.tumblr.com/v2/',

			get: {
				me: 'user/info',
				'me/like': 'user/likes',
				default(p, callback) {
					if (p.path.match(/(^|\/)blog\//)) {
						delete p.query.access_token;
						p.query.api_key = hello.services.tumblr.id;
					}

					callback(p.path);
				}
			},

			post: {
				'me/like'(p, callback) {
					p.path = 'user/like';
					query(p, callback);
				}
			},

			del: {
				'me/like'(p, callback) {
					p.method = 'post';
					p.path = 'user/unlike';
					query(p, callback);
				}
			},

			wrap: {
				me(o) {
					if (o && o.response && o.response.user) {
						o = o.response.user;
					}

					return o;
				},

				'me/like'(o) {
					if (o && o.response && o.response.liked_posts) {
						o.data = o.response.liked_posts;
						delete o.response;
					}

					return o;
				},

				default(o) {

					if (o.response) {
						const r = o.response;
						if (r.posts) {
							o.data = r.posts;
						}
					}

					return o;
				}
			},

			xhr(p) {
				if (p.method !== 'get') {
					return true;
				}

				return false;
			}
		}
	});

	// Converts post parameters to query
	function query(p, callback) {
		if (p.data) {
			extend(p.query, p.data);
			p.data = null;
		}

		callback(p.path);
	}

	function extend(a, b) {
		for (const x in b) {
			if (b.hasOwnProperty(x)) {
				a[x] = b[x];
			}
		}
	}

}