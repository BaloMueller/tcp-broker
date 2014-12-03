/**
 * Client constructor.
 *
 * @api public
 */

function Client(eventEmitter, conn){
	var that = this;

	this.eventEmitter = eventEmitter;
	this.conn = conn;
};

Client.prototype.Followers = [];

/**
 * Sends a message to this Client.
 *
 * @api public
 */

Client.prototype.send = function(msg) {
  this.conn.write(msg + '\r\n');
};

Client.prototype.getFollowers = function() {
  return this.Followers.slice();
};

Client.prototype.addFollower = function(id) {
  followers.push(id);
};

Client.prototype.removeFollower = function(id) {
	var index = this.Followers.indexOf(id);
	if (index > -1) {
    followers.splice(index, 1);
	}
};

module.exports = Client;