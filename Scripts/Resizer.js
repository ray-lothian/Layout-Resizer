/* eslint-disable */

'use strict'

var data

function loadPresets(callback) {
  chrome.storage.local.get(["presets"], results => {
    if (results.presets !== undefined) {
     data = results.presets;
      data.sort(comparePresets);
     callback(data)
    } else {
     let requestURL = '../Content/Data.json';
     let request = new XMLHttpRequest();
     request.open('GET', requestURL);
     request.send();

     request.onload = () => {
      if (request.status === 200) {
       data = JSON.parse(request.responseText).presets;
       chrome.storage.local.set({
        "presets": data
       }, () => {
        callback(data)
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
      const obj = {};
      chrome.runtime.getBackgroundPage(bg => {
        Object.assign(obj, {
          top: bg.screen.top,
          left: bg.screen.left,
          width: bg.screen.width,
          height: bg.screen.height
        });
        callback([{
          bounds: obj,
          workArea: obj
        }]);
      });
    }
  }
};

function resizeWindow(x, y, w, h) {
  chrome.system.display.getInfo({}, info => {
    chrome.windows.getCurrent(win => {
      const o = info.filter(o => {
        return win.left >= o.workArea.left &&
          win.top >= o.workArea.top &&
          win.width <= o.workArea.width &&
          win.height <= o.workArea.height;
      }).shift() || info[0];

      chrome.windows.getCurrent(function(wind) {
        var updateInfo = {
          left: o.workArea.left + Math.round(x / 100 * o.workArea.width),
          top: o.workArea.top + Math.round(y / 100 * o.workArea.height),
          width: Math.round(w / 100 * o.workArea.width),
          height: Math.round(h / 100 * o.workArea.height)
        };
        chrome.windows.update(wind.id, updateInfo, () => window.close());
      });
    });
  });
}

function comparePresets(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder))
    return 1;
  if (parseInt(a.sortorder) < parseInt(b.sortorder))
    return -1;
  return 0;
}
