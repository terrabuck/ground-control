const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const got = require('got');
const connectSocket = require('./socket');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
var socket;

function reg() {
  var a;
  try {
    a = JSON.parse(fs.readFileSync("./config.json").toString());
  } catch (error) {
    throw new Error("Did you modify the config.json?");
  }
  /* Socket */
  socket = null;
  if (a.token) {
    socket = connectSocket(a.token);
  }

  if (a.keys) {
    /* Skip alert */
    if (a.keys.skip_alert && a.keys.skip_alert.key) {
      var key = a.keys.skip_alert.key;
      if (a.keys.skip_alert.mod && a.keys.skip_alert.mod !== "" && a.keys.skip_alert.mod !== "#") {
        key = a.keys.skip_alert.mod + key;
      }
      try {
        globalShortcut.register(key, () => {
          if (a.token && a.token !== "") {
            if (socket) {
                console.log("Send: 'Skip Alert'");
                socket.emit('event:skip');
            }
          }
        });
      } catch (error) {
        console.log(`Keybind for 'Skip Alert' failed, '${key}'`);
      }
    }
    /* Skip song */
    if (a.keys.skip_song && a.keys.skip_song.key) {
      var key = a.keys.skip_song.key;
      if (a.keys.skip_song.mod && a.keys.skip_song.mod !== "" && a.keys.skip_song.mod !== "#") {
        key = a.keys.skip_song.mod + key;
      }
      try {
        globalShortcut.register(key, () => {
          if (a.token && a.token !== "") {
            if (socket) {
                got.delete("https://caipirinha.streamelements.com/kappa/v1/songrequest/queue/skip", {
                  headers: {
                    Authorization: "Bearer " + a.token
                  }
                }).then(() => {
                  console.log("Send: 'Skip Song'");
                }).catch(err => {
                  console.error("Could not skip the current song:", err.message);
                });
            }
          }
        });
      } catch (error) {
        console.log(`Keybind for 'Skip Alert' failed, '${key}'`);
      }
    }
  }
}

function createWindow () {
  // globalShortcut
  if (fs.existsSync("./config.json")) {
      reg();
  }
  fs.watch(".", (type, filename) => {
    if (fs.existsSync("./config.json") && filename === "config.json") {
      socket = null;
      globalShortcut.unregisterAll();
      reg();
    }
  });


  // Create the browser window.
  win = new BrowserWindow({width: 625, height: 500, resizable: true, icon: path.join(__dirname, 'src/se.ico')});

  // Hide top bar
  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src/settings.html'), // Only page for atm.
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  var regMe = /.*[\\/]npm[\\/]node_modules[\\/]electron[\\/]dist[\\/]electron[\.a-z]*/i;
  if (fs.existsSync('./package.json') && regMe.test(path.normalize(process.argv[0]))) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
