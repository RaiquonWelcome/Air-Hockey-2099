
const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs"); //need to read static files
const url = require("url"); //to parse url strings

const PORT = process.env.PORT || 3000
app.listen(PORT) //start server listening on PORT


const counter = 1000; //to count invocations of function(req,res)

//server maintained location of moving box
//let movingBoxLocation = { x: 100, y: 100 }; //will be over-written by clients

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};

var isPlayer1 = false;
var isPlayer2 = false;



function get_mime(filename) {
  let ext, type
  for (let ext in MIME_TYPES) {
    type = MIME_TYPES[ext]
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type
    }
  }
  return MIME_TYPES["txt"]
}


function handler(request, response) {

//app.listen(PORT) //start server listening on PORT

    let urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let receivedData = ""

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      console.log("REQUEST END: ")
      console.log("received data: ", receivedData)
      console.log("type: ", typeof receivedData)

      //if it is a POST request then echo back the data.
      /*
		A post message will be interpreted as either a request for
		the location of the moving box, or the location of the moving box
		being set by a client.
		If the .x and .y attributes are >= 0
		treat it as setting the location of the moving box.
		If the .x and .y attributes are < 0 treat it as a request (poll)
		for the location of the moving box.
		In either case echo back the location of the moving box to whatever client
		sent the post request.

		Can you think of a nicer API than using the numeric value of .x and .y
		to indicate a set vs. get of the moving box location.
		*/
      //if its false then make true
      //return true
      //if its true return false
      var responseObj ={};
      if(request.method == "POST" && request.url == "/player1Data") {

        if(isPlayer1){
          responseObj.canPlay1 = false;
        }else{
          responseObj.canPlay1 = true;
          isPlayer1 = true;
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(JSON.stringify(responseObj));
      }

      if(request.method == "POST" && request.url == "/player2Data") {

        if(isPlayer2){
        responseObj.canPlay2 = false;
        }else{
        responseObj.canPlay2 = true;
          isPlayer2 = true;
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(JSON.stringify(responseObj));
      }

      if(request.method == "POST" && request.url == "/player1StopData") {

        if(isPlayer1 && receivedData){
          responseObj.canStop1 = true;
          isPlayer1 = false;
        }else{
          responseObj.canStop1 = false;
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(JSON.stringify(responseObj));
      }

      if(request.method == "POST" && request.url == "/player2StopData") {
        if(isPlayer2 && receivedData){
          responseObj.canStop2 = true;
          isPlayer2 = false;
        }else{
          responseObj.canStop2 = false;
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(JSON.stringify(responseObj));
      }


      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          })
          response.end(data)
        })
      }
    })
}

io.on('connection', function(socket){
  socket.on('playerMovementData', function(data){
    console.log('RECEIVED PLAYERS DATA: ' + data)
    //to broadcast message to everyone including sender:
    io.emit('playerMovementData', data) //broadcast to everyone including sender
  })
})






console.log("Server Running at PORT: 3000  CNTL-C to quit");
console.log("To Test: open several browsers at: http://localhost:3000/assignment3.html")
