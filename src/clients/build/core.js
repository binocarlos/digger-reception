;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//
// Dotty makes it easy to programmatically access arbitrarily nested objects and
// their properties.
//

//
// `object` is an object, `path` is the path to the property you want to check
// for existence of.
//
// `path` can be provided as either a `"string.separated.with.dots"` or as
// `["an", "array"]`.
//
// Returns `true` if the path can be completely resolved, `false` otherwise.
//

var exists = module.exports.exists = function exists(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    return Object.hasOwnProperty.apply(object, [key]);
  } else {
    return exists(object[key], path);
  }
};

//
// These arguments are the same as those for `exists`.
//
// The return value, however, is the property you're trying to access, or
// `undefined` if it can't be found. This means you won't be able to tell
// the difference between an unresolved path and an undefined property, so you 
// should not use `get` to check for the existence of a property. Use `exists`
// instead.
//

var get = module.exports.get = function get(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return;
  }

  if (path.length === 0) {
    return object[key];
  }

  if (path.length) {
    return get(object[key], path);
  }
};

//
// Arguments are similar to `exists` and `get`, with the exception that path
// components are regexes with some special cases. If a path component is `"*"`
// on its own, it'll be converted to `/.*/`.
//
// The return value is an array of values where the key path matches the
// specified criterion. If none match, an empty array will be returned.
//

var search = module.exports.search = function search(object, path) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return;
  }

  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return;
  }

  if (key === "*") {
    key = ".*";
  }

  if (typeof key === "string") {
    key = new RegExp(key);
  }

  if (path.length === 0) {
    return Object.keys(object).filter(key.test.bind(key)).map(function(k) { return object[k]; });
  } else {
    return Array.prototype.concat.apply([], Object.keys(object).filter(key.test.bind(key)).map(function(k) { return search(object[k], path); }));
  }
};

//
// The first two arguments for `put` are the same as `exists` and `get`.
//
// The third argument is a value to `put` at the `path` of the `object`.
// Objects in the middle will be created if they don't exist, or added to if
// they do. If a value is encountered in the middle of the path that is *not*
// an object, it will not be overwritten.
//
// The return value is `true` in the case that the value was `put`
// successfully, or `false` otherwise.
//

var put = module.exports.put = function put(object, path, value) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }
  
  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    object[key] = value;
  } else {
    if (typeof object[key] === "undefined") {
      object[key] = {};
    }

    if (typeof object[key] !== "object" || object[key] === null) {
      return false;
    }

    return put(object[key], path, value);
  }
};

//
// `remove` is like `put` in reverse!
//
// The return value is `true` in the case that the value existed and was removed
// successfully, or `false` otherwise.
//

var remove = module.exports.remove = function remove(object, path, value) {
  if (typeof path === "string") {
    path = path.split(".");
  }

  if (!(path instanceof Array) || path.length === 0) {
    return false;
  }
  
  path = path.slice();

  var key = path.shift();

  if (typeof object !== "object" || object === null) {
    return false;
  }

  if (path.length === 0) {
    if (!Object.hasOwnProperty.call(object, key)) {
      return false;
    }

    delete object[key];

    return true;
  } else {
    return remove(object[key], path, value);
  }
};

//
// `deepKeys` creates a list of all possible key paths for a given object.
//
// The return value is always an array, the members of which are paths in array
// format. If you want them in dot-notation format, do something like this:
//
// ```js
// dotty.deepKeys(obj).map(function(e) {
//   return e.join(".");
// });
// ```
//
// *Note: this will probably explode on recursive objects. Be careful.*
//

var deepKeys = module.exports.deepKeys = function deepKeys(object, prefix) {
  if (typeof prefix === "undefined") {
    prefix = [];
  }

  var keys = [];

  for (var k in object) {
    if (!Object.hasOwnProperty.call(object, k)) {
      continue;
    }

    keys.push(prefix.concat([k]));

    if (typeof object[k] === "object" && object[k] !== null) {
      keys = keys.concat(deepKeys(object[k], prefix.concat([k])));
    }
  }

  return keys;
};

},{}],2:[function(require,module,exports){
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

var Proto = require('./proto');

module.exports = function(tag, data){
	return Proto.factory(tag, data);
}

module.exports.proto = Proto;

/*

	add extra functions to the container prototype

	this means we can create different browser builds capable of different things
	
*/
module.exports.augment_prototype = function(api){
	for(var prop in api){
		Proto.prototype[prop] = api[prop];
	}
}
},{"./proto":3}],3:[function(require,module,exports){
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

var EventEmitter = require('events').EventEmitter;
var dotty = require('dotty');
var util = require('util');
var utils = require('digger-utils');

function Container(){}

/*

	Factory for new containers
	
*/
function factory(){

	/*
  
    first let's extract the model data
    
  */
  var models = [];

  if(typeof(arguments[0])==='string'){
    var string = arguments[0];
    var c = string.charAt(0);
    if(c==='{' || c==='['){
      var data = JSON.parse(string);
      if(c==='{'){
        data = [data];
      }
      models = data;
    }
    else{
      var model = arguments[1] || {};
      var digger = model._digger || {};
      digger.tag = string;
      model._digger = digger;
      models = [model];  
    }
    
  }
  else if(Object.prototype.toString.call(arguments[0]) == '[object Array]'){  
    models = arguments[0];
  }
  else if(typeof arguments[0]==='object'){
    models = [arguments[0]];
  }

  if(models[0]===undefined || models[0]===null){
    models = [];
  }

  var instance = function container(){
    if(!instance.select){
      throw new Error('there is no select method attached to this container');
    }
    var args = [arguments[0]];
    if(arguments.length>1){
      args.push(arguments[1]);
    }
    return instance.select.apply(instance, args);
  }

  /*
  
    ensure each model has a _digger property and an id
    
  */
  function process_model(model){

  }

  instance.__proto__ = new Container;
  instance.build(models);
  
  return instance;
}

/*

	expose
	
*/
Container.factory = factory;

util.inherits(Container, EventEmitter);

module.exports = Container;


/*

	prototype
	
*/
Container.prototype.build = function(models){

	this.models = models || [];

  function process_model(model){
    if(!model._digger){
      model._digger = {};
    }
    if(!model._digger.diggerid){
      model._digger.diggerid = utils.diggerid();
    }
    if(model._children){
      model._children.forEach(process_model);
    }
  }

  this.models.forEach(process_model);

  return this;
}

Container.prototype.toJSON = function(){
  return this.models;
}

/*

	iterators

*/

Container.prototype.spawn = function(models){
  models = models || [];
	var container = Container.factory(models);
  if(this.supplychain){
    container.supplychain = this.supplychain;  
  }
	return container;
}

Container.prototype.clone = function(){
  var data = JSON.parse(JSON.stringify(this.models));

  var ret = this.spawn(data);

  ret.recurse(function(des){
  	var model = des.get(0);
  	var digger = model._digger || {};
  	digger.diggerid = utils.diggerid();
  	model._digger = digger;
  })
  ret.ensure_parent_ids();
  return ret;
}

Container.prototype.ensure_parent_ids = function(parent){

  var self = this;

  if(parent){
  	this.each(function(c){
  		c.diggerparentid(parent.diggerid());
  	})
  }

  this.children().each(function(child){
    child.ensure_parent_ids(self);
  })
}

Container.prototype.inject_paths = function(basepath){

  this.diggerpath(basepath);

  this.children().each(function(child, index){
    child.inject_paths(basepath.concat([index]));
  })

}

Container.prototype.ensure_meta = function(done){
  if(!this.diggerid()){
    this.diggerid(utils.diggerid());
  }

  var topcounter = 0;
  if(this.diggerpath().length<=0){
    this.inject_paths([topcounter]);
    topcounter++;
  }

  this.ensure_parent_ids();
  return this;
}


Container.prototype.children = function(){
  var models = [];
  var self = this;
  this.each(function(container){
    models = models.concat(container.get(0)._children || []);
  })
	return this.spawn(models);
}

Container.prototype.recurse = function(fn){
  this.descendents().each(fn);
  return this;
}

Container.prototype.descendents = function(){
  var ret = [];

  function scoopmodels(container){
    ret = ret.concat(container.models);
    container.children().each(scoopmodels);
  }

  scoopmodels(this);

  return this.spawn(ret);
}

Container.prototype.containers = function(){
  var self = this;
  return this.models.map(function(model){
    return self.spawn([model]);
  })
}

Container.prototype.skeleton = function(){
  return this.models.map(function(model){
    return model._digger || {};
  })
}

Container.prototype.add = function(container){
  var self = this;
  
  if(!container){
    return this;
  }
  
  if(Object.prototype.toString.call(container) == '[object Array]'){
    container.forEach(function(c){
      self.add(c);
    })
    
  }
  else{
    this.models = this.models.concat(container.models);
  }
  return this;
}


Container.prototype.each = function(fn){
	this.containers().forEach(fn);
	return this;
}

Container.prototype.map = function(fn){
	return this.containers().map(fn);
}

Container.prototype.count = function(){
	return this.models.length;
}

Container.prototype.first = function(){
	return this.eq(0);
}

Container.prototype.last = function(){
	return this.eq(this.count()-1);
}

Container.prototype.eq = function(index){
	return this.spawn(this.get(index));
}

Container.prototype.get = function(index){
	return this.models[index];
}

/*

	properties
	
*/


function valuereader(model, name){
  if(!name){
  	return model;
  }
  return dotty.get(model, name);
}

function valuesetter(model, value, name){
	if(!name){
  	return value;
  }
  dotty.put(model, name, value);
  return value;
}

function makepath(path, base){
	var parts = [path];
	if(base){
		parts.unshift(base);
	}
	return parts.join('.');
}

function wrapper(basepath){
	return function(path, val){
		var self = this;
		if(arguments.length<=0){
      if(self.isEmpty()){
        return null;
      }
			return valuereader(self.get(0), basepath);
		}
		else if(arguments.length===1 && typeof(path)==='string'){
      if(self.isEmpty()){
        return null;
      }
			return valuereader(self.get(0), makepath(path, basepath));
		}
		else if(arguments.length===1){
			self.models.forEach(function(model){
				valuesetter(model, val, basepath);
			})
			return self;
		}
		else if(arguments.length>1){
			var usepath = makepath(path, basepath);
			self.models.forEach(function(model){
				valuesetter(model, val, usepath);
			})
			return self;
		}
	}
}

function property_wrapper(basepath, property){
	return function(val){

		var self = this;
		if(arguments.length<=0){
      if(self.isEmpty()){
        return null;
      }
			var model = dotty.get(self.get(0), basepath);
			return model[property];
		}
		else{
      if(!self.isEmpty()){
        self.models.forEach(function(model){
          var basemodel = dotty.get(model, basepath);
          basemodel[property] = val;
        })  
      }
			
			return self;
		}
	}
}

function remove_wrapper(basepath){
	return function(path){
		var self = this;
		var usepath = makepath(path, basepath);
		self.models.forEach(function(model){
			dotty.remove(model, usepath);
		})	
		return self;
	}	
}


Container.prototype.attr = wrapper();
Container.prototype.digger = wrapper('_digger');
Container.prototype.data = wrapper('_digger.data');

Container.prototype.diggerid = property_wrapper('_digger', 'diggerid');
Container.prototype.diggerparentid = property_wrapper('_digger', 'diggerparentid');
Container.prototype.diggerwarehouse = property_wrapper('_digger', 'diggerwarehouse');
var pathwrapper = property_wrapper('_digger', 'diggerpath');
Container.prototype.diggerpath = function(){
  var ret = pathwrapper.apply(this, utils.toArray(arguments));

  if(!utils.isArray(ret)){
    ret = [];
  }

  return ret;
}


var branchwrapper = property_wrapper('_digger', 'diggerbranch');
Container.prototype.diggerbranch = function(){
  var ret = branchwrapper.apply(this, utils.toArray(arguments));

  if(!utils.isArray(ret)){
    ret = [];
  }

  return ret;
}

Container.prototype.addBranch = function(where){
  var self = this;
  var branches = this.diggerbranch();
  where.each(function(container){
    branches.push(container.diggerurl());
  })
  this.diggerbranch(branches);
  return this;
}

Container.prototype.removeBranch = function(where){
  var self = this;
  var branches = this.diggerbranch();

  where.each(function(container){

    var newbranches = [];
    for(var i=0; i<branches.length; i++){
      if(branches[i]!=container.diggerurl()){
        newbranches.push(branches[i]);
      }
    }
    branches = newbranches;
  })
  this.diggerbranch(branches);
  return this;
}

Container.prototype.id = property_wrapper('_digger', 'id');
Container.prototype.tag = property_wrapper('_digger', 'tag');
Container.prototype.classnames = property_wrapper('_digger', 'class');

Container.prototype.removeAttr = remove_wrapper();
Container.prototype.removeDigger = remove_wrapper('_digger');
Container.prototype.removeData = remove_wrapper('_digger.data');

Container.prototype.is = function(tag){
  return this.tag()==tag;
}

Container.prototype.addClass = function(classname){
  var self = this;
  this.models.forEach(function(model){
    var classnames = model._digger.class || [];
    var found = false;
    classnames.forEach(function(c){
    	if(c==classname){
    		found = true;
    	}
    })
    if(!found){
    	classnames.push(classname);	
    }
    model._digger.class = classnames;
  })
  return this;
}

Container.prototype.removeClass = function(classname){
  var self = this;
  this.models.forEach(function(model){
    var classnames = model._digger.class || [];
    var newclassnames = [];
    classnames.forEach(function(c){
    	if(c!=classname){
    		newclassnames.push(c);
    	}
    })
    model._digger.class = newclassnames;
  })
  return this;
}

Container.prototype.hasClass = function(classname){
	var found = false;
	(this.classnames() || []).forEach(function(c){
		if(c==classname){
			found = true;
		}
	})
  return found;
}

Container.prototype.hasAttr = function(name){
	var prop = this.attr(name);
	return prop!==null;
}

Container.prototype.isEmpty = function(){
  return this.count()===0;
}

Container.prototype.inject_data = function(data){
	this.models.forEach(function(model){
		utils.extend(model, data);
	})
  return this;
}


Container.prototype.diggerurl = function(){
  var warehouse = this.diggerwarehouse();
  var id = this.diggerid();

  var url = warehouse || '/';

  if(id && this.tag()!='_supplychain'){
    if(warehouse!='/'){
      url += '/';
    }

    url += id;
  }
  
  return url.replace(/\/\//g, '/');
}

/*

	summary methods
	
*/

Container.prototype.title = function(){
  var name = this.attr('name');
  if(!name){
    name = this.attr('title');
  }
  if(!name){
    name = this.tag();
  }
  return name;
}

Container.prototype.summary = function(options){

  options = options || {};

  var parts = [];

  var title = (this.attr('name') || this.attr('title') || '')
  if(title.length>0 && options.title!==false){
    parts.push(title + ': ');
  }

  parts.push(this.tag());

  var id = this.id() || '';
  if(id.length>0){
    parts.push('#' + id);
  }

  var classnames = this.classnames() || [];
  if(classnames.length>0){
    classnames.forEach(function(classname){
      if(classname.match(/\w/)){
        parts.push('.' + classname.replace(/^\s+/, '').replace(/\s+$/, ''));
      }
    })
  }

  return parts.join('');
}

Container.prototype.toString = function(){
  return this.summary();
}
},{"digger-utils":12,"dotty":1,"events":15,"util":16}],4:[function(require,module,exports){
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

var Selector = require('digger-selector');
var utils = require('digger-utils');

module.exports = {
  select:select,
  append:append,
  save:save,
  remove:remove
}

/*

  return either the first array object
  or if length > 1 then wrapper.body = list and return wrapper
  
*/
function multiple_branch(list, wrapper){
  if(list.length<=1){
    return list[0];
  }
  else{
    wrapper.body = list;
    return wrapper;
  }
}

/*

  SELECT 
  turns an array of selector strings into a pipe contract

  the strings are reversed as in:

    "selector", "context"

  becomes

    context selector

  in the actual search (this is just how jQuery works)
  
*/
function select(selector_string, context_string){

  var self = this;
  if(this.count()<=0){
    throw new Error('attempting a select on an empty container');
  }

  /*
  
    first get an array of selector objects

    we make a pipe contract out of these

    then duplicate that pipe contract for each different diggerwarehouse

    
  */
  var strings = [selector_string];
  if(arguments.length>1){
    strings.push(context_string);
  }
  
  var selectors = strings.map(function(selector){
    return Selector(selector);
  })
  
  /*
  
    the 'context' are the models inside 'this' container

    the _digger objects will be sent as the body of the select request
    for each supplier to use as the context (i.e. starting point for the query)

    
  */

  var context = this.containers();

  /*
  
    split out the current context into their warehouse origins
    
  */
  var groups = {};

  this.each(function(container){
    var warehouse = container.diggerwarehouse() || '/';
    var arr = groups[warehouse] || [];
    arr.push(container);
    groups[warehouse] = arr;
  })
  
  var warehouseurls = Object.keys(groups);

  /*
  
    the top level contract - this will be resolved in the holdingbay

    it is a merge of the various warehouse targets
    
  */

  /*
  
    if there is only a single warehouse url then we do the pipe at the top level

    otherwise we merge all the individual warehouse pipe contracts
    
  */

  var topcontract = {};

  function basic_contract(type){
    return {
      method:'post',
      url:'/reception',
      headers:{
        'content-type':'digger/contract',
        'x-contract-type':type,
        'x-contract-id':utils.diggerid()
      }
    }
  }

  // (warehouseurl + '/resolve').replace(/\/\//g, '/'),
  function create_warehouse_pipe_contract(warehouseurl){
    /*
    
      create a pipe contract out of the selectors
      
    */
    // this is the skeleton to POST to the start of the chain per phase
    var skeleton = groups[warehouseurl].map(function(c){
      return c.get(0)._digger;
    }).filter(function(digger){
      return digger.tag!='_supplychain';
    })

    /*
    
      the top level selectors are phases to be merged
      
    */
    var phase_contracts = selectors.reverse().map(function(selector_phase){

      /*
      
        a single selector chain

        the first step is posted the skeleton from the client container

        each step is piped the results of the previous

        the reception looks after detecting branches in the results
        
      */
      var selector_contracts = selector_phase.phases.map(function(selector_stages){

        var last_selector = selector_stages[selector_stages.length-1];
        var modifier = last_selector.modifier || {};
        modifier.laststep = true;
        last_selector.modifier = modifier;
        
        var selector_requests = selector_stages.map(function(selector){
          return {
            method:'post',
            url:(warehouseurl + '/select').replace(/\/\//g, '/'),
            headers:{
              'x-json-selector':selector
            }
          }  
        })

        selector_requests[0].body = skeleton;

        return multiple_branch(selector_requests, basic_contract('pipe'));
      })

      return multiple_branch(selector_contracts, basic_contract('merge'));
    })

    return multiple_branch(phase_contracts, basic_contract('pipe'))
  }

  /*
  
    the top level warehouse grouped contracts

    either a single set of selector resolvers or an array of merges across warehouses
    
  */
  var warehouse_pipe_contracts = warehouseurls.map(create_warehouse_pipe_contract);
  var topcontract = multiple_branch(warehouse_pipe_contracts,  {
    method:'post',
    url:'/reception',
    headers:{
      'content-type':'digger/contract',
      'x-contract-type':'merge',
      'x-contract-id':utils.diggerid()
    }
  })

  return this.supplychain ? this.supplychain.contract(topcontract, self).expect('containers') : topcontract;
}

/*

  POST

  
*/
function append(appendcontainer){

  var self = this;
  
  if(arguments.length<=0 || appendcontainer.count()<=0){
    throw new Error('there is nothing to append');
  }

  if(this.count()<=0){
    throw new Error('there is nothing to append to');
  }

  var appendmodels = appendcontainer.models;
  
  var appendto = this.eq(0);
  var appendtomodel = this.get(0);

  appendtomodel._children = (appendtomodel._children || []).concat(appendmodels);

  /*
  
    this is a direct request not a contract
    
  */
  var raw = {
    method:'post',
    headers:{
      'content-type':'digger/contract',
      'x-contract-type':'merge',
      'x-contract-id':utils.diggerid()
    },
    url:'/reception',
    body:[{
      method:'post',
      headers:{
        'x-contract-id':utils.diggerid()
      },
      url:appendto.diggerurl(),
      body:appendmodels
    }]
  }

  appendcontainer.supplychain = this.supplychain;

  return this.supplychain ? this.supplychain.contract(raw, self).after(function(results){
    var map = {};
    appendmodels.forEach(function(model){
      map[model._digger.diggerid] = model;
    })
    results.forEach(function(result){
      var model = map[result._digger.diggerid];
      if(model){
        for(var prop in result){
          model[prop] = result[prop];
        }
      }
    })
    return self.spawn(results);
  }) : raw;
}

/*

  PUT
  
*/
function save(){

  var self = this;
  if(this.count()<=0){
    throw new Error('there is nothing to save');
  }


  var raw = {
    method:'post',
    headers:{
      'content-type':'digger/contract',
      'x-contract-type':'merge',
      'x-contract-id':utils.diggerid()
    },
    url:'/reception',
    body:this.map(function(container){
      var model = container.get(0);
      var savemodel = JSON.parse(JSON.stringify(model));
      delete(savemodel._children);
      delete(savemodel._digger.data);
      return {
        method:'put',
        headers:{
          'x-contract-id':utils.diggerid()
        },
        url:container.diggerurl(),
        body:savemodel
      }
    })
  }

  return this.supplychain ? this.supplychain.contract(raw, self) : raw;
}

/*

  DELETE
  
*/
function remove(){

  var self = this;
  if(this.count()<=0){
    throw new Error('there is nothing to delete');
  }

  var raw = {
    method:'post',
    url:'/reception',
    headers:{
      'content-type':'digger/contract',
      'x-contract-type':'merge',
      'x-contract-id':utils.diggerid()
    },
    body:this.map(function(container){
      return {
        method:'delete',
        headers:{
          'x-contract-id':utils.diggerid()
        },
        url:container.diggerurl()
      }
    })
  }

  return this.supplychain ? this.supplychain.contract(raw, self) : raw;
}
},{"digger-selector":8,"digger-utils":12}],5:[function(require,module,exports){
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

/*
  digger - Find
  ----------------

  A sync version of the selector resolver for use with already loaded containers

  This is used for container.find() to return the results right away jQuery style




 */

module.exports = factory;

function State(arr){
  this.count = arr.length;
  this.index = 0;
  this.finished = false;
}

State.prototype.next = function(){
  this.index++;
  if(this.index>=this.count){
    this.finished = true;
  }
}

/*

  search is the function that accepts a single container and the single selector to resolve
  
*/
function factory(searchfn){

  /*
  
    context is the container to search from

    selectors is the top level array of indivudally processed selector strings
    
  */

  return function(selectors, context){

    var final_state = new State(selectors);
    var final_results = context.spawn();

    /*
    
      loop over each of the seperate selector strings

      container("selectorA", "selectorB")

      B -> A
      
    */
    selectors.reverse().forEach(function(stage){

      final_state.next();

      /*
      
        this is a merge of the phase results

        the last iteration of this becomes the final results
        
      */
      var stage_results = context.spawn();

      /*
      
        now we have the phases - these can be done in parallel
        
      */
      stage.phases.forEach(function(phase){

        
        var phase_context = context;

        var selector_state = new State(phase);

        var cancel = false;

        phase.forEach(function(selector){

          if(cancel){
            return;
          }

          selector_state.next();

          var results = searchfn(selector, phase_context);

          /*
          
            quit the stage loop with no results
            
          */
          if(results.count()<=0){
            cancel = true;
            return false;
          }

          /*
          
            if there is still more to get for this string
            then we update the pipe skeleton
            
          */
          if(!selector_state.finished){
            phase_context = results;
          }
          /*
          
            this
            
          */
          else{
            stage_results.add(results);
          }

          return true;

        })

      

      })

      /*
      
        quit the stages with no results
        
      */
      if(stage_results.count()<=0){
        return false;
      }


      /*
      
        this is the result of a stage - we pipe the results to the next stage
        or call them the final results
        
      */

      if(!final_state.finished){
        context = stage_results;
      }
      else{
        final_results = stage_results;
      }
    })

    return final_results;

  }
}
},{}],6:[function(require,module,exports){
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

var find = require('./find');
var search = require('./search');
var Selector = require('digger-selector');

var finder = find(search.searcher);

var sortfns = {
  title:function(a, b){
    if ( a.title().toLowerCase() < b.title().toLowerCase() )
      return -1;
    if ( a.title().toLowerCase() > b.title().toLowerCase() )
      return 1;
    return 0;
  },
  field:function(name){
    return function(a, b){
      if ( a.attr(name).toLowerCase() < b.attr(name).toLowerCase() )
        return -1;
      if ( a.attr(name).toLowerCase() > b.attr(name).toLowerCase() )
        return 1;
      return 0;
    }
  }
}

/*

  these functions run in the context of a container
  
*/
module.exports = {
  find:function(selector, context){
    var selectors = [selector];
    if(context){
      selectors.push(context);
    }
    selectors = selectors.map(function(string){
      return Selector(string);
    })
    return finder(selectors, this);
  },

  sort:function(fn){
    if(typeof(fn)==='string'){
      fn = sortfns.field(fn);
    }
    else if(!fn){
      fn = sortfns.title;
    }

    this.each(function(container){
      var newchildren = container.children().containers().sort(fn);
      var model = container.get(0);
      model.children = newchildren.map(function(container){
        return container.get(0);
      })
    })

    return this;
  },

  filter:function(filterfn){

    /*
    
      turn anything other than a function into the filter function

      the compiler looks after turning strings into selector objects
      
    */
    if(!typeof(filterfn)=='function'){
      if(typeof(filterfn)=='string'){
        filterfn = Selector(filterfn).phases[0][0];
      }
      filterfn = search.compiler(filterfn);
    }

    var matching_container_array = this.containers().filter(filterfn);

    return this.spawn(matching_container_array.map(function(container){
      return container.get(0);
    }))
  },

  match:function(selector){

    if(this.count()<=0){
      return false;
    }

    var results = this.filter(selector);

    return results.count()>0;
  }
}
},{"./find":5,"./search":7,"digger-selector":8}],7:[function(require,module,exports){
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

/*
  Quarry.io - Container Search
  ----------------------------

  Takes a search_from container and an array of strings

  It reverses the strings and does a simulated pipe


 */

module.exports.searcher = search;
module.exports.compiler = compile;

/*
  These functions are used to run attribute selectors over in-memory containers
 */
var attr_compare_functions = {
  "=":function(check, target){
    return check!=null && check==target;
  },
  "!=":function(check, target){
    return check!=null && check!=target;
  },
  ">":function(check, target){
    target = parseFloat(target);
    return check!=null && !isNaN(target) ? check > target : false;
  },
  ">=":function(check, target){
    target = parseFloat(target);
    return check!=null && !isNaN(target) ? check >= target : false;
  },
  "<":function(check, target){
    target = parseFloat(target);
    return check!=null && !isNaN(target) ? check < target : false;
  },
  "<=":function(check, target){
    target = parseFloat(target);
    return check!=null && !isNaN(target) ? check <= target : false;
  },
  "^=":function(check, target){
    return check!=null && check.match(new RegExp('^' + utils.escapeRegexp(target), 'i')) !== null;
  },
  "$=":function(check, target){
    return check!=null && check.match(new RegExp(utils.escapeRegexp(target) + '$', 'i')) !== null;
  },
  "~=":function(check, target){
    return check!=null && check.match(new RegExp('\\W' + utils.escapeRegexp(target) + '\\W', 'i')) !== null;
  },
  "|=":function(check, target){
    return check!=null && check.match(new RegExp('^' + utils.escapeRegexp(target) + '-', 'i')) !== null;
  },
  "*=":function(check, target){
    return check!=null && check.match(new RegExp(utils.escapeRegexp(target), 'i')) !== null;
  }
}

/*

  Turn a selector object into a compiled function to have containers run through
  
 */

function compile(selector){

  // return a function that will return boolean for a container matching this selector
  return function(container){

    var model = container.get(0);
    var digger = model._digger;

    // we step through one at a time - as soon as something fails we do not match

    // if we have a wildcard then we pass
    if(selector.tag=='*'){
      return true;
    }

    // #id
    if(selector.id && digger.id!=selector.id){      
      return false;
    }

    // =diggerid
    if(selector.diggerid && digger.diggerid!=selector.diggerid){
      return false;
    }

    // tagname
    if(selector.tag && digger.tag!=selector.tag){
      return false;
    }
  
    // classnames
    if(selector.class){
      var keys = Object.keys(selector.class || {});
      var classcount = 0;
      keys.forEach(function(c){
        classcount += container.hasClass(c) ? 1 : 0;
      })
      if(classcount<keys.length){
        return false;
      }
    }
    
    if(selector.attr){

      var attr_count = 0;

      selector.attr.forEach(function(attr_filter){

        var check_value = container.attr(attr_filter.field);
        var operator_function = attr_compare_functions[attr_filter.operator];

        // [size]
        if(!attr_filter.value){
          attr_count += check_value !== null ? 1 : 0;
        }
        // [size>100]
        else if(operator_function){
          attr_count += operator_function.apply(null, [check_value, attr_filter.value]) ? 1 : 0;
        }
        // no operator function found
      })

      if(attr_count<selector.attr.length){
        return false;
      }
    }

    return true;
      
  }
}

function search(selector, context){

  var selector_filter = compile(selector);

  var search_in = context;

  // we must now turn the search_from container into a flat array of the things to actually search

  // direct child mode
  if(selector.splitter=='>'){
    search_in = context.children();
  }
  // direct parent mode
  else if(selector.splitter=='<'){
    throw new Error('we do not support the parent splitter at the moment');
  }
  // all descendents mode
  else{
    search_in = context.descendents();
  }

  // now we loop each child container piping it via the selector filter
  var ret = search_in.filter(selector_filter);

  var modifier = selector.modifier || {};

  if(modifier.limit){
    var st = '' + modifier.limit;
    if(st.indexOf(',')>=0){
      var parts = st.split(',').map(function(stt){
        return stt.replace(/\D/g, '');
      })
      ret.models = ret.models.slice(parts[0], parts[1]);
    }
    else{
      ret.models = ret.models.slice(0, modifier.limit);
    }
    
  }

  if(modifier.first && ret.models.length>0){
    ret.models = [ret.models[0]];
  }
  else if(modifier.last && ret.models.length>0){
    ret.models = [ret.models[ret.models.length-1]];
  }

  return ret;
}
},{"digger-utils":12}],8:[function(require,module,exports){
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

module.exports = parse;
module.exports.mini = miniparse;

/*
  Quarry.io Selector
  -------------------

  Represents a CSS selector that will be passed off to selectors or perform in-memory search

 */

/***********************************************************************************
 ***********************************************************************************
  Here is the  data structure:

  "selector": " > * product.onsale[price<100] > img caption.red, friend",
  "phases":
    [
      [
          {
              "splitter": ">",
              "tag": "*"
          },
          {
              "splitter": "",
              "tag": "product",
              "classnames": {
                  "onsale": true
              },
              "attr": [
                  {
                      "field": "price",
                      "operator": "<",
                      "value": "100"
                  }
              ]
          },
          {
              "splitter": ">",
              "tag": "img"
          },
          {
              "splitter": "",
              "tag": "caption",
              "classnames": {
                  "red": true
              }
          }
      ],
      [
          {
              "tag": "friend"
          }
      ]
    ]

 */

/*
  Regular Expressions for each chunk
*/

var chunkers = [
  // the 'type' selector
  {
    name:'tag',
    regexp:/^(\*|\w+)/,
    mapper:function(val, map){
      map.tag = val;
    }
  },
  // the '.classname' selector
  {
    name:'class',
    regexp:/^\.\w+/,
    mapper:function(val, map){
      map.class = map.class || {};
      map.class[val.replace(/^\./, '')] = true;
    }
  },
  // the '#id' selector
  {
    name:'id',
    regexp:/^#\w+/,
    mapper:function(val, map){
      map.id = val.replace(/^#/, '');
    }
  },
  // the '=diggerid' selector
  {
    name:'diggerid',
    regexp:/^=[\w-]+/,
    mapper:function(val, map){
      map.diggerid = val.replace(/^=/, '');
    }
  },
  // the ':modifier' selector
  {
    name:'modifier',
    regexp:/^:\w+(\(.*?\))?/,
    mapper:function(val, map){
      map.modifier = map.modifier || {};
      var parts = val.split('(');
      var key = parts[0];
      val = parts[1];

      if(val){
        val = val.replace(/\)$/, '');

        if(val.match(/^[\d\.-]+$/)){
          val = JSON.parse(val);
        }

      }
      else{
        val = true;
      }

      map.modifier[key.replace(/^:/, '')] = val;
    }
  },
  // the '[attr<100]' selector
  {
    name:'attr',
    regexp:/^\[.*?["']?.*?["']?\]/,
    mapper:function(val, map){
      map.attr = map.attr || [];
      var match = val.match(/\[(.*?)([=><\^\|\*\~\$\!]+)["']?(.*?)["']?\]/);
      if(match){
        map.attr.push({
          field:match[1],
          operator:match[2],
          value:match[3]
        });
      }
      else {
        map.attr.push({
          field:val.replace(/^\[/, '').replace(/\]$/, '')
        });
      }
    }
  },
  // the ' ' or ' > ' splitter
  {
    name:'splitter',
    regexp:/^[ ,<>]+/,
    mapper:function(val, map){
      map.splitter = val.replace(/\s+/g, '');
    }

  }
];


/*
  Parse selector string into flat array of chunks
 
  Example in: product.onsale[price<100]
 */
function parseChunks(selector){

  var lastMatch = null;
  var workingString = selector ? selector : '';
  var lastString = '';

  // this is a flat array of type, string pairs
  var chunks = [];

  var matchNextChunk = function(){

    lastMatch = null;

    for(var i in chunkers){
      var chunker = chunkers[i];

      if(lastMatch = workingString.match(chunker.regexp)){

        // merge the value into the chunker data
        var data = {
          value:lastMatch[0]
        }
        for(prop in chunker){
          data[prop] = chunker[prop];
        }
        data.string = lastMatch[0];
        chunks.push(data);

        workingString = workingString.replace(lastMatch[0], '');

        return true;
      }
    }
    
    return false;

  }
  
  // the main chunking loop happens here
  while(matchNextChunk()){
    
    // this is the sanity check in case we match nothing
    if(lastString==workingString){
      break;
    }
  }

  return chunks;
}

function new_selector(){
  return {
    string:'',
    class:{},
    attr:[],
    modifier:{}
  }
}

/*

  turns a selector string into an array of arrays (phases) of selector objects
 
 */
function parse(selector_string){

  if(typeof(selector_string)!='string'){
    return selector_string;
  }

  var chunks = parseChunks(selector_string);

  var phases = [];
  var currentPhase = [];
  var currentSelector = new_selector();

  var addCurrentPhase = function(){
    if(currentPhase.length>0){
      phases.push(currentPhase);
    }
    currentPhase = [];
  }

  var addCurrentSelector = function(){

    if(Object.keys(currentSelector).length>0){
      currentPhase.push(currentSelector);
    }
    currentSelector = new_selector();
  }

  var addChunkToSelector = function(chunk, selector){
    chunk.mapper.apply(null, [chunk.value, selector]);
    selector.string += chunk.string;
  }

  chunks.forEach(function(chunk, index){

    if(chunk.name=='splitter' && chunk.value.match(/,/)){
      addCurrentSelector();
      addCurrentPhase();
    }
    else{

      if(chunk.name=='splitter' && index>0){
        addCurrentSelector();
      }

      addChunkToSelector(chunk, currentSelector);

    }
  })

  addCurrentSelector();
  addCurrentPhase();

  return {
    string:selector_string,
    phases:phases
  }
}

function miniparse(selector_string){

  if(typeof(selector_string)!=='string'){
    return selector_string;
  }
  selector_string = selector_string || '';
  var selector = {
    class:{},
    modifier:{}
  }
  selector_string = selector_string.replace(/_(\w+)/, function(match, id){
    selector.id = id;
    return '';
  })
  selector_string = selector_string.replace(/\.(\w+)/g, function(match, classname){
    selector.class[classname] = true;
    return '';
  })
  if(selector_string.match(/\d/)){
    selector.diggerid = selector_string;
  }
  else{
    selector.tag = selector_string;
  }
  return selector;
}
},{}],9:[function(require,module,exports){
var process=require("__browserify_process");/*

  (The MIT License)

  Copyright (C) 2005-2013 Kai Davenport

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


/*

	supply chain

  the link between a client side container and a back end digger.io database server

  the supplychain is a function that accepts a request object (a pure javascript obj)
  and returns a promise for it to be fulfilled

  you create a supplychain by passing the function that will actualy deal with the request

	
*/

var Container = require('digger-container');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('digger-utils');


module.exports = factory;

function factory(handle, use_container){

  var supplychain = new SupplyChain(handle, use_container);

  return supplychain;
}

/*

  create a new supply chain that will pipe a req and res object into the
  provided fn

  
*/

function SupplyChain(handle, use_container){

  // force the request into new references so we are not messing with client
  // data if this is an entirely local setup
  this.handle = handle;
  this.container = use_container || Container;
}


util.inherits(SupplyChain, EventEmitter);

/*

  the handler function accepts a pure JS req object to be sent to the server as HTTP or socket (but it's basically a HTTP)

  it returns a promise that will resolve once the callback based handle function passed in to the supplychain has returned
  
*/
SupplyChain.prototype.contract = function(req, container){

  var self = this;

  if(!req.headers){
    req.headers = {};
  }
  
  function trigger_request(callback){
    if(!self.handle || typeof(self.handle)!='function'){
      setTimeout(function(){
        loadresults.reject('There is no handle method attached to this supplychain')
      }, 0)
    }
    else{
      self.handle(req, function(error, result){
        if(error){
          callback(error);
          return;
        }
        else{
          if(!result){
            result = [];
          }
          if(!utils.isArray(result)){
            result = [result];
          }

          if(req.results_processor){
            result = req.results_processor(result);
          }

          callback(null, result);
        }
      })
    }
  }

  req.ship = function(fn){

    process.nextTick(function(){
      trigger_request(function(error, answer){
        if(error){
          if(req._fail){
            req._fail(error);  
          }
        }
        else{
          fn(answer);
          if(req._after){
            req._after(answer);
          }
        }
      })
    })

    return this;
  }
  req.fail = function(fn){
    req._fail = fn;
    return this;
  }
  req.expect = function(type){
    if(type=='containers'){
      req.results_processor = function(results){
        return container.spawn(results);
      }
    }
    return this;
  }
  req.after = function(fn){
    req._after = fn;
    return this;
  }
  req.debug = function(){
    req.headers['x-debug'] = true;
    return this;
  }

  return req;

}

/*

  return a container that uses this supplychain - this means contracts can be run via the container
  and they will travel down the supply chain

  if a diggerid is given then the returned container will not be a _supplychain - this means it's skeleton will
  be sent for selects

  otherwise we are assuming the connect is for a top level warehouse and the tag becomes _supplychain which
  is filtered out from the skeleton in contracts
  
*/
SupplyChain.prototype.connect = function(diggerwarehouse, diggerid){
  var self = this;
  var container = self.container(arguments.length>1 ? 'item' : '_supplychain');
  container.diggerwarehouse(diggerwarehouse || '/');
  if(arguments.length>1){
    container.diggerid(diggerid);
  }
  container.supplychain = this;
  return container;
}

SupplyChain.prototype.contract_group = function(type, contracts){
  var raw = {
    method:'post',
    url:'/reception',
    headers:{
      'content-type':'digger/contract',
      'x-contract-type':type
    },
    body:contracts || []
  }

  // we use this to generate hooked up containers as results
  var stub = self.container();
  stub.supplychain = this;

  return this.contract(raw, stub);
}

/*

  create a merge contract from an array of existing contracts
  
*/
SupplyChain.prototype.merge = function(contracts){
  return this.contract_group('merge', contracts);
}

/*

  create a pipe contract from an array of existing contracts
  
*/
SupplyChain.prototype.pipe = function(contracts){
  return this.contract_group('pipe', contracts);
}
},{"__browserify_process":17,"digger-container":2,"digger-utils":12,"events":15,"util":16}],10:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;

function isPlainObject(obj) {
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
		return false;

	var has_own_constructor = hasOwnProperty.call(obj, 'constructor');
	var has_is_property_of_method = hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
		return false;

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for ( key in obj ) {}

	return key === undefined || hasOwn.call( obj, key );
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],11:[function(require,module,exports){
var hat = module.exports = function (bits, base) {
    if (!base) base = 16;
    if (bits === undefined) bits = 128;
    if (bits <= 0) return '0';
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else return res;
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) bits += expandBy;
                else throw new Error('too many ID collisions, use more bits')
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};

},{}],12:[function(require,module,exports){
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

var extend = require('extend');
var hat = require('hat');
var utils = module.exports = {};

/**
 * generate a new global id
 */

utils.diggerid = function(){
  return hat();
}

utils.littleid = function(chars){

  chars = chars || 6;

  var pattern = '';

  for(var i=0; i<chars; i++){
    pattern += 'x';
  }
  
  return pattern.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

/**
 * takes a string and prepares it to be used in a RegExp itself
 */

utils.escapeRegexp = function(search){
  return search.replace(/([\!\$\(\)\*\+\.\/\:\=\?\[\\\]\^\{\|\}])/g, "\\$1");
}

/*

  return a pure JS version of a HTTP request
  
*/
utils.json_request = function(req){
  return {
    method:req.method.toLowerCase(),
    url:req.url,
    body:req.body,
    headers:req.headers
  }
}

/*

  is arr actually an array
  
*/
utils.isArray = function(arr){
  return Object.prototype.toString.call(arr) == '[object Array]';
}

/*

  return an array version of arguments
  
*/
utils.toArray = function(args){
  return Array.prototype.slice.call(args, 0);
}

/**
 * jQuery Deep extend
 */

utils.extend = extend;
},{"extend":10,"hat":11}],13:[function(require,module,exports){
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

var SupplyChain = require('digger-supplychain');
var Container = require('digger-container');

/*

	setup the full container api for the client
	
*/
Container.augment_prototype(require('digger-contracts'));
Container.augment_prototype(require('digger-find'));


/*

	the client factory - you pass a handle function for requests and it
	returns a $digger from which you can connect to containers and warehouses
	
*/
module.exports = function(handle){
	var supplychain = SupplyChain(handle, Container);
	return supplychain;
}

module.exports.Container = Container;
},{"digger-container":2,"digger-contracts":4,"digger-find":6,"digger-supplychain":9}],14:[function(require,module,exports){
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

var Client = require('digger-client');

window.$digger = Client(function(req, reply){
	console.log('-------------------------------------------');
	console.dir(req);
	reply('digger is not connected')
})
},{"digger-client":13}],15:[function(require,module,exports){
var process=require("__browserify_process");if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_process":17}],16:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\u001b[' + styles[style][0] + 'm' + str +
             '\u001b[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
}


function isRegExp(re) {
  typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]';
}


function isDate(d) {
  return typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]';
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":15}],17:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[14])
;