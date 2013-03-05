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
 	this.toReturn = "nothing";

 	this.socket.connect(this.nPort, "localhost", function () {
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

	this.sendRequest(toSend);

	// listen for data receipt
	this.socket.on('data', callback);
}

// -------------------- Test code --------------------------------
var port = 12345;

// -------------------- Basic test of nodes ---------------------------
var fromNode = new Node(2,0,port);

var jsonToSend = {"Message": [{"text": "Come down to the #ccsusoftball field and support your @CCSUBlueDevils in their home opener vs. Yale #ItsNotThatCold...yet", "created_at": "Tue Mar 05 19:29:31 +0000 2013", "id_str": "309022883278102528"}, {"text": "Need a mid-day laugh? Evolution of Mom Dancing #video with @MichelleObama + @jimmyfallon is hilarious http://t.co/Oz3tdnS8Ff", "created_at": "Tue Mar 05 19:29:06 +0000 2013", "id_str": "309022780425379840"}, {"text": "Yale team to explore needs of low-carbon cities of the future | YaleNews http://t.co/cVg89dg60l", "created_at": "Tue Mar 05 19:28:12 +0000 2013", "id_str": "309022552179761153"}, {"text": "Just got 3 new letters 2georgia 1from Yale #Blessed", "created_at": "Tue Mar 05 19:28:00 +0000 2013", "id_str": "309022501378326529"}, {"text": "@isa_isola @Amon_Alex ed io? dai con me non puoi usare la scusa di Yale...", "created_at": "Tue Mar 05 19:27:59 +0000 2013", "id_str": "309022496340987904"}, {"text": "bloody Yale lock", "created_at": "Tue Mar 05 19:27:51 +0000 2013", "id_str": "309022465449930753"}, {"text": "Ithinina injongo yale daddy 24/7 ngaphandle nje kwezi moffie zababa tata bancwasene kwabodwa!", "created_at": "Tue Mar 05 19:27:28 +0000 2013", "id_str": "309022368662159360"}, {"text": "Tarell Alvin McCraney Wins $150,000 From Yale University http://t.co/6OwgOpkHSG via @cultistmiami", "created_at": "Tue Mar 05 19:27:24 +0000 2013", "id_str": "309022351440371713"}, {"text": "@kipmurkomen congrats on ur election to senate..yale ulisema ndo sasa uyatende:-) apparently the court will decide % votes garnered.", "created_at": "Tue Mar 05 19:26:28 +0000 2013", "id_str": "309022114357338112"}, {"text": "Thank you @PeterDavisNYC.  Fantastic #dianavreeland and our @Yale slippers with @YaleAlumni husband Reed. http://t.co/QqYP2oPoDQ", "created_at": "Tue Mar 05 19:26:27 +0000 2013", "id_str": "309022111169671168"}, {"text": "Wrexham commoner! But damn we scrub up well! Yale were sexy and we know it ;) #GECCymru2013", "created_at": "Tue Mar 05 19:26:23 +0000 2013", "id_str": "309022095801716737"}, {"text": "@LaBomba_Televen dios qur\u00a1e suspenso", "created_at": "Tue Mar 05 19:26:12 +0000 2013", "id_str": "309022050675224576"}, {"text": "@kael_kelyne hey! Ofcourse I remember Yale University;) lol I'm also an #EmmaLover", "created_at": "Tue Mar 05 19:25:46 +0000 2013", "id_str": "309021938670526464"}, {"text": "@yale_xoxo why thank you", "created_at": "Tue Mar 05 19:25:12 +0000 2013", "id_str": "309021796001251328"}, {"text": "I guess Yale football wants my transcripts?", "created_at": "Tue Mar 05 19:24:53 +0000 2013", "id_str": "309021715835527168"}]}
fromNode.sendMessage(1, jsonToSend, function() {

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
