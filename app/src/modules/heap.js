const got = require("got");

function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

class Heap {
  /**
   * @param {string} jwt 
   */
  constructor(jwt) {
    const identity = JSON.parse(atob(jwt.split(".")[1])).channel;
    /**
     * @param {string} event 
     */
    function sendEvent(event) {
      var body = JSON.stringify({
        app_id: 413792583,
        identity,
        event,
        timestamp: new Date().toISOString(),
        properties: {
          UsingGC: true
        }
      });
      return new Promise((resolve, reject) => {
        got.post("https://heapanalytics.com/api/track", {
          headers: {
            "Content-Type": "application/json"
          },
          body
        }).then(res => {
          // console.log(res.body);
          resolve();
        }).catch(err => {
          // console.error(err);
          reject(err);
        });
      });
    }
    function sendProperties() {
      var body = JSON.stringify({
        app_id: 413792583,
        identity,
        properties: {
          UsingGC: true
        }
      });
      got.post("https://heapanalytics.com/api/add_user_properties", {
        headers: {
          "Content-Type": "application/json"
        },
        body
      }).then(res => {
        // console.log(res.body);
      }).catch(err => {
        // console.error(err);
      });
    }
    this.open = function() {
      sendEvent("Opened GC");
      sendProperties();
    }
    this.close = function() {
      return new Promise(resolve => {
        sendEvent("Closed GC").then(function() {
          resolve();
        }).catch(() => {
          resolve();
        });
      })
    }
  }	
}

module.exports = Heap;
