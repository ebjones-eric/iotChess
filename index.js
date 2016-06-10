var Chess = require('chess.js').Chess;
var chess = new Chess();
var AWS = require('aws-sdk');
var ses = new AWS.SES({apiVersion: '2010-12-01'});
var sqs = new AWS.SQS({region:'eu-east-1'}); 
AWS.config.region="us-east-1";
console.log('Loading Function');
exports.handler = function(event, context) {
console.log('handler');

function length( object ) {
    return Object.keys(object).length;
}

function shuffle( object ) {
    for (var i = 0; i < object.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (object.length - i));

        var temp = object[j];
        object[j] = object[i];
        object[i] = temp;
    }
    return object;
}

function chessTurn( fen, move ){
    chess.load( fen )
    chess.move( move );
    writeOut();
}

chessTurn(event.fen, event.move);

function writeOut(){
console.log("\nbegin sending email\n");
var emailSubject = "iotChess";
var emailBody;
shuffled=shuffle(chess.moves({verbose: true}))

if ( length(chess.moves({ verbose: true }))>=3){
emailBody = "\n<pre>\nYour iotChess game has been updated.\nHere\'s what the board looks like now:\n\n" + chess.ascii()+"\n" +"\n\n" +"Make the next move.\nChoose from:\n\n" + shuffled[0].san+"[sgl click] move "+shuffled[0].piece+" from "+shuffled[0].from+" to "+shuffled[0].to+ "\n" + shuffled[1].san+"[dbl click] move "+shuffled[1].piece+" from "+shuffled[1].from+" to "+shuffled[1].to+ "\n" + shuffled[2].san+"[lng click] move "+shuffled[2].piece+" from "+shuffled[2].from+" to "+shuffled[2].to+ "\n\n fen:"+chess.fen()+"</pre>";
}

else if(length(chess.moves({ verbose: true })) == 2){
emailBody = "\n<pre>\nYour iotChess game has been updated.\nHere\'s what the board looks like now:\n\n" + chess.ascii()+"\n" +"\n\n" +"Make the next move.\nChoose from:\n\n" +shuffled[0].san+"[sgl click] move "+shuffled[0].piece+" from "+shuffled[0].from+" to "+shuffled[0].to+ "\n" +shuffled[1].san+ "[dbl click] move "+shuffled[1].piece+" from "+shuffled[1].from+" to "+shuffled[1].to+"\n\n fen:"+chess.fen()+"</pre>";
}


else if(length(chess.moves({ verbose: true })) == 1){
emailBody = "\n<pre>\nYour iotChess game has been updated.\nHere\'s what the board looks like now:\n\n" + chess.ascii()+"\n" +"\n\n" +"Make the next move.\nChoose from:\n\n" + shuffled[0].san+"[sgl click] move "+shuffled[0].piece+" from "+shuffled[0].from+" to "+shuffled[0].to+"\n\n fen:"+chess.fen()+"</pre>";
}

else if(length(chess.moves({ verbose: true })) === 0){
emailBody = "\n<pre>\nYour iotChess game has been updated.\nHere\'s what the board looks like now:\n\n" + chess.ascii()+"\n" + "CHECK MATE!!!" +"\n\n fen:"+chess.fen()+"</pre>";
}

var CRLF = '\r\n'
var ses = require('node-ses')
var client = ses.createClient({ key: '####', secret: '****'})
var rawMessage = [
    'From: "iotChess" <sesconfirmedemail-1@domain.com>',
    'To: "Eric" <sesconfirmedemail-2@domain.com>',
    'Subject: iotChess Match',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    emailBody,
    ''
  ].join(CRLF);
 
console.log(rawMessage);

client.sendRawEmail({
 from: 'sesconfirmedemail-1@domain.com' , rawMessage: rawMessage
}, function (err, data, res) {  if (err) {console.log(err);}
console.log (data);
//console.log (res);
var msg = { fen: chess.fen() };

var sqsParams = {
  MessageBody: JSON.stringify(msg),
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/############/iotChess'
};

sqs.sendMessage(sqsParams, function(err, data) {
  if (err) {
    console.log('ERR', err);
  }

  console.log(data);
  context.done(null, data);
});
});
}
}



