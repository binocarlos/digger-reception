digger-reception
================

A REST based api server that 'mounts' functions as backend data suppliers.

## installation

	$ npm install digger-reception

## usage

You run a reception server as a stand-alone HTTP server or mounted onto another express application.

```js
var express = require('express');
var Reception = require('digger-reception');

// create a normal express application
var app = express();

// create a new reception server
var reception = Reception();

// add a new warehouse to the reception server
reception.warehouse('/my/location', function(req, reply){

})

// mount the reception server onto the express app
app.use('/api/v1/', reception);

app.listen(80);
```
