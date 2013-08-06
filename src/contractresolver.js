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

//var debug = require('debug')('contractresolver');

/*
  digger.io - Contract url.resolve(source, relative);   
  -----------------------------

  Middleware that knows how to merge and pipe

  You provide it with a handler function to issue
  indivudal requests to




 */

function Resolver(){

}

util.inherits(Resolver, EventEmitter);

module.exports = Resolver;

/*

  tells us if the given req object is a contract that we can handle
  
*/
Resolver.prototype.validate_contract = function(req){
  return !(typeof(this[req.headers['x-contract-type']]) !== 'function');
}
/*

  the front door for HTTP requests
  
*/
Resolver.prototype.handle = function(req, reply){
  
  /*
  
    make sure we actually have a contract
    
  */
  if(!this.validate_contract(req)){
    this.emit('request', req, reply);
  }
  else{
    this[req.headers['x-contract-type']].apply(this, [req, reply]);
  }
  
}

/*

  run each query in parallel and merge the results
  
*/
Resolver.prototype.merge = function(req, reply){
  
  var self = this;

  var branches = [];
  var results = [];
  
  //debug('merge contract');
  async.forEach(req.body || [], function(raw, nextmerge){

    // INJECT!
    // req.inject(contract_req);

    self.handle(raw, function(error, merge_res, more){
      if(error){
        nextmerge(error);
        return;
      }
      else{
        //results.push(merge_res);
        // BRACHING
        // branches = branches.concat(contract_res.getHeader('x-json-branches') || []);
        results = results.concat(merge_res.body || []);
        if(!more){
          nextmerge();  
        }
      }
      console.log('-------------------------------------------');
      console.log('-------------------------------------------');
      console.log('HANLER RES');
      console.dir(merge_res);

    })

    /*
    var contract_req = Request(raw);
    var contract_res = Response(function(){
      res.add(contract_res);
      branches = branches.concat(contract_res.getHeader('x-json-branches') || []);
      next();
    })*/

    //debug('merge contract - part: %s %s', contract_req.method, contract_req.url);
    //supplychain(contract_req, contract_res);

  }, function(error){
    if(error){
      reply(error);
      return;
    }
    console.log('-------------------------------------------');
    console.log('after mrege');
/*
    if(branches.length>0){

      var branch_req = Contract('merge');
      branch_req.method = 'post';
      branch_req.url = '/reception';
      branch_req.body = branches;

      var branch_res = Response(function(){
        res.add(branch_res);
        res.send();
      })

      resolver(branch_req, branch_res);
    }
    else{
      res.send();  
    }
    */

  })
}

/*

  run each query in sequence and pass the previous results onto the next stage as the body
  of the request

  the pipe contract assumes that there is always a post (or a request with a body) in each step
  
*/
Resolver.prototype.pipe = function(req, reply){
  var self = this;
  var lastresults = null;
  //debug('pipe contract');
  async.forEachSeries(req.body || [], function(raw, nextpipe){

    self.handle(raw, function(merge_res){
      console.log('-------------------------------------------');
      console.log('-------------------------------------------');
      console.log('HANLER RES');
      console.dir(merge_res);
      nextpipe();
    })
    /*
    var contract_req = Request(raw);
    req.inject(contract_req);
    contract_req.body = lastresults || contract_req.body;
    var contract_res = Response(function(){
      if(contract_res.hasError()){
        res.fill(contract_res);
      }
      else{
        lastresults = contract_res.body;
        nextpipe();
      }
    })
    */
    //debug('pipe contract - part: %s %s', contract_req.method, contract_req.url);
    //supplychain(contract_req, contract_res, next);
  }, function(error){
    console.log('-------------------------------------------');
    console.log('after pipe');
  })
}

