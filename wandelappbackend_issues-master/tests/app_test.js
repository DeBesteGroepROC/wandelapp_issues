/*
    UNIT TESTS en INTEGRATION TESTS

    Gebruik Terminal en ga naar de folder andelappbackend_issues_v2 (of gebruik de terminal in Webstorm die al in de juiste folder staat)
    Om lokaal te starten:
    mongod
    npm start

    Om de tests uit te voeren:
    npm test

    MongoDB heeft ook een http interface. In dat geval mongodb als volgt opstarten:
    mongod --httpinterface --rest -vv (-vv geeft alle query's in terminal)
    dan naar http://localhost:28017

    MongoDB API reference (is different then mongo shell!): http://mongodb.github.io/node-mongodb-native/2.2/api/index.html
    Chai test library official docs: http://chaijs.com/
    Chai test library cheat sheet: https://gist.github.com/yoavniran/1e3b0162e1545055429e
    Chat-http test library (voor het testen van request naar de app): http://chaijs.com/plugins/chai-http/, https://github.com/chaijs/chai-http
*/

const server = require('../server'),
    chai     = require('chai'),
    chaiHTTP = require('chai-http'),
    should   = chai.should(),
    mongo_cs = require('../model/mongo_init').mongo_init(process.env),
    usrs     = require('../model/users').users(mongo_cs.mongoURL),
    wrs      = require('../model/wandelroutes').wandelroutes(mongo_cs.mongoURL),
    fs       = require('fs');

let temp_cuid;

chai.use(chaiHTTP);

reqServer = process.env.HTTP_TEST_SERVER || server;

describe('GET to ', () => {

    it('/ should return 200', function(done){
        chai.request(reqServer)
            .get('/')
            .end(function(err, res) {
                res.should.have.status(200);
                done();
            })

    });

    it('/cuid should return cuid in response', function(done){
        chai.request(reqServer)
            .get('/cuid')
            .end(function(err, res) {
                const r = JSON.parse(res.text);
                temp_cuid = r.cuid;
                chai.expect(r.cuid).not.to.be.empty;
                done();
            })

    });

    it('/health should return i\'m ok', function(done){
        chai.request(reqServer)
            .get('/health')
            .end(function(err, res) {
                const r = JSON.parse(res.text);
                chai.expect(r.health).to.equal('Im OK!');
                done();
            })

    });

});

describe('MONGODB', () => {
    it('connect mongodb', (done) => {
            const MongoClient = require('mongodb').MongoClient;
            MongoClient.connect('mongodb://localhost:27017/wandelappbackendv2', function (err, db) {
                    chai.expect(db).to.be.an('object'); //check is db available
                    done();
                }
            );
        }
    );
});

describe('MONGODB USERS', () => {
    it('add user', (done) => {
        usrs.add_user({cuid: 'testmagweg', ip: '127.0.0.1', created: new Date()}, (result) => {
            chai.expect(result).to.equal(true);
            done();
        })

    });

    it('add second user', (done) => {
        usrs.add_user({cuid: 'testmagweg2', ip: '127.0.0.1', created: new Date()}, (result) => {
            chai.expect(result).to.equal(true);
            done();
        })

    });

    it('list users', (done) => {
        usrs.users((result) => {
            chai.expect(result).to.be.an('array').that.is.not.empty;
            done();
        })

    });

    it('find user', (done) => {
        usrs.finduser({cuid: 'testmagweg'}, (result) => {
            chai.expect(result).to.be.an('object').that.is.not.empty;
            done();
        })

    });
});

describe('POST to ', () => {
    it('/upload of gpx file should return no errors', function(done){
        chai.request(reqServer)
            .post('/upload?cuid=' + temp_cuid)
            .set('Content-Type', 'text/plain; charset=utf-8')
            .attach('gpx file', fs.readFileSync('./tests/route.gpx'), 'dummy.gpx')
            .end(function(err, res) {
                const r = JSON.parse(res.text);
                chai.expect(r.error).not.equal(true);
                done();
            });
        // done();
    });
});

describe('MONGODB WANDELROUTES', () => {
    it('add route', (done) => {
        wrs.add_route({cuid: 'testmagweg2', dummydata: new Date()}, (result) => {
            chai.expect(result).to.equal(true);
            done();
        })

    });

    it('list routes', (done) => {
        wrs.routes((result) => {
            chai.expect(result).to.be.an('array');
            done();
        })

    });

    it('find route', (done) => {
        wrs.findroute({cuid: 'testmagweg2'}, (result) => {
            chai.expect(result).to.be.an('object').that.is.not.empty;
            done();
        })

    });
});

describe('GET to ', () => {
    it('/routes should return an array', function(done){
        chai.request(reqServer)
            .get('/routes?cuid=' + temp_cuid)
            .end(function(err, res) {
                const r = JSON.parse(res.text);
                chai.expect(r[0].cuid).to.equal(temp_cuid);
                done();
            })
    });
});

describe('MONGODB USERS', () => {
    it('delete all users should succees', (done) => {
        usrs.deleteall((result) => {
            chai.expect(result).to.equal(true);
            done();
        });
    });

    it('delete all wandelroutes should succeed', (done) => {
        wrs.deleteall((result) => {
            chai.expect(result).to.equal(true);
            done();
        });
    });
});

