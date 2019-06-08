'use strict'

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


function resizeWindow(x, y, w, h) {
  chrome.windows.getCurrent(function(wind) {
   var updateInfo = {
    left: screen.availLeft + Math.round(x / 100 * screen.availWidth),
    top: screen.availTop + Math.round(y / 100 * screen.availHeight),
    width:Math.round(w / 100 * screen.availWidth),
    height:Math.round(h / 100 * screen.availHeight)
   };
   chrome.windows.update(wind.id, updateInfo, () => window.close());
  });
 }
 

 function comparePresets(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder))
    return 1;
  if (parseInt(a.sortorder) < parseInt(b.sortorder))
    return -1;
  return 0;
}