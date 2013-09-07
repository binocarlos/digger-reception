/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*
  Module dependencies.
*/

var async = require('async');

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('digger-utils');

var Tools = require('./tools');
var LinkResolver = require('./linkresolver');
var Merge = require('./merge');
var Pipe = require('./pipe');

function Resolver(){

}

util.inherits(Resolver, EventEmitter);

module.exports = Resolver;

/*

  the front door for HTTP requests

  this is currently not very quick and it needs to be

  however - it also needs to look after the resolving and symlinks

  at some point soon the holding bay should be put back here
  running in another process to leave just doing IO
  
*/
Resolver.prototype.handle = function(req, reply){
  var self = this;
  
  // if it is a normal request - route it and process the results for symlinks
  if(!Tools.validate_contract(req)){
    this.emit('digger:request', req, self.link_resolver(req, reply));
  }
  // if it is a contract then run the resolving method:
  //
  //    * merge       parallel - merge results
  //    * pipe        series - pass results from last step to next step
  else{
    this[req.headers['x-contract-type']].apply(this, [req, reply]);
  }
  
}

/*

  this looks at a reply and decides if there are some symlinks to resolve
  before we can call it done
  
*/
Resolver.prototype.link_resolver = LinkResolver;

/*

  run each query in parallel and merge the results
  
*/
Resolver.prototype.merge = Merge;

/*

  run each query in sequence and pass the previous results onto the next stage as the body
  of the request

  the pipe contract assumes that there is always a post (or a request with a body) in each step
  
*/
Resolver.prototype.pipe = Pipe;