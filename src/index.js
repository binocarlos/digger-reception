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

module.exports = function(routes){
  var app = express();
  var loopback_port = 80;
  
  app.use(express.bodyParser());
  app.use(express.query());

  var resolver = new ContractResolver();
  var router = Router(routes);

  /*
  
    pipe requests into the router to handle
    
  */
  resolver.on('request', function(req, reply){
    var parts = [
      new Date().getTime(),
      'request',
      req.method.toLowerCase(),
      req.url
    ]
    console.log(parts.join("\t"));
    router(req, reply);
  })

  /*
  
    logging
    
  */
  app.use(function(req, res, next){
    var parts = [
      new Date().getTime(),
      'packet',
      req.method.toLowerCase(),
      req.url
    ]
    console.log(parts.join("\t"));
    next();
  })

  app.use(app.router);

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
    console.log(parts.join("\t"));
    resolver.handle(req, function(contract_result){
      console.log('-------------------------------------------');
      console.log('after contact');
    })
  })

  var orig_listen = app.listen;
  app.listen = function(port){
    loopback_port = port || loopback_port;
    return orig_listen.apply(app, utils.toArray(arguments));
  }

  return app;
}