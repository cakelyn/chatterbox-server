$(document).ready(function() {

  // initialize app when document is ready
  app.init();

});

var app = {
  // set up app variables
  server: 'http://127.0.0.1:3000/classes/messages/',
  username: 'anon',
  friends: {},
  latestMessageId: 0,
  roomname: 'lobby',
  messages: [],

  init: function() {
    // get username
    app.username = window.location.search.substr(10);

    // jQuery selectors
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');

    // jQuery listeners
    app.$chats.on('click', '.username', app.handleUsernameClick);
    app.$send.on('click', app.handleSubmit);
    app.$roomSelect.on('change', app.handleRoomChange);

    // fetch old messages
    app.startSpinner();
    app.fetch(false);

    // continually check for new messages
    setInterval(function() {
      app.fetch(true);
    }, 3000);
  },

  send: function(message) {
    app.startSpinner();

    $.ajax({
      url: app.server,
      type: 'POST',
      data: message,
      success: function (data) {
        // clear messages
        app.$message.val('');

        // fetch to update messages
        app.fetch();
      },
      error: function (error) {
        console.error('failed to send message: ', error);
      }
    });
  },

  fetch: function(animate) {
    $.ajax({
      url: app.server,
      type: 'GET',
      data: { order: '-createdAt'},
      contentType: 'application/json',
      success: function (data) {
        console.log(data);
        // if we don't have any new messages, don't do anything
        if (!data.results || !data.results.length) { return; }

        // store messages
        app.messages = data.results;

        // store the most recent message
        var mostRecent = data.results[data.results.length - 1];

        // only update if we have new messages
        // check against mostRecent
        if (mostRecent.objectId !== app.latestMessageId) {
          // update rooms
          app.renderRoomList(data.results);

          // update messages
          app.renderMessages(data.results, animate);

          // store ID of most recent message
          app.latestMessageId = mostRecent.objectId;
        }
      },
      error: function(error) {
        console.error('failed to fetch messages: ', error);
      }
    });

  },

  clearMessages: function() {
    app.$chats.html('');
  },

  renderMessages: function(messages, animate) {
    app.clearMessages();
    app.stopSpinner();

    if (Array.isArray(messages)) {
      // add all fetched messages that are in the current room
      messages.filter(function(message) {
        return message.roomname === app.roomname || app.roomname === 'lobby' && !message.roomname;
      }).forEach(app.renderMessage);
    }

    // animate scroll to top
    if (animate) {
      $('body').animate({scrollTop: '0px'}, 'fast');
    }

  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="__newRoom">New room...</option>');

    if (messages) {
      var rooms = {};
      messages.forEach(function(message) {
        var roomname = message.roomname;
        if (roomname && !rooms[roomname]) {
          // add room to the select menu
          app.renderRoom(roomname);

          // keep track of rooms that we already have
          rooms[roomname] = true;
        }
      });
    }

    // select the menu option
    app.$roomSelect.val(app.roomname);
  },

  renderRoom: function(room) {
    // prevent XSS
    var $option = $('<option/>').val(room).text(room);

    // add to select
    app.$roomSelect.append($option);
  },

  renderMessage: function(message) {
    if (!message.roomname) {
      message.roomname = 'lobby';
    }

    // create a div to hold the chats
    var $chat = $('<div class="chat"/>');

    // add in message data
    // avoid XSS
    // store username
    var $username = $('<span class="username"/>');
    $username.text(message.username + ': ').attr('data-roomname', message.roomname).attr('data-username', message.username).appendTo($chat);

    // add the friend class if they are a friend
    if (app.friends[message.username] === true) {
      $username.addClass('friend');
    }

    var $message = $('<br><span/>');
    $message.text(message.text).appendTo($chat);

    // add message to chat
    app.$chats.prepend($chat);
  },

  handleUsernameClick: function(event) {
    // get username
    var username = $(event.target).data('username');

    if (username !== undefined) {
      // toggle friend
      app.friends[username] = !app.friends[username];

      // prevent XSS on username
      var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';

      // add friend class to all messages from selected friend
      var $usernames = $(selector).toggleClass('friend');
    }
  },

  handleRoomChange: function(event) {
    var selectIndex = app.$roomSelect.prop('selectedIndex');

    // new room is always the first option
    if (selectIndex === 0) {
      var roomname = prompt('Enter room name');
      if (roomname) {
        // set as current room
        app.roomname = roomname;

        // add room to menu
        app.renderRoom(roomname);

        // select the menu option
        app.$roomSelect.val(roomname);
      }
    } else {
      app.startSpinner();

      // store as undefined for empty names
      app.roomname = app.$roomSelect.val();
    }

    // render messages
    app.renderMessages(app.messages);
  },

  handleSubmit: function(event) {
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };

    app.send(message);

    // stop the form from resubmitting
    event.preventDefault();
  },

  startSpinner: function() {
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', 'true');
  },

  stopSpinner: function() {
    $('.spinner img').fadeOut('fast');
    $('form input[type=submit]').attr('disabled', null);
  }

};