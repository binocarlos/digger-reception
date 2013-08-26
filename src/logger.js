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

module.exports = function(router){

  function logger(parts){
    if(options.log===false){
      return;
    }
    console.log(parts.join("\t"));
  }


  function reception_logger(req){
    var parts = [
      new Date().getTime(),
      'contract',
      req.headers['x-contract-type'],
      (req.body || []).length
    ]
    logger(parts);
  }
  
  function action_logger(type, req){

    var data = '';

    if(type==='select'){
      data = (req.selector || {}).string;
    }
    else{
      data = (req.body || []).length;
    }

    var parts = [
      new Date().getTime(),
      'action:' + type,
      req.headers['x-supplier-route'] + req.url,
      data
    ]
    logger(parts);
  }

  function router_logger(router){

    /*
    
      the router has denied access to a backend resource
      
    */
    router.on('error:security', function(req, error){
      var parts = [
        new Date().getTime(),
        'error:security',
        req.method.toLowerCase(),
        req.url,
        error
      ]
      logger(parts);
    })

    /*
    
      the router has denied access to a backend resource
      
    */
    router.on('error:search', function(req, error){
      var parts = [
        new Date().getTime(),
        'error:search',
        req.method.toLowerCase(),
        req.url,
        error
      ]
      logger(parts);
    })
    

    /*
    
      log requests going to backend warehouses via the router
      
    */
    router.on('request', function(req){
      var parts = [
        new Date().getTime(),
        'packet',
        req.method.toLowerCase(),
        req.url
      ]
      logger(parts);
    })
  }

  return {
    logger:logger,
    reception_logger:reception_logger,
    action_logger:action_logger,
    router_logger:router_logger
  }
}