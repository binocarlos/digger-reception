var Reception = require('../src');

var app = Reception();

app.use(function(req, res){
  res.send('hello world');
})

var server = app.listen(8791, function(){
})