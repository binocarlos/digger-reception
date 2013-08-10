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
      request('http://127.0.0.1:8967/ping', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body.should.equal('pong');
          server.close();
          done();
        }
        else{
          throw new Error(response.statusCode + ' - ' + error);
        }
      })
    })

  })

  it('should serve json apis', function(done) {
    var app = Reception();

    app.digger('/myapi', function(req, reply){
      reply(null, {test:10})
    })

    var server = app.listen(8967, function(){
      request({
        url:'http://127.0.0.1:8967/myapi/select',
        method:'post',
        json:{
          selector:{
            tag:'test'
          }
        }
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response.headers['content-type'].should.equal('application/json');
          body.test.should.equal(10);
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
