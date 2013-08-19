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
var fs = require('fs');

module.exports = function(options){
  options = options || {};
  return function(req, res, next){

    var host = req.headers.host;
    var baseurl = req.originalUrl.replace(/\/digger\.js/, '');

    if(options.pathdriver){
      baseurl = baseurl.replace(/\/\w+$/, '');
    }

    var full_baseurl = '//' + host + baseurl;

  	var driver = req.params.driver || req.query.driver || 'sockets';

  	res.setHeader('content-type', 'application/javascript');

    var client_path = __dirname + '/clients/' + driver + (options.minified ? '.min' : '') + '.js';

    fs.readFile(client_path, 'utf8', function(error, code){
      if(error){
        res.statusCode = 500;
        res.send(error);
      }
      else{

        /*
        
          this object is used to construct the window $digger object
          configured to point back to here
          
        */
        var digger_config = {
          host:host,
          baseurl:baseurl
        }

        code += [
          "(function(window){",
          " var useconfig = " + JSON.stringify(digger_config, null, 4) + ";",
          " if(window.$diggerconfig){",
          "   for(var prop in window.$diggerconfig){",
          "     useconfig[prop] = window.$diggerconfig[prop];",
          "   }",
          " }",
          " window.$digger = require('digger-" + driver + "')(useconfig);",
          "})(window)"
        ].join("\n");
        res.send(code);
      }
    })
  }
}