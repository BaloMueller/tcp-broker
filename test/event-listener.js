var expect = require('chai').expect,
    sinon = require('sinon'),
    mockery = require('mockery');

var sandbox = sinon.sandbox.create(),
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
    	var rawMsg = '0|B';
    	var stubbedClient = { send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[0] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'B',
				'raw': rawMsg
			});

			expect(stubbedClient.send.calledOnce).to.be.true();
    });
  });

  describe('follow event', function() {
    it('expected follower to be added to this user', function(){
      listener.clients[0] = new Client(null);

      var followers = listener.clients[0].getFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(0);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'F',
				'from': 1,
				'to': 0,
				'raw': '0|F|0|1'
			});

      followers = listener.clients[0].getFollowers();
			expect(followers.length).to.equal(1);
			expect(followers[0]).to.equal(1);
    });
  });

  describe('unfollow event', function() {
    it('expected follower to be added to this user', function(){
			expect(Object.keys(listener.clients).length).to.equal(0);
      listener.clients[0] = new Client(null);
      listener.clients[0].addFollower(1);

      var followers = listener.clients[0].getFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(1);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'U',
				'from': 1,
				'to': 0,
				'raw': '0|U|1|0'
			});

      followers = listener.clients[0].getFollowers();
			expect(followers.length).to.equal(0);
    });
  });

  describe('private message event', function() {
    it('expected message to be sent to the receipient', function(){
    	var rawMsg = '0|P|0|1';
    	var stubbedClient = { send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[0] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'P',
				'from': 1,
				'to': 0,
				'raw': rawMsg
			});

			expect(stubbedClient.send.calledOnce).to.be.true();
    });
  });

  describe('status update event', function() {
    it('expected message to be sent to the receipient', function(){
    	var rawMsg = '0|S|0|1';
      
      listener.clients[0] = new Client(null);
      listener.clients[0].addFollower(1);
    	
    	var stubbedClient = { send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[1] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'S',
				'from': 0,
				'raw': rawMsg
			});

			expect(stubbedClient.send.calledOnce).to.be.true();
    });
  });
});