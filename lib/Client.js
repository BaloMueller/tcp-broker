/**
 * Client constructor.
 *
 * @api public
 */

function Client(conn){
	var that = this;
	this.conn = conn;
	this.followers = new Array();
};

Client.prototype.followers = null;

/**
 * Sends a message to this Client.
 *
 * @api public
 */

Client.prototype.send = function(msg) {
  this.conn.write(msg + '\r\n');
};

Client.prototype.getFollowers = function() {
  return this.followers.slice();
};

Client.prototype.addFollower = function(id) {
  this.followers.push(id);
};

Client.prototype.removeFollower = function(id) {
	var index = this.followers.indexOf(id);
	if (index > -1) {
    this.followers.splice(index, 1);
	}
};

module.exports = Client;