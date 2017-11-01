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

var actions = {
  'OPTIONS': function(request, response) {
    sendResponse(response, null);
  },
  'GET': function(request, response) {
    sendResponse(response, data);
  },
  'POST': function(request, response) {
    collectData(request, function(body) {
      var dateTime = currentDateTime;
      var username = body[0].slice(9);
      var text = body[1].slice(5);
      var postObject = {
        objectId: makeObjId(),
        username: username.split('+').join(' '),
        text: text.split('+').join(' '),
        createdAt: dateTime
      };

      // checks if there is a roomname
      if (body[2] && body[2].length > 9) {
        // put it in
        var roomname = body[2].slice(9);
        postObject.roomname = roomname.split('+').join(' ');
      }

      // update the data results array with the new object
      data.results.push(postObject);
      sendResponse(response, postObject, 201);
    });
  }
};

var sendResponse = function(response, data, statusCode) {
  var statusCode = statusCode || 200;
  response.writeHead(statusCode, defaultCorsHeaders);
  response.end(JSON.stringify(data));
};

var collectData = function(request, callback) {
  var body = [];
  request.on('data', function(chunk) {
    body.push(chunk);
  });
  request.on('end', function() {
    body = Buffer.concat(body).toString().split('&');
    callback(body);
  });
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
};

var currentDateTime = function() {
  var dt = new Date();
  return dt.toISOString();
};

var requestHandler = function(request, response) {

  var action = actions[request.method];
  if (action) {
    action(request, response);
  } else {
    sendResponse(response, '', 404);
  }
};

exports.requestHandler = requestHandler;
exports.sendResponse = sendResponse;