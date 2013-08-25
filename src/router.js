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
var Miniware = require('miniware');
/*

  processor contains:

    * router - the function that maps the request before the suppliers are matched

    * security - the function that maps the request after the suppliers are matched
  
*/
module.exports = function(){

  var routes = {};

  var searchers = Miniware();

  function search_route(url, done){

    /*
    
      the default handler that matches statically registered routes
      
    */
    var default_search = function(url, done){
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
        return done('no route found');
      }
      else{
        done(null, {
          route:finalroute,
          fn:fn
        })
      }
    }


    searchers(url, function(error, result){
      if(error){
        router.emit('error:search', url, error);
      }
      done(error, result);
    }, default_search)
    
  }

  var middleware = Miniware();

  function router(req, reply){

    function runroute(){
      search_route(req.url, function(error, route){
        if(error || !route){
          reply(404 + ':no route found for: ' + req.url);
          return;
        }

        req.headers['x-supplier-route'] = route.route;
        router.emit('request', req);
        req.url = req.url.substr(route.route.length);
        route.fn(req, reply);
      })
    }

    middleware(req, function(error, result){
      if(error){
        router.emit('error:security', req, error);
      }
      reply(error, result);
    }, runroute);
    
  }

  router.add = function(route, fn){
    routes[route] = fn;
  }

  router.search = function(fn){
    searchers.use(fn);
    return router;
  }

  router.use = function(fn){
    middleware.use(fn);
    return router;
  }

  for(var prop in EventEmitter.prototype){
    router[prop] = EventEmitter.prototype[prop];
  }

  return router;
}