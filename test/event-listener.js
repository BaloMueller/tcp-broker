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

  describe('Login', function() {
    it('does not works with anything else than positive numbers', function() {
    	var conn = { 'isLoggedIn': false }

    	var inputs = ["", "abc", "-1", "a1"];
    	for(i=0; i<inputs.length; i++) {
    		expect(function() {listener.TryLogin(inputs[i], conn);})
	    		.to.throw('Client tried to log in with: ' + inputs[i]);
    	}
    });

    it('can\'t log in if user with this id already exists' , function() {
    	var conn = { 'isLoggedIn': false }

      listener.clients[0] = {};
  		expect(function() {listener.TryLogin("0", conn);})
  			.to.throw('Client tried to log in with id 0, which already exists.');
    });

    it('adds client for this id' , function() {
    	var conn = { 'isLoggedIn': false, 'on': sandbox.stub() }
      expect(Object.keys(listener.clients).length).to.equal(0);

  		listener.TryLogin("1", conn);

  		expect(Object.keys(listener.clients).length).to.equal(1);
  		expect(listener.clients[0]).not.exist();
  		expect(listener.clients[1]).exist();
    });

    it('does nothing for connections, that are already logged in' , function() {
      var initialObject = {}
      listener.clients[0] = initialObject;
      expect(listener.clients[0]).equal(initialObject);
    	
    	var otherObject = { 'isLoggedIn': true }
  		listener.TryLogin("0", otherObject);

  		expect(listener.clients[0]).equal(initialObject);
  		expect(listener.clients[0]).not.equal(otherObject);
    });
  });

  describe('Logout', function() {
    it('should remove client from list', function(){
      listener.clients[0] = {};
      expect(Object.keys(listener.clients).length).to.equal(1);
  		expect(listener.clients[0]).exist();

      listener.Logout(0);

      expect(Object.keys(listener.clients).length).to.equal(0);
  		expect(listener.clients[0]).not.exist();
    });
  });


  describe('broadcast event', function() {
    it('expected to be received by every listener', function(){
    	var rawMsg = '0|B';
    	var stubbedClient = { Send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[0] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'B',
				'raw': rawMsg
			});

			expect(stubbedClient.Send.calledOnce).to.be.true();
    });
  });

  describe('follow event', function() {
    it('expected follower to be added to this user', function(){
      listener.clients[0] = new Client(null);

      var followers = listener.clients[0].GetFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(0);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'F',
				'from': 1,
				'to': 0,
				'raw': '0|F|0|1'
			});

      followers = listener.clients[0].GetFollowers();
			expect(followers.length).to.equal(1);
			expect(followers[0]).to.equal(1);
    });
  });

  describe('unfollow event', function() {
    it('expected follower to be added to this user', function(){
			expect(Object.keys(listener.clients).length).to.equal(0);
      listener.clients[0] = new Client(null);
      listener.clients[0].AddFollower(1);

      var followers = listener.clients[0].GetFollowers();
			expect(followers).to.be.an('array');
			expect(followers.length).to.equal(1);

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'U',
				'from': 1,
				'to': 0,
				'raw': '0|U|1|0'
			});

      followers = listener.clients[0].GetFollowers();
			expect(followers.length).to.equal(0);
    });
  });

  describe('private message event', function() {
    it('expected message to be sent to the receipient', function(){
    	var rawMsg = '0|P|0|1';
    	var stubbedClient = { Send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[0] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'P',
				'from': 1,
				'to': 0,
				'raw': rawMsg
			});

			expect(stubbedClient.Send.calledOnce).to.be.true();
    });
  });

  describe('status update event', function() {
    it('expected message to be sent to the receipient', function(){
    	var rawMsg = '0|S|0|1';
      
      listener.clients[0] = new Client(null);
      listener.clients[0].AddFollower(1);
    	
    	var stubbedClient = { Send: sandbox.spy().withArgs(rawMsg) };
      listener.clients[1] = stubbedClient;

      listener.HandleMsgFromSender({
				'sequence': 0,
				'type': 'S',
				'from': 0,
				'raw': rawMsg
			});

			expect(stubbedClient.Send.calledOnce).to.be.true();
    });
  });
});