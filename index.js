const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function reg_skip() {
  var a;
  try {
    a = JSON.parse(fs.readFileSync("./config.json").toString());
  } catch (error) {
    throw new Error("Did you modify the config.json?");
  }
  if (a.keys && a.keys.skip && a.keys.skip.key) {
    var key = a.keys.skip.key;
    if (a.keys.skip.mod && a.keys.skip.mod !== "") {
      key = a.keys.skip.mod + "+" + key;
    }
    try {
      globalShortcut.register(key, () => {
        // Add the api request! {TODO}
        console.log(key + ' is pressed');
      });
    } catch (error) {
      console.log('registration failed');
    }
  }
}

function createWindow () {
  // globalShortcut
  if (fs.existsSync("./config.json")) {
      reg_skip();
  }
  fs.watch(".", (type, filename) => {
    if (fs.existsSync("./config.json") && filename === "config.json") {
      globalShortcut.unregisterAll();
      reg_skip();
    }
  });


  // Create the browser window.
  win = new BrowserWindow({width: 620, height: 405, resizable: true, icon: path.join(__dirname, 'src/se.ico')});

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
