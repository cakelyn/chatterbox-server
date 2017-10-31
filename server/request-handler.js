/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var data = {
  results: [
    {objectId: '54Yr5lkYxm', username: 'pupper', text: 'bork', roomname: 'lobby', createdAt: '2017-10-30T21:58:36.950Z'},
    {objectId: 'yfV6Pq8PsA', username: 'Anton', roomname: 'All Messages', text: 'Devin', createdAt: '2017-10-30T22:53:54.637Z'},
    {objectId: '7987syuz8l', username: 'Anton', roomname: 'superlobby', text: 'Devin', createdAt: '2017-10-30T22:54:06.011Z'},
    {objectId: 'UiEdkfemLj', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:12.839Z'},
    {objectId: 'ZrAbv2392O', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:15.324Z'},
    ]
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  // need to set response.statusCode to 200 or 404 depending on success
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'text/plain';

  var serverResponse = 'Hello world!';

  // generate random objectId
  var makeObjId = function() {
    var result = '';
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var len = 10;

    for (var i = 0; i < len; i ++) {
      result += chars[(Math.floor(Math.random() * chars.length))];
    }

    return result;
  }

  /*
   *  OPTIONS RESPONSE
   */

  if (request.method === 'OPTIONS') {
    headers = defaultCorsHeaders;
    statusCode = 200;

  /*
   *  GET RESPONSE
   */

  } else if (request.method === 'GET') {
    // send back the messages array or error
    headers['Content-Type'] = 'application/json';

    // select only the first 100 messages
    var dataSliced = {
      results: data.results.slice(0, 99)
    };

    // send messages
    serverResponse = JSON.stringify(dataSliced);

  /*
   *  POST RESPONSE
   */

  } else if (request.method === 'POST') {
    var body = [];

    // get the body of the request
    request.on('data', function(chunk) {
      body.push(chunk);

    // when request has been handled, format data into a new object
    }).on('end', function() {
      body = Buffer.concat(body).toString().split('&');

      // generates current date and time
      var dt = new Date();
      var dateTime = dt.toISOString();
      var username = body[0].slice(9);
      var text = body[1].slice(5);

      var postObject = {
        objectId: makeObjId(),
        username: username.split('+').join(' '),
        text: text.split('+').join(' '),
        createdAt: dateTime
      }

      // checks if there is a roomname
      if (body[2] && body[2].length > 9) {
        // put it in
        var roomname = body[2].slice(9);
        postObject.roomname = roomname.split('+').join(' ');
      }

      // update the data results array with the new object
      data.results.push(postObject);
    });
  }

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(serverResponse);
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

exports.requestHandler = requestHandler;
