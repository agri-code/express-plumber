/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-expressions */
/* eslint-env mocha */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
const chaiHttp = require('chai-http');
const chai = require('chai');

// eslint-disable-next-line no-unused-vars
const should = chai.should();
chai.use(chaiHttp);
const server = require('./server');

const chaiAppServer = chai.request(server).keepOpen();

const randomRange = (min, max) => parseInt(Math.random() * (max - min) + min, 10);
// Our parent block

describe('Methods', () => {
  after(() => {
    chaiAppServer.close(() => {
      process.exit(0);
    });
  });
  describe('GET /', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === OK', (done) => {
      chai.request(server).get('/').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('OK');
        done();
      });
    });
  });
  describe('POST /', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === `POSTed`', (done) => {
      chai.request(server).post('/').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('POSTed');
        done();
      });
    });
  });
  describe('DELETE /', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === `DELETED`', (done) => {
      chai.request(server).delete('/').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('DELETED');
        done();
      });
    });
  });
  describe('PATCH /', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === `PATCHED`', (done) => {
      chai.request(server).patch('/').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('PATCHED');
        done();
      });
    });
  });
  describe('PUT /', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === `PUT`', (done) => {
      chai.request(server).put('/').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('PUT');
        done();
      });
    });
  });
  describe('GET /demo', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `message` === `DEMO`', (done) => {
      chai.request(server).get('/demo').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.message.should.be.equal('DEMO');
        done();
      });
    });
  });
  describe('GET /demo/over9000', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `id` === `over9000`', (done) => {
      chai.request(server).get('/demo/over9000').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.id.should.be.equal('over9000');
        done();
      });
    });
  });
  describe('Parametrized route path /demo/byId/1337', () => {
    it('Should return a json document with status code 200, prop `code` === 200 && `id` === 1337', (done) => {
      chai.request(server).get('/demo/byId/1337').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.code.should.be.equal(200);
        res.body.demo.should.be.equal('demo');
        res.body.byId.should.be.equal('byId');
        res.body.id.should.be.equal(1337);
        done();
      });
    });
  });
  describe('Catchall', () => {
    it('GET /Catch/All Should return a json document with status code 200, prop `code` === 200 && `id` === `catchAll`', (done) => {
      chai.request(server).get('/Catch/All').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('code');
        res.body.should.have.property('id');
        res.body.code.should.be.equal(200);
        res.body.id.should.be.equal('catchAll');
        done();
      });
    });
    it('GET /Catch/Any Should return a json document with status code 200, prop `code` === 200 && `id` === `catchAll`', (done) => {
      chai.request(server).get('/Catch/Any').end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('code');
        res.body.should.have.property('id');
        res.body.code.should.be.equal(200);
        res.body.id.should.be.equal('catchAll');
        done();
      });
    });
    for (let i = 0; i < 10; i += 1) {
      const segments = [];
      const chars = ['o', 'v', 'e', 'r', '9', '0', '!', ':', '_', '-'];
      for (let i2 = 0; i2 < randomRange(3, 20); i2 += 1) {
        const randomPathSegment = chars[randomRange(0, chars.length)]
        + randomRange(100000, 999999).toString()
        + chars[randomRange(0, chars.length)];
        randomPathSegment[randomRange(1, randomPathSegment.length - 1)] = chars[randomRange(0, chars.length)];
        segments.push(randomPathSegment);
      }
      const randomPath = `/${chars[randomRange(0, chars.length)]}/random/${segments.join('/')}`;
      it(`GET ${randomPath} Should return a json document with status code 200, prop \`code\` === 200 && \`id\` === \`catchAll\``, (done) => {
        chai.request(server).get(randomPath).end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.code.should.be.equal(200);
          res.body.id.should.be.equal('catchAll');
          done();
        });
      });
    }
  });
});
