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
var utils = require('digger-utils');

module.exports.extract_symlinks = function(answer){

  if(typeof(answer)==='object' && answer.headers && answer.headers.symlinks){
    return answer.headers.symlinks;
  }

  return null;
}

module.exports.extract_results = function(results){
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

/*

  injects the important properties from the top level request

  these are:

    headers['x-json-user']

    internal
    website


  
*/
module.exports.merge_request = function(req, raw){
  raw.internal = req.internal;
  raw.website = req.website;
  raw.headers['x-json-user'] = req.headers['x-json-user'];
  raw.headers['x-request-id'] = utils.littleid();
  return raw;
}

/*

  tells us if the given req object is a contract that we can handle
  
*/
module.exports.validate_contract = function(req){

  if(!req || !req.method || !req.url){
    return false;
  }
  
  return req.method.toLowerCase()==='post' && req.url==='/reception';
  //return (typeof(this[req.headers['x-contract-type']]) === 'function');
}

module.exports.clone = function(obj){
  var ret = {};
  for(var prop in obj){
    ret[prop] = obj[prop];
  }
  return ret;
}