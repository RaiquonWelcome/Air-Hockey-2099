var canvas = document.getElementById("canvas1"); //our drawing canvas

var player1 = {
  x: 100,
  y: canvas.height / 4,
  width: 50,
  height: 150,
  contact: false,
  active: false
};

var player2 = {
  x: 850,
  y: canvas.height / 4,
  width: 50,
  height: 150,
  contact: false,
  active: false
};

var ball = {
  x:500,
  y:canvas.height/2,
  xDirection: 1, //+1 for leftwards, -1 for rightwards
  yDirection: 1, //+1 for downwards, -1 for upwards

};

var goal1 = {
  x: 0,
  y: 0,
  width: 30,
  height: canvas.height

};

var goal2 = {
  x: canvas.width - 30,
  y: 0,
  width: 30,
  height: canvas.height
};

var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}
var mySound;
const playSound = () =>{
  mySound = new sound('airHockey.mp3');
  mySound.play();
};

const startCanvas = () => {

  var context = canvas.getContext("2d");
  context.fillStyle = "cyan";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas3

  context.font = "60px Arial";
  context.fillStyle = 'neon';
  context.fillText("JOIN THE GAME",canvas.width/2, canvas.height/2);


}


const drawCanvas = () => {

  var context = canvas.getContext("2d");

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas3

  //player 1 paddle
  if(player1.contact){
    context.fillStyle = 'magenta';
  }else if(player1.active){
    context.fillStyle = 'red';
  }else{
    context.fillStyle = 'gray';
  }
  context.fillRect(player1.x,player1.y,player1.width,player1.height);

  //player 2 paddle
  if(player2.contact){
    context.fillStyle = 'magenta';
  }else if(player2.active){
    context.fillStyle = 'blue';
  }else{
    context.fillStyle = 'white';
  }
  context.fillRect(player2.x,player2.y,player2.width,player2.height);

  context.beginPath();
  context.arc(
    ball.x, //x co-ord
    ball.y, //y co-ord
    25, //radius
    0, //start angle
    2 * Math.PI //end angle
  );
  context.strokeStyle = 'magenta';
  context.lineWidth = 10;
  context.stroke();


  //goal1
  context.fillStyle = 'blue';
  context.fillRect(goal1.x, goal1.y, goal1.width, goal1.height);

  //goal2
  context.fillStyle = 'red';
  context.fillRect(goal2.x, goal2.y, goal2.width, goal2.height);






}

//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;
var A_Key = 65;
var W_Key = 87;
var S_Key = 83;
var D_Key = 68;

//connect to server and retain the socket
var socket = io('http://' + window.document.location.host)
//var socket = io('http://localhost:3000')

socket.on('playerMovementData', function(data) {
  console.log("data: " + data);
  console.log("typeof: " + typeof data);
  var locationData = JSON.parse(data);
  player1.x = locationData.player1_X;
  player1.y = locationData.player1_Y;

  player2.x = locationData.player2_X;
  player2.y = locationData.player2_Y;

  ball.x = locationData.ball_X;
  ball.y = locationData.ball_Y;

  drawCanvas();
})


function handlePlayer1(){
  var canPlay;
  $.post("player1Data",function(data, status){

    var responseObj = JSON.parse(data);

    canPlay = responseObj.canPlay1;
    player1.active = canPlay;
    console.log(player1.active);


  });





}

function handlePlayer2(){
  var canPlay;
  $.post("player2Data",function(data, status){

    var responseObj = JSON.parse(data);

    canPlay = responseObj.canPlay2;
    player2.active = canPlay;

    console.log(player2.active);
  });


}


function handleStopPlayer1(){

  var canPlay;
  var isActive = player1.active;
  $.post("player1StopData",JSON.stringify(isActive), function(data, status){
    var responseObj = JSON.parse(data);

    canPlay = responseObj.canStop1;
    if(canPlay){
      player1.active = false;
    }

    console.log(player1.active);

  });

}

function handleStopPlayer2(){

  var canPlay;
  var isActive = player2.active;

  $.post("player2StopData", JSON.stringify(isActive), function(data, status){
    var responseObj = JSON.parse(data);

    canPlay = responseObj.canStop2;
    if(canPlay){
      player2.active = false;
    }

    console.log(player2.active);

  });

}

function handleKeyDown(e) {
  console.log("keydown code = " + e.which);
  var dXY = 25; //amount to move in both X and Y direction

  console.log(player1.active);
  if(player1.active){
    if (e.which == UP_ARROW && player1.y >= dXY) player1.y -= dXY; //up arrow

    if (
      e.which == RIGHT_ARROW &&
      player1.x + player1.width + dXY <= canvas.width
    ){
      player1.x += dXY; //right arrow
    }

    if (e.which == LEFT_ARROW && player1.x >= dXY) player1.x -= dXY; //left arrow

    if (
      e.which == DOWN_ARROW &&
      player1.y + player1.height + dXY <= canvas.height
    ){
      player1.y += dXY; //down arrow
    }

  }

  if(player2.active){
    if (e.which == W_Key && player2.y >= dXY) player2.y -= dXY; //w

    if (
      e.which == D_Key &&
      player2.x + player2.width + dXY <= canvas.width
    ){
      player2.x += dXY; //d
    }

    if (e.which == A_Key && player2.x >= dXY) player2.x -= dXY; //a

    if (
      e.which == S_Key &&
      player2.y + player2.height + dXY <= canvas.height
    ){
      player2.y += dXY; //s
    }

  }


  //upate server with position data
  //may be too much traffic?
  var dataObj = { player1_X: player1.x, player1_Y: player1.y, player2_X: player2.x, player2_Y: player2.y, ball_X: ball.x, ball_Y: ball.y};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //update the server with a new location of the moving box
  //update the server with a new location of the moving box
  socket.emit('playerMovementData', jsonString)
}

function handleKeyUp(e) {
  console.log("key UP: " + e.which);
  var dataObj = { player1_X: player1.x, player1_Y: player1.y, player2_X: player2.x, player2_Y: player2.y, ball_X: ball.x, ball_Y: ball.y};
  //create a JSON string representation of the data object
  var jsonString = JSON.stringify(dataObj);

  //update the server with a new game data
    socket.emit('playerMovementData', jsonString)
}

function handleBallMovement(){
	 ball.x = (ball.x + 12 * ball.xDirection);
	 ball.y = (ball.y + 12 * ball.yDirection);

	//keep inbounds of canvas
	if(ball.x + 25 > canvas.width) {
    ball.xDirection = -1;

  }

	if(ball.x < 0) {
    ball.xDirection = 1;

  }

	if(ball.y > canvas.height) {
    ball.yDirection = -1;

  }
	if(ball.y - 25 < 0) {
    ball.yDirection = 1;

  }


  //if hits players the ball bounces the other way
  if(ball.x - 25 < (player1.x + player1.width)){
    if(ball.y > player1.y){
      if(ball.y < player1.y + player1.height){
        ball.xDirection = 1;
        player1.contact = true;
        playSound();
        var dataObj = { player1_X: player1.x, player1_Y: player1.y, player2_X: player2.x, player2_Y: player2.y, ball_X: ball.x, ball_Y: ball.y};

        //create a JSON string representation of the data object
        var jsonString = JSON.stringify(dataObj);

        //update the server with a new location of the Players and ball
        socket.emit('playerMovementData', jsonString)
        return;
      }
    }
  }

  if(ball.x + 25 > player2.x){
    if(ball.y > player2.y){
      if(ball.y < player2.y + player2.height){
        ball.xDirection = -1;
        player2.contact = true;
        playSound();
        var dataObj = { player1_X: player1.x, player1_Y: player1.y, player2_X: player2.x, player2_Y: player2.y, ball_X: ball.x, ball_Y: ball.y};
        //create a JSON string representation of the data object
        var jsonString = JSON.stringify(dataObj);

        //update the server with a new location of the Players and ball
        socket.emit('playerMovementData', jsonString)
        return;
      }
    }
  }


  player1.contact = false;
  player2.contact = false;
  drawCanvas();

}

var startTimer = false;

//removes the startButton
// changes the canvas to drawCanvas
var startButtonHandler = () => {
  var start = document.getElementById('startButton');
  startTimer = true;
  drawCanvas();
  start.parentNode.removeChild(start);
  if(startTimer) timer = setInterval(handleBallMovement, 100);
}




$(document).ready(function() {
  startCanvas();

  $(document).keydown(handleKeyDown);
  $(document).keyup(handleKeyUp);






});
