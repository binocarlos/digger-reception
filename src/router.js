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

module.exports = function(routes){

  return function(req, reply){

    console.log('-------------------------------------------');
    console.log('routing: ' + req.url);

    var url = req.url;
    if(url.charAt(0)==='/'){
      url = url.substr(1);
    }
    var parts = url.split('/');

    console.log('-------------------------------------------');
    console.dir(parts);
    var usepath = [parts.shift()];
    while(parts.length>0 && !routes['/' + usepath.join('/')]){
      usepath.push(parts.shift());
    }
    var route = routes['/' + usepath.join('/')];
    if(!route){
      console.log('-------------------------------------------');
      console.log('no route');
      reply('no route found');
      return;
    }
    

    console.log('-------------------------------------------');
    console.dir(route);
  }
}