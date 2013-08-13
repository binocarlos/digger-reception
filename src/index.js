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


var express = require('express');
var url = require('url');
var utils = require('digger-utils');
var ContractResolver = require('./contractresolver');
var Router = require('./router');

module.exports = function(options){
  options = options || {};
  var app = express();
  
  app.use(express.bodyParser());
  app.use(express.query());

  var resolver = new ContractResolver();
  var router = Router(options.routes);

  function logger(parts){
    if(options.log===false){
      return;
    }
    console.log(parts.join("\t"));
  }

  /*
  
    get a function that will write the result to a http res
    
  */
  function http_response_writer(res){
    return function(error, result){
      if(error){
        var statusCode = 500;
        error = error.replace(/^(\d+):/, function(match, code){
          statusCode = code;
          return '';
        })
        res.statusCode = statusCode;
        res.send(error);
      }
      else{
        res.json(result || []);
      }
    }
  }
  
  /*
  
    mount a backend warehouse handler
    
  */
  app.digger = function(route, fn){
    if(arguments.length<=1){
      fn = route;
      route = '/';
    }

    router.add(route, fn);
    
    return app;
  }


  /*
  
    pipe requests into the router to handle
    
  */
  resolver.on('request', function(req, reply){
    router(req, reply);
  })

  /*
  
    log requests going to backend warehouses via the router
    
  */
  router.on('request', function(req){
    var parts = [
      new Date().getTime(),
      'packet',
      req.method.toLowerCase(),
      req.url
    ]
    logger(parts);
  })


  /*
  
    Ping
    
  */
  app.get('/ping', function(req, res, next){
    res.send('pong');
  })

  /*
  
  	Reception
  	
  */
  app.post('/reception', function(req, res, next){
    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length
    ]
    logger(parts);
    resolver.handle(req, http_response_writer(res));
  })

  /*
  
    catch all routes
    
  */
  app.use(function(req, res, next){

    var headers = req.headers;
    for(var prop in headers){
      if(prop.indexOf('x-json-')==0){
        headers[prop] = JSON.parse(headers[prop]);
      }
    }
    router({
      url:req.url,
      method:req.method.toLowerCase(),
      headers:headers,
      body:req.body
    }, http_response_writer(res));

  })

  var orig_listen = app.listen;
  app.listen = function(port){
    return orig_listen.apply(app, utils.toArray(arguments));
  }

  return app;
}