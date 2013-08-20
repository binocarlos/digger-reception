/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

/*

  processor contains:

    * router - the function that maps the request before the suppliers are matched

    * security - the function that maps the request after the suppliers are matched
  
*/
module.exports = function(routes, processor){

  routes = routes || {};

  function match_route(url){
    if(url.charAt(0)==='/'){
      url = url.substr(1);
    }
    var parts = url.split('/');
    var usepath = [parts.shift()];
    while(parts.length>0 && !routes['/' + usepath.join('/')]){
      usepath.push(parts.shift());
    }
    var finalroute = '/' + usepath.join('/');
    var fn = routes[finalroute];
    if(!fn){
      return null;
    }
    else{
      return {
        route:finalroute,
        fn:fn
      }  
    }
  }

  function router(req, reply){

    function runroute(){
      var route = match_route(req.url);
      if(!route){
        reply(404 + ':no route found for: ' + req.url);
        return;
      }

      req.headers['x-supplier-route'] = route.route;
      router.emit('request', req);
      req.url = req.url.substr(route.route.length);
      route.fn(req, reply);
    }

    if(processor){
      processor(req, reply, runroute);
    }
    else{
      runroute();
    }
    
  }

  router.add = function(route, fn){
    routes[route] = fn;
  }

  for(var prop in EventEmitter.prototype){
    router[prop] = EventEmitter.prototype[prop];
  }

  return router;
}