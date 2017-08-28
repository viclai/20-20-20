// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let $ = require('jquery');
const {ipcRenderer, remote} = require('electron');

$('#start_timer').on('click', () => {
  ipcRenderer.send('asynchronous-message', {
    command : "Start Timer",
    duration : 60 // For debugging purposes, use 60 seconds
  });
  $('#instr').html("&nbsp;");
  $('#start_timer').addClass('disabled');
  $('#reset_timer').removeClass('disabled');
});

$('#reset_timer').on('click', () => {
  ipcRenderer.send('asynchronous-message', {
    command : "Stop Timer"
  });
  $('#instr').html("Click on Start to start the timer.");
  $('#reset_timer').addClass('disabled');
  $('#start_timer').removeClass('disabled');
});

$('#hideBtn').on('click', () => {
  remote.getCurrentWindow().hide();
});
