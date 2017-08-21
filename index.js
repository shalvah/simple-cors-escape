let request = require('request');
const http = require("http");
const url = require("url");
const port = process.env.PORT || 2000;

let getPostData = request => {
	return new Promise((resolve, reject) => {
		let post = '';
		if (request.method === 'POST') {
			let body = '';
			request.on('data', data => {
				body += data;
			});

			request.on('end', () => {
				post = JSON.parse(body);
				resolve(post);
			});
		}
	});
};


http.createServer(function (req, res) {
	console.log("Server running on port " + port);
	console.log(`Reuest to: ${req.url}`);
	let query = url.parse(req.url, true).query;

	getPostData(req)
		.then(body => {
			console.log(body);
			let options = {
				uri: query.url,
				headers: body.headers,
				method: body.method || 'GET'
			};

			let proxyCallback = (proxyErr, proxyRes, proxyBody) => {
				if (proxyErr) {
					console.log(proxyErr);
					res.statusCode = 500;
					res.write(proxyErr);
				} else {
					res.writeHead(proxyRes.statusCode, proxyRes.headers);
					res.write(proxyBody);
				}
				res.end();
			};
			request(options, proxyCallback);
		})
}).listen(port);