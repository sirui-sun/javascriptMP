/*
 * Node
 *   Node in message-passing implementation
 */

 // Required libraries
var net = require('net');
var NUM_RETRIES = 10;

function Node(totalNodes, nodeID, port) {
	this.totalNodes = totalNodes;
	this.nodeID = nodeID;
	this.nPort = port;
 	this.socket = new net.Socket();
 	this.toReturn = "";

 	// on data receipt, process and shut down
	this.socket.on('data', function(data) {
		var realData = data.toString();
		var dataStr = JSON.stringify(realData);
		console.log('Node received data: ' + dataStr);
		toReturn = dataStr;
	});
}

// send a request
Node.prototype.sendRequest = function(JSONdata)
{
	var JSONstring = JSON.stringify(JSONdata);
	this.socket.connect(this.nPort, function() {});
	console.log('attempting connection to port: ' + this.nPort);
	// try to write out to socket ten times - (is this the right way to do this?)
	for (var i=0; i<1; i++) {
		console.log("sending request: " + JSONstring);
		this.socket.write(JSONstring);
	}

	return this.toReturn;
};

// send a 'send' message
Node.prototype.sendMessage = function(toNode, msg) {
	var toSend = 
	{
		"send": "send"
		, "receiver": toNode
		, "sender": this.nodeID
		, "message": msg					
	}

	return this.sendRequest(toSend);
}

// send a 'receive' message
Node.prototype.receiveMessage = function(fromNode) {
	var toSend = 
	{
		"receive": "receive"
		, "receiver": this.nodeID
		, "sender": fromNode			
	}

	return this.sendRequest(toSend);
}

// -------------------- Test code --------------------------------
var port = 20000;

// -------------------- Test of server ---------------------------
// var toSend = 
// {
// 	"send": "send"
// 	, "receiver": 1
// 	, "sender": 0
// 	, "message": {"Hi": "From Node 0"}					
// }

// var toSendStr = JSON.stringify(toSend);
// var sock = new net.Socket();
// sock.on ('data', function(data) {
// 	var a = data.toString();
// 	console.log('received: ' + a);
// });
// sock.connect(20000, function() {});
// sock.write(toSendStr);


// -------------------- Test of nodes ---------------------------
var fromNode = new Node(2,0,port);

var toSend = '{"Hi": "From Node 0"}';
var response = fromNode.sendMessage(1, toSend);
console.log ('response from 1' + response);

var toNode = new Node(2,1,port);
response = toNode.receiveMessage(0);
console.log ('response frmo 2' + response);