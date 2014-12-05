var expect = require('chai').expect,
    sinon = require('sinon'),
    mockery = require('mockery');

var sandbox = sinon.sandbox.create(),
    stubbedClient = {
        send: sandbox.stub()
    },
    EventEmitter,
    eventEmitter,
    Listener,
    listener,
    Client;

describe('Listeners', function() {

	before(function() {
    mockery.enable();
  });

	beforeEach(function(){
    mockery.registerAllowables(['net','events','./Client.js', '../lib/Client.js']);
    //mockery.registerMock('../lib/Client.js', stubbedClient);
    mockery.registerAllowable('../lib/event-listener.js', true);

		EventEmitter = require('events').EventEmitter;
		eventEmitter = new EventEmitter();
		Listener = require('../lib/event-listener.js');
		listener = new Listener(eventEmitter);
    Client = require('../lib/Client.js');
	});

  afterEach(function() {
    mockery.deregisterAll();
  });

  after(function() {
    mockery.disable();
  });

  describe('broadcast event', function() {
    it('expected to be received by every listener', function(){
      listener.clients[0] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'B',
				'msg': '0|B'
			});

			stubbedClient.send.yields();
			expect(stubbedClient.send.calledOnce).to.be.true();
    });
  });

  describe('follow event', function() {
    it('expected follower to be added to this user', function(){
      listener.clients[0] = new Client(null);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'F',
				'from': 1,
				'to': 0,
				'msg': '0|F|0|1'
			});

      var followers = listener.clients[0].getFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(1);
			expect(followers[0]).to.equal(1);
    });
  });

  describe('unfollow event', function() {
    it('expected follower to be added to this user', function(){
			expect(Object.keys(listener.clients).length).to.equal(0);
      listener.clients[0] = new Client(null);
      //listener.clients[0].addFollower(1);

      var followers = listener.clients[0].getFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(1);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'U',
				'from': 1,
				'to': 0,
				'msg': '0|U|0|1'
			});

      var followers = listener.clients[0].getFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(0);
    });
  });
});