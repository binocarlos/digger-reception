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
var Injector = require('./injector');

module.exports = function(options){
  options = options || {};
  var app = express();
  
  app.use(express.bodyParser());
  app.use(express.query());

  var resolver = new ContractResolver();
  var router = Router(options.routes, options.router);

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

  function reception_logger(req){
    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length
    ]
    logger(parts);
  }
  
  function action_logger(type, req){

    var data = '';

    if(type==='select'){
      data = req.selector.string;
    }
    else{
      data = (req.body || []).length;
    }

    var parts = [
      new Date().getTime(),
      'action:' + type,
      req.url,
      data
    ]
    logger(parts);
  }

  /*
  
    mount a backend warehouse handler
    
  */
  app.digger = function(route, fn){
    if(arguments.length<=1){
      fn = route;
      route = '/';
    }

    if(typeof(fn.on)==='function'){
      fn.on('action', action_logger);
    }

    router.add(route, function(req, reply){
      process.nextTick(function(){
        fn(req, reply);
      })
    });
    
    return app;
  }

  app.digger.use = function(fn){

  }


  /*
  
    pipe requests into the router to handle
    
  */
  resolver.on('request', function(req, reply){
    router(req, reply);
  })

  /*
  
    the router has denied access to a backend resource
    
  */
  router.on('security', function(req, error){
    var parts = [
      new Date().getTime(),
      'security',
      req.method.toLowerCase(),
      req.url,
      error
    ]
    logger(parts);
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
    reception_logger(req);
    resolver.handle(req, http_response_writer(res));
  })

  /*
  
    code injection
    
  */
  app.get('/digger.js', Injector());
  app.get('/digger.min.js', Injector({
    minified:true
  }));
  app.get('/:driver/digger.js', Injector({
    pathdriver:true
  }));
  app.get('/:driver/digger.min.js', Injector({
    pathdriver:true,
    minified:true
  }));
  
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

  /*
  
    a connector that runs raw packets rather than spawn a HTTP loopback
    
  */
  app.connector = function(){
    return function(req, reply){
      process.nextTick(function(){
        if(req.method.toLowerCase()==='post' && req.url==='/reception'){
          reception_logger(req);
          resolver.handle(req, reply);
        }
        else{
          router(req, reply);
        }  
      })
      
    }
  }

  /*
  
    assing a
    
  */
  app.router = function(fn){

  }

  return app;
}