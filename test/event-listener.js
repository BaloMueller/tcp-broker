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
    listener;

describe('Listeners', function() {

	before(function() {
    mockery.enable();
  });

	beforeEach(function(){
    mockery.registerAllowables(['net','events','./Client.js']);
    mockery.registerMock('../lib/Client.js', stubbedClient);
    mockery.registerAllowable('../lib/event-listener.js', true);

		EventEmitter = require('events').EventEmitter;
		eventEmitter = new EventEmitter();
		Listener = require('../lib/event-listener.js');
		listener = new Listener(eventEmitter);;
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
});