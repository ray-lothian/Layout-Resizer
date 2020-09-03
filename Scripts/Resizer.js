/* global workArea, data */

'use strict';

function loadPresets(callback) {
  chrome.storage.local.get(['presets'], results => {
    if (results.presets !== undefined) {
      data = results.presets;
      data.sort(comparePresets);
      callback(data);
    }
    else {
      const requestURL = '../Content/Data.json';
      const request = new XMLHttpRequest();
      request.open('GET', requestURL);
      request.send();

      request.onload = () => {
        if (request.status === 200) {
          data = JSON.parse(request.responseText).presets;
          chrome.storage.local.set({
            'presets': data
          }, () => {
            callback(data);
          });
        }
      };
    }
  });
}

// Firefox polyfill
chrome.system = chrome.system || {
  display: {
    getInfo(flags, callback) {
      Promise.all([
        new Promise(resolve => setTimeout(() => resolve(screen), 200)),
        new Promise(resolve => chrome.runtime.getBackgroundPage(bg => {
          resolve(bg.screen);
        }))
      ]).then(([a, b]) => {
        callback([a, b].map(a => {
          const obj = {};
          Object.assign(obj, {
            width: a.availWidth,
            height: a.availHeight,
            top: a.availTop,
            left: a.availLeft
          });
          return {
            bounds: obj,
            workArea: obj
          };
        }));
      });
    }
  }
};

function resizeWindow(x, y, w, h) {
  chrome.windows.getCurrent(wind => {
    if (w && h) {
      const updateInfo = {
        left: workArea.left + Math.round(x / 100 * workArea.width),
        top: workArea.top + Math.round(y / 100 * workArea.height),
        width: Math.round(w / 100 * workArea.width),
        height: Math.round(h / 100 * workArea.height)
      };
      chrome.windows.update(wind.id, updateInfo, () => window.close());
    }
  });
}

function comparePresets(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder)) {
    return 1;
  }
  if (parseInt(a.sortorder) < parseInt(b.sortorder)) {
    return -1;
  }
  return 0;
}
