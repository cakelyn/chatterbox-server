var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

var data = {
  results: [
    {objectId: '54Yr5lkYxm', username: 'pupper', text: 'bork', roomname: 'lobby', createdAt: '2017-10-30T21:58:36.950Z'},
    {objectId: 'yfV6Pq8PsA', username: 'Anton', roomname: 'All Messages', text: 'Devin', createdAt: '2017-10-30T22:53:54.637Z'},
    {objectId: '7987syuz8l', username: 'Anton', roomname: 'superlobby', text: 'Devin', createdAt: '2017-10-30T22:54:06.011Z'},
    {objectId: 'UiEdkfemLj', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:12.839Z'},
    {objectId: 'ZrAbv2392O', username: 'dwrz', room: 'lobby', text: 'Hello hello', createdAt: '2017-10-30T23:18:15.324Z'},
    ]
};

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

var sendResponse = function(response, data, statusCode) {
  var statusCode = statusCode;
  response.writeHead(statusCode, defaultCorsHeaders);
  response.end(JSON.stringify(data));
}

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  if (request.url.indexOf('classes/messages') < 0) {
    sendResponse(response, null, 404);
  } else if (request.method === 'OPTIONS') {
    sendResponse(response, null, 200);
  } else if (request.method === 'GET') {
    // select only the first 100 messages
    var dataSliced = {
      results: data.results.slice(0, 99)
    };
    // send back the messages array or error
    sendResponse(response, dataSliced, 200);
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
      console.log(postObject);
      sendResponse(response, postObject, 201)
    });
  }
};

exports.requestHandler = requestHandler;
