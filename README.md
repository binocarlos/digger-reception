digger-reception
================

The core router component of a digger stack.

## installation

	$ npm install digger-reception

## usage

The reception server is a [digger-warehouse](https://github.com/binocarlos/digger-warehouse) that sits in between web applications and data warehouses on a digger network.

The reception is basically one big fat router.

It emits 'request' events when it wants to contact a backend service.

```js
var Reception = require('digger-reception');

var reception = Reception();

/*

	any requests will pass through this function BEFORE they are routed to a backend warehouse

	this gives you a chance to do authentication and routing
	
*/
reception.add_router(function(req, reply, next){

})

/*

	a packet is wanting to be sent back to a warehouse
	
*/
reception.on('request', function(packet, reply){

})

```

## licence

MIT