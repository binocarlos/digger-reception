var Reception = require('../src');
var request = require('request');

describe('reception', function(){

  it('should be a function', function() {

    Reception.should.be.a('function');

  })

  it('should serve HTTP', function(done) {
    var app = Reception();

    app.use(function(req, res){
      res.send('hello world');
    })

    var server = app.listen(8967, function(){
      request('http://127.0.0.1:8967/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body.should.equal('hello world');
          server.close();
          done();
        }
        else{
          throw new Error(response.statusCode + ' - ' + error);
        }
      })
    })

  })

  it('should serve containers', function(done) {
    var app = Reception();

    app.use(function(req, res){
      res.containers([{
        name:'test',
        price:10
      }])
    })

    var server = app.listen(8967, function(){
      request('http://127.0.0.1:8967/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response.headers['content-type'].should.equal('application/json');
          server.close();
          done();
        }
        else{
          throw new Error(response.statusCode + ' - ' + error);
        }
      })
    })

  })

})
