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

/*

  this looks at a reply and decides if there are some symlinks to resolve
  before we can call it done
  
*/
module.exports = function(req, reply){
  var self = this;
  // the selector that got us to the symlink
  var selector = req.headers['x-json-selector'] || {};
  var modifiers = selector.modifier || {};

  // the actual callback we generate
  return function(error, results){

    var symlinks = tools.extract_symlinks(results);
    results = tools.extract_results(results);
        
    // we have links to resolve before the answer is complete
    if(!symlinks){
      reply(error, results);
      return;
    }



    var bodyarr = [];

    var mods = [];
    for(var m in modifiers){
      mods.push(m);
    }

    var symfns = [];
    var symresults = [];

    function processlink(linkobj){

      var type = linkobj.type;
      var link = linkobj.link;
      var targetindex = linkobj.targetindex;

      // only fill in attribute links for the last step
      if(link.type=='attr' && !modifiers.laststep){
        return;
      }

      // we are linking to either an id or selector
      var extra = (link.diggerid || link.selector);
      var url = link.warehouse + (extra ? '/' + extra : '');

      symfns.push(function(nextsym){

        var symreq ={
          headers:req.headers,
          method:'get',
          url:url + (mods.length>0 ? ':' + mods.join(':') : '')
        }

        symreq.fromcontract = true;
        self.emit('digger:symlink', link);

        // run the sumlink request
        self.handle(symreq, function(error, linked){

          // we have the results for the symlink
          if(linked && linked.length>0){
            if(link.type=='attr'){

              // are we assigning the array as a value or a single result?
              var val = link.listmode ? linked : linked[0]

              // grab the model we are adding to
              var data = results[targetindex];

              if(data){
                data[link.field] = val;
              }
            }
            else{

              // we inject the symlinked data into the results
              var args = [targetindex, 1].concat(linked);

              // inject the results array into the results replacing the original
              Array.prototype.splice.apply(results, args);
            }

            //symresults = symresults.concat(linked);
            nextsym();
          }
          else{
            nextsym('an item is symlinked but the link is missing: ' + url);
          }
        })

      })
    }

    for(var id in symlinks){
      processlink(symlinks[id]);
    }

    process.nextTick(function(){
      if(symfns.length>0){
        async.parallel(symfns, function(error){
          //results = results.concat(symresults);
          reply(error, results);
        })  
      }
      else{
        reply(error, results);
      }  
    })

  }
}