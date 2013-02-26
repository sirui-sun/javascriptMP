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

 	this.socket.connect(this.nPort, function () {
 		console.log ('socket connected to port ' + port);
 	})

 	// on data receipt, process and shut down
	this.socket.on('data', function(data) {
		var realData = data.toString();
		var dataStr = JSON.stringify(realData);
		console.log('Node received data: ' + dataStr);
		toReturn = dataStr;
	});

	this.socket.on('end', function() {
    	console.log('socket disconnected');
  	});
}

// send a request
Node.prototype.sendRequest = function(JSONdata, callback)
{
	var JSONstring = JSON.stringify(JSONdata);// + "|";
	console.log('writing: ' + JSONstring);
	this.socket.write(JSONstring, 'utf8', callback);
};

// send a 'send' message
Node.prototype.sendMessage = function(toNode, msg, callback) {
	var toSend = 
	{
		"send": "send"
		, "receiver": toNode
		, "sender": this.nodeID
		, "message": msg					
	}

	this.sendRequest(toSend, callback);
}

// send a 'receive' message
Node.prototype.receiveMessage = function(fromNode, callback) {
	var toSend = 
	{
		"receive": "receive"
		, "receiver": this.nodeID
		, "sender": fromNode			
	}

	this.sendRequest(toSend, callback);
}

// -------------------- Test code --------------------------------
var port = 29188;

// -------------------- Basic test of nodes ---------------------------
var fromNode = new Node(2,0,port);

var toSend = "{'Hi': 'From Node 0'}";
fromNode.sendMessage(1, toSend, function() {
	var toNode = new Node(2,1,port);
	toNode.receiveMessage(0);
});

// -------------------- Test multiple receives  ----------------
// var send1 = new Node(3,0,port);
// var send2 = new Node(3,1,port);

// var sendMsg = "{'Hi': 'from node 1'}";
// var response = send1.sendMessage(2, sendMsg);
// var sendMsg = "{'Hi': 'from node 2'}";
// var response = send2.sendMessage(2, sendMsg, function() {
// 	var recv = new Node(3,2,port);
// 	recv.receiveMessage(0);
// 	recv.receiveMessage(1);
// });

// -------------- Test multiple messages on same channel ----------------
// var send = new Node(2,0,port);

// var sendMsg = "{'Hi': 'first message'}";
// send.sendMessage(1, sendMsg);

// var send = new Node(2,0,port);
// var sendMsg = "{'Hi': 'second message'}";
// send.sendMessage(1, sendMsg);

// var recv = new Node(2,1,port);
// response = recv.receiveMessage(0);
// console.log ('first receive: ' + response);

// var recv = new Node(2,1,port);
// response = recv.receiveMessage(1);
// console.log ('second receive: ' + response);
