/*
 * Leader server
 *   Server for message-passing implementation
 *
 *   USEAGE: >> node leader.node.js <port number> <num nodes>
 *    Defaults to port 30000, two nodes
 */

 // Required libraries
var net = require('net');

// Read in command line arguments
var args = process.argv;
var port = 29188;
var nNodes = 2;
if (args.length == 4) { 
	port = args[2];
	nNodes = args[3];
} else {
	console.log ('Invalid cmd line arguments - \
	 USEAGE: node leader.node.js <port number> <num nodes> - \
	 using default args');
}

// Initialize shared state JSON Array
var sharedState = [];
for (var i=0; i<nNodes; i++) {
	sharedState[i] = [];
	for (var j=0; j<nNodes; j++) {
		sharedState[i][j]=[];
	}
}

// Initialize connection server
var server = net.createServer(function(socket) {
  console.log('server connected');
  
  socket.on('end', function() {
    console.log('server disconnected');
  });

  socket.on('data', function(data) {
	console.log('received data: ' + data);
	// we might have received multiple JSON requests, so these must be split
	var dataString = data.toString();
	var JSONlist = dataString.split("|").slice(0, -1);			// drop the last element in the array since it should be null
	console.log ("JSON list: " + JSONlist);

	for (var i=0; i<JSONlist.length; i++) {
		var toParse = JSONlist[i];
	  	var JSONdata = JSON.parse(toParse);
	  	var sender, receiver, data;
	  	
	  	// process 'send' request
	  	if (JSONdata["send"] != null) {
	  		console.log("received a send request");
	  		processSendReq(JSONdata, socket);

	  	// process 'receive request'
	  	} else if (JSONdata["receive"] != null) {
	  		console.log("received a receive request");
	  		processRecvReq(JSONdata, socket);

	  	// error - malformed request
	  	} else {
	  		console.log("received malformed request - not send or receive");
	  	}
	}
  });

});

// listen on port 
server.listen(port, "localhost", 10, function() {
  console.log('server bound');
});

// process a send request: update the shared state Array, reply with status
function processSendReq(JSONdata, socket) {
	// make sure we have a JSON array with the expected fields
	if (JSONdata["sender"] == null || JSONdata["receiver"] == null
		|| JSONdata["message"] == null) {
		console.log('received malformed send request - missing fields');
		socket.write("{'Error':'Malformed send request'");
		return;
	}

	var sender = JSONdata["sender"];
	var receiver = JSONdata["receiver"];
	var message = JSONdata["message"].toString();

	// check if sender/receiver exceed shared state bounds
	if (!validBounds(sender, receiver)) {
		console.log('received malformed send request - out of bounds');
		socket.write("{'Error':'Malformed send request'");
		return;
	}

	// update shared state array
	console.log('successfully received send message request');
	(sharedState[receiver][sender]).push(message);
	console.log('shared state updated:' + sharedState);
	socket.write("{'Message': 'Success!'}");
	return;

}

// process a receive request: send requested data to the socket
function processRecvReq(JSONdata, socket) {
	// make sure we have a JSON array with the expected fields
	if (JSONdata["sender"] == null || JSONdata["receiver"] == null) {
		console.log('received malformed send request - missing fields');
		socket.write("{'Error':'Malformed send request'}");
		return;
	}

	var sender = JSONdata["sender"];
	var receiver = JSONdata["receiver"];
	var message = "";

	// check if sender/receiver exceed shared state bounds
	if (!validBounds(sender, receiver)) {
		console.log('received malformed send request - out of bounds');
		socket.write("{'Error':'Malformed send request'}");
		return;
	}

	// update with reply
	if (sharedState[receiver][sender].length > 0) {
		// splice(0,1) is equivalent to removing the first element
		message = ((sharedState[receiver][sender]).splice(0,1))[0]; 
		console.log('outgoing message:' + message.toString());		
		socket.write("{'Message':" + message + "}" )
	}

}

// ------------------------ Utility Functions -----------------------------
// checkBounds: checks if receiver and sender are within bounds of the 
// number of nodes
function validBounds(sender, receiver) {
	return (sender >= 0 && sender < nNodes) || !(receiver >= 0 && receiver < nNodes)
}
