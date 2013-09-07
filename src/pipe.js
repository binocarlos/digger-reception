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
  var lastresults = null;

  var start = new Date().getTime();

  // this is the contract pipe
  var fns = (req.body || []).map(function(raw, index){

    return function(nextpipe){

      if(lastresults){
        raw.body = lastresults;
      }

      // merge the top request into the next pipe step
      var send_request = tools.merge_request(req, raw);

      // don't do the symlink stuff cos there is no point
      if(!raw.body || raw.body.length<=0){
        send_request.fromcontract = true;

        self.handle(send_request, function(error, results){

          if(error){
            nextpipe(error);
            return;
          }
          else{
            lastresults = results;
            nextpipe();
          }

        })
      }
      else{
        

        // turn the single pipe step into list of requests across multiple warehouses
        // (symlinks can cause this to happen)
        var requests = [];
        var warehouses = {};

        (raw.body || []).forEach(function(item){
          var digger = item._digger || {};
          var warehouse = digger.diggerwarehouse;
          var arr = warehouses[warehouse] || [];
          arr.push(item);
          warehouses[warehouse] = arr;
        })

        function process_symlink_warehouse(url, warehouse){
          var body = warehouses[url];
          // it must have a body to have symlinked
          if(!body || body.length<=0){
            return;
          }
          
          var warehouse_req = tools.clone(raw);
          warehouse_req.url = url + '/select';
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
            warehouse_req.fromcontract = true;
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
