const got = require('got');

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

class Heap {
  /**
   * @param {string} jwt
   */
  constructor(jwt) {
    const identity = JSON.parse(atob(jwt.split('.')[1])).channel;
    /**
     * @param {string} event
     */
    function sendEvent(event) {
      const body = JSON.stringify({
        app_id: 413792583,
        identity,
        event,
        timestamp: new Date().toISOString(),
        properties: {
          UsingGC: true
        }
      });
      return new Promise((resolve, reject) => {
        got.post('https://heapanalytics.com/api/track', {
          headers: {
            'Content-Type': 'application/json'
          },
          body
        }).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    }
    /**
     * @param {{[x: string]: boolean}} properties
     */
    function sendProperties(properties) {
      const body = JSON.stringify({
        app_id: 413792583,
        identity,
        properties
      });
      got.post('https://heapanalytics.com/api/add_user_properties', {
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }).then(() => {
      }).catch(err => {
        console.error(err);
      });
    }
    this.open = function () {
      sendEvent('Opened GC');
      sendProperties({
        UsingGC: true
      });
    };
    this.bot = function (active) {
      sendProperties({
        isUsingCustomBotName: active
      });
    };
    this.close = function () {
      return new Promise(resolve => {
        sendEvent('Closed GC').then(() => {
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    };
  }
}

module.exports = Heap;
