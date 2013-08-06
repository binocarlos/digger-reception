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
var Warehouse = require('digger-warehouse');
var Network = require('digger-network');
var url = require('url');
var utils = require('digger-utils');

module.exports = function(){
  var app = express();
  var warehouse = Warehouse();

  app.use(express.bodyParser());
  app.use(express.query());

  /*
  
    the main HTTP to digger bridge
    
  */
  app.use(function(req, res, next){

    var pathname = url.parse(req.url).pathname;
    var digger_req = Network.request({
      method:req.method.toLowerCase(),
      url:pathname,
      pathname:pathname,
      headers:req.headers,
      body:req.body
    })

    var digger_res = Network.response(function(){
      res.statusCode = digger_res.statusCode;
      res.headers = digger_req.headers;
      res.send(digger_res.body);
    })

    warehouse(digger_req, digger_res, function(){
      digger_res.send404();
    })
  })

  var frontdoor = Warehouse();

  /*
  
    logging
    
  */
  frontdoor.use(function(req, res, next){
    var parts = [
      req.method.toUpperCase(),
      req.pathname
    ]
    console.log(parts.join("\t"));
    next();
  })

  frontdoor.get('/ping', function(req, res, next){
    res.send('pong');
  })

  /*
  
    the are you alive handler
    
  */
  warehouse.use(frontdoor);

  /*
  
  	the main contract resolver
  	
  */
  warehouse.post('/reception', function(req, res, next){
    
  })

  /*
  
    proxy for the express listener

    this is only called if we are running the HTTP server and not mounting onto a sub path of another express app
    
  */
  warehouse.listen = function(){
    return app.listen.apply(app, utils.toArray(arguments));
  }

  warehouse.close = function(){
    return app.close();
  }

  return warehouse;
}