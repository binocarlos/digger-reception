var Reception = require('../src');
var request = require('request');

describe('reception', function(){

  it('should be a function', function(done) {

    var warehouse = Reception();
    warehouse.should.be.a('function');
    done();

  })

  it('should serve HTTP', function(done) {
    var server = Reception();

    server.use(function(req, res){
      res.send('hello world');
    })

    server.listen(8967, function(){
      request('http://127.0.0.1:8967/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body.should.equal('hello world');
          done();
        }
        else{
          throw new Error(reponse.statusCode + ' - ' + error);
        }
      })
    })

  })

})
