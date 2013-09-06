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

function extract_symlinks(answer){

  if(typeof(answer)==='object' && answer.headers && answer.headers.symlinks){
    return answer.headers.symlinks;
  }

  return null;
}

function extract_results(results){
  if(!results){
    results = [];
  }
  else if(!utils.isArray(results)){

    if(typeof(results)==='object'){
      if(results.headers){
        results = results.body;
      }
      else{
        results = [results];  
      }
    }
    else{
      results = [results];  
    }
  }

  return results;
}

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
function validate_contract(req){
  return req.method.toLowerCase()==='post' && req.url==='/reception';
  //return (typeof(this[req.headers['x-contract-type']]) === 'function');
}

/*

  the front door for HTTP requests
  
*/
Resolver.prototype.handle = function(req, reply){
  var self = this;
  /*
  
    make sure we actually have a contract
    
  */
  if(!validate_contract(req)){

    function processresply(error, results){

      var symlinks = extract_symlinks(results);
      results = extract_results(results);

      // we have links to resolve before the answer is complete
      if(symlinks){

        var bodyarr = [];

        for(var url in symlinks){
          bodyarr.push({
            headers:{},
            method:'get',
            url:url
          })
        }

        var contract = merge_request(req, {
          method:'post',
          url:'/reception',
          headers:{
            'x-contract-type':'merge'
          },
          body:bodyarr
        })

        process.nextTick(function(){

          self.handle(contract, function(error, linked){


            (linked || []).forEach(function(l){
              var digger = l._digger || {};
              digger._symlinked = true;
              l._digger = digger;
            })

            reply(error, (results || []).concat(linked));
          })          
        })
        
        
        
      }
      else{
        reply(error, results);
      }
     
    }

    this.emit('digger:request', req, processresply);
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

  var start = new Date().getTime();

  
  //debug('merge contract');
  async.forEach(req.body || [], function(raw, nextmerge){

    // INJECT!
    // req.inject(contract_req);

    raw = merge_request(req, raw);
    
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

function clone(obj){
  var ret = {};
  for(var prop in obj){
    ret[prop] = obj[prop];
  }
  return ret;
}
/*

  run each query in sequence and pass the previous results onto the next stage as the body
  of the request

  the pipe contract assumes that there is always a post (or a request with a body) in each step
  
*/
Resolver.prototype.pipe = function(req, reply){
  var self = this;
  var lastresults = null;

  var start = new Date().getTime();

  function get_symlink_contract(index){
    return ([]).concat(req.body).slice(index);
  }

  // this is the contract pipe
  var fns = (req.body || []).map(function(raw, index){

    return function(nextpipe){

      if(lastresults){
        raw.body = lastresults;
      }

      // merge the top request into the next pipe step
      var send_request = merge_request(req, raw);

      // turn the single pipe step into list of requests across multiple warehouses
      // (symlinks can cause this to happen)
      var requests = [send_request];
      var basebody = [];
      var warehouses = {};
      (raw.body || []).forEach(function(item){
        var digger = item._digger || {};
        if(digger._symlinked){
          var warehouse = digger.diggerwarehouse;
          var arr = warehouses[warehouse] || [];
          arr.push(item);
          warehouses[warehouse] = arr;
        }
        else{
          basebody.push(item);
        }
        
      })
      send_request.body = basebody;

      function process_symlink_warehouse(url, warehouse){
        var body = warehouses[url];
        // it must have a body to have symlinked
        if(!body || body.length<=0){
          return;
        }
        
        var warehouse_req = clone(raw);
        warehouse_req.url = url;
        warehouse_req.body = body;
        requests.push(warehouse_req);
      }

      for(var i in warehouses){
        process_symlink_warehouse(i, warehouses[i]);
      }

      // collect up the results from each of the warehouse steps
      var pipe_results = [];

      var fns = requests.map(function(warehouse_req){
        return function(next_warehouse_req){
          // HANDLE
          self.handle(warehouse_req, function(error, results){

            if(error){
              next_warehouse_req(error);
              return;
            }
            else{

              if(results.length>0){
                pipe_results = pipe_results.concat(results);
              }
              
              next_warehouse_req();
            }

          })
        }
      })

      async.parallel(fns, function(error){
        if(error){
          nextpipe(error);
        }
        else{
          lastresults = pipe_results;
          nextpipe();
        }
      })

      
    }

  })

  async.series(fns, function(error){

    var gap = new Date().getTime() - start;
    req.headers['x-request-time'] = gap;

    if(error){
      reply(error);
      self.emit('digger:contract:error', req, error);
      return;
    }
    else{
      reply(null, lastresults);
      self.emit('digger:contract:results', req, (lastresults || []).length);
    }    
  })
}
