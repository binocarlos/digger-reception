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


var url = require('url');
var utils = require('digger-utils');
var ContractResolver = require('./contractresolver');
var Warehouse = require('digger-warehouse');

module.exports = function(options){
  options = options || {};

  var app = Warehouse();
  var resolver = new ContractResolver();

  /*
  
    returns a function that can be used to pipe requests into the reception
    
  */
  app.connector = function(){
    return function(req, reply){

      process.nextTick(function(){
        if(req.method.toLowerCase()==='post' && req.url==='/reception'){
          app.emit('digger:contract', req, reply);
          resolver.handle(req, reply);
        }
        else{
          app.emit('digger:request', req, reply);
        }  
      })
    }
  }

  /*
  
    pipe requests into the router to handle
    
  */
  resolver.on('digger:request', function(req, reply){
    app.emit('digger:request', req, reply);
  })


  /*
  
    Ping
    
  */
  app.use(function(req, reply, next){
    if(req.url=='/ping' && req.method=='get'){
      reply(null, 'pong');
    }
    else{
      next();
    }
  })
  
  /*
  
    the main entry to digger bridge
    
  */
  app.use(app.connector());

  return app;
}