digger-reception
================

The main query router for a digger.io network

## usage

The reception server is the abstraction of backend services onto a filesystem just like Linux mounts everything as a file with a path.

The front end is a HTTP REST server.

The back end is a ZeroRPC router.

The router works by 'mounting' services.

Each mount gets it's own binding client on the reception server.

We can then spin up backend servers and connect them to the endpoint allocated for that mount.


```js

var Reception = require('digger-reception');


/*
	server is an express HTTP server - we can use any middleware we want for authentication etc
	it automatically uses:

	 * bodyParser
	 * query
*/
var server = Reception();

// this is the standard connect use function for connect and express middleware
server.use(function(req, res, next){
	// any middleware here
	next();
})


// this lets us alter the pathname of a digger request based on async logic
server.alias(function(pathname, req, callback){
	if(pathname.indexOf('/apples')==0){
		pathname = '/oranges' + (pathname.substr('/apples'.length));
	}
})

// the same as above
server.alias('/apples', '/oranges');

// the same as above with logic
server.alias('/apples', function(pathname, req, callback){
		var user = req.user;
		return user.id;
})



// tell the reception that we have a backend warehouse on a given route
// these routes are assigned after the alises are applied
server.supplychain('/db1');






```