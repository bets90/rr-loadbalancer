var should = require('should');
var assert = require('assert');
var request = require('supertest');

// to run test install mocha globally (npm install -g mocha)
// and run 'mocha' on project root folder

describe('loadbalancer test', function () {
    var url = 'http://localhost:3000';
    describe('test for requisition of svt1 channel access', function () {
        it('should return json with url information', function (done) {
            var profile = {
                channelId : 'svt1'
            };
            request(url)
                .post('/allocatestream')
                .send(profile)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err,res) {
                    if(err) {
                        throw err;      
                    }
                    res.body.should.have.property('url');
                    res.body.should.not.have.property('secret');
                    res.body.url.should.equal('http://video1.neti.systems/svt1?token=12345');
                    done();
                });
        }); 
    });
});

