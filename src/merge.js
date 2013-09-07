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
var tools = require('./tools');

module.exports = function(req, reply){
  
  var self = this;

  var allresults = [];

  var start = new Date().getTime();

  async.forEach(req.body || [], function(raw, nextmerge){

    raw = tools.merge_request(req, raw);
    raw.fromcontract = true;
    self.handle(raw, function(error, results, links){

      if(error){
        nextmerge(error);
        return;
      }
      else{
        allresults = allresults.concat(results || []);
        nextmerge();
      }
    })

  }, function(error){

    var gap = new Date().getTime() - start;
    req.headers['x-request-time'] = gap;

    if(error){
      reply(error);
      self.emit('digger:contract:error', req, error);
      return;
    }
    else{
      reply(null, allresults);
      self.emit('digger:contract:results', req, (allresults || []).length);
    }
  })
}