/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

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

  var messages = {
    results: [
      {objectId: 'ZrAbv2392O', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:15.324Z'} ,
      {objectId: 'UiEdkfemLj', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:12.839Z'} ,
      {objectId: '7987syuz8l', username: 'Anton', roomname: 'superlobby', text: 'Devin', createdAt: '2017-10-30T22:54:06.011Z'} ,
      {objectId: 'yfV6Pq8PsA', username: 'Anton', roomname: 'All Messages', text: 'Devin', createdAt: '2017-10-30T22:53:54.637Z'} ,
      {objectId: '54Yr5lkYxm', username: 'pupper', text: 'bork', roomname: 'lobby', createdAt: '2017-10-30T21:58:36.950Z'} 
      ]
  };

  var serverResponse = 'Hello world!';

  // main statements for GET and POST
  if (request.method === 'OPTIONS') {
    headers = defaultCorsHeaders;
    statusCode = 200;
  } else if (request.method === 'GET') {
    // send back the messages array or error
    headers['Content-Type'] = 'application/json';
    serverResponse = JSON.stringify(messages);
  } else if (request.method === 'POST') {
    // adds new data object to beginning of array
    // if data length === 100
      // pop off last data object
    // returns info from post success
      //   {objectId: "KaVfKM585f", createdAt: "2017-10-31T02:35:51.962Z"}
      // createdAt:"2017-10-31T02:35:51.962Z"
      // objectId:"KaVfKM585f"
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
