var Reception = require('../src');

var app = Reception({
	"/mongo":function(req, reply){
		console.log('-------------------------------------------');
		console.log('mongo route');
	}
});

app.use(function(req, res){
  res.send('hello world');
})

var server = app.listen(8791, function(){
	console.log('-------------------------------------------');
	console.log('listening on port: ' + 8791);
})