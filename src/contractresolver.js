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

  injects the important properties from the top level request

  these are:

    headers['x-json-user']

    internal
    website


  
*/
function merge_request(req, raw){
  raw.internal = req.internal;
  raw.website = req.website;
  raw.headers['x-json-user'] = req.headers['x-json-user'];
  raw.headers['x-request-id'] = utils.littleid();
  return raw;
}

/*

  tells us if the given req object is a contract that we can handle
  
*/
Resolver.prototype.validate_contract = function(req){
  return (typeof(this[req.headers['x-contract-type']]) === 'function');
}
/*

  the front door for HTTP requests
  
*/
Resolver.prototype.handle = function(req, reply){
  
  /*
  
    make sure we actually have a contract
    
  */
  if(!this.validate_contract(req)){
    this.emit('digger:request', req, reply);
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
  var allresults = [];

  
  //debug('merge contract');
  async.forEach(req.body || [], function(raw, nextmerge){

    // INJECT!
    // req.inject(contract_req);

    raw = merge_request(req, raw);
    
    self.handle(raw, function(error, results){

      if(error){
        nextmerge(error);
        return;
      }
      else{
        if(!results){
          results = [];
        }
        else if(!utils.isArray(results)){
          results = [results];
        }
        //results.push(merge_res);
        // BRACHING
        // branches = branches.concat(contract_res.getHeader('x-json-branches') || []);
        allresults = allresults.concat(results || []);
        nextmerge();
      }
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
    else{
      reply(null, allresults);
    }
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

  var fns = (req.body || []).map(function(raw){

    return function(nextpipe){

      if(lastresults){
        raw.body = lastresults;
      }

      var pipe_results = [];
      var send_request = merge_request(req, raw);
      
      self.handle(send_request, function(error, results){

        if(error){
          nextpipe(error);
          return;
        }
        else{
          if(!results){
            results = [];
          }
          else if(!utils.isArray(results)){
            results = [results];
          }
          if(results.length<=0){
            reply(null, []);
            return;
          }
          lastresults = results;
          nextpipe();
        }

      })
    }

  })

  async.series(fns, function(error){
    if(error){
      reply(error);
      return;
    }
    else{
      reply(null, lastresults);
    }    
  })
}

