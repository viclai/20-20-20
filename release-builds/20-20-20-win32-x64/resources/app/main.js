const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const Tray = electron.Tray;
const Timer = require('./Timer');
const openAboutWindow = require('about-window').default;

let trayMenu = null;
let tray = null;
let timer = new Timer();
let timerId;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  // Refer to https://electron.atom.io/docs/api/browser-window/ for more
  // options.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    center : true,
    alwaysOnTop: true,
    frame : false,
    icon : "./images/dock-logo.png"
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();

  // Initialize system tray
  const trayMenuTemplate = [
    {
      label : "20/20/20 Timer",
      enabled : false
    },
    {
      label : "Show Time Remaining",
      click : function () {
        mainWindow.show();
      }
    }
  ];
  trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray = new Tray(path.join(__dirname, "images/glasses.png"));
  tray.on('click', (e, bounds) => { // TODO: Doesn't work for some reason
    console.log("Tray clicked");
    trayMenu.items[0].label = timer.toString();
    tray.setContextMenu(trayMenu);
  });
  tray.setContextMenu(trayMenu);

  // Initialize application menu
  const appMenuTemplate = [
    {
      label: 'View',
      submenu: [
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {label: 'Learn More'}
      ]
    }
  ];
  if (process.platform === 'darwin') {
    appMenuTemplate.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About 20-20-20',
          click: () => openAboutWindow({
            icon_path : path.join(__dirname, 'images/dock-logo.png')
          })
        },
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    });
  }
  const appMenu = Menu.buildFromTemplate(appMenuTemplate);
  Menu.setApplicationMenu(appMenu);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('asynchronous-message', (event, arg) => {
  var countDownDate;
  var seconds_passed;
  var trayIcon;
  var duration;

  if (arg.command == 'Start Timer') {
    countDownDate = new Date().getTime();
    seconds_passed = 0;
    duration = arg.duration;

    timer.setDuration(duration);
    tray.setImage(path.join(__dirname, 'images/glasses.png'));
    event.sender.send('asynchronous-reply', {
      reset : false,
      text : timer.toString()
    });

    timerId = setInterval(function() {
      let now = new Date().getTime();
      let passed = now - countDownDate;

      let seconds = parseInt(Math.floor(passed / 1000));
      if (seconds > seconds_passed) {
        timer.decrement(seconds - seconds_passed);
        // TODO: For some reason the following commented lines do not seem to
        //       update the tray's context menu.
        //trayMenu.items[0].label = timer.toString();
        //tray.setContextMenu(trayMenu);
        
        if (seconds >= duration) { // Time up
          if (mainWindow === null) {
            createWindow();
          } else {
            mainWindow.show();
          }
          tray.setImage(path.join(__dirname, 'images/glasses-warning.png'));
          clearInterval(timerId);
        }
        seconds_passed = seconds;
        mainWindow.setProgressBar(seconds_passed / duration);
        event.sender.send('asynchronous-reply', {
          reset : false,
          text : timer.toString()
        });
      }
    }, 1000);
  } else if (arg.command == 'Stop Timer') {
    if (timerId) {
      clearInterval(timerId);
      event.sender.send('asynchronous-reply', {
        reset : true,
        text : "Time Remaining: 00:00:00"
      });
    }
  }
});
