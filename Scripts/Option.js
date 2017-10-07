'use strict';
var data;
var shadowData;
var ui = {
  events: {

  },
  on: (id, callback) => ui.events[id] = callback,
  emit: (id, value) => ui.events[id] && ui.events[id](value)
};

{
  let width, height;
  const split = {
    width: width / 10,
    height: height / 10
  };
  const display = document.getElementById('display');

  { // position the display element inside the svg
    let left, top;

    const resize = () => {
      var w = document.getElementById('wrapper');
      w.style.height = w.clientWidth * 0.5747 + 'px';
      const rect = display.getBoundingClientRect();
      const body = document.body.getBoundingClientRect();
      left = rect.left;
      top = rect.top;
      width = rect.width;
      height = rect.height;

      Object.assign(display.style, {

      });
      //
      split.width = width / 10;
      split.height = height / 10;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  const box = document.getElementById('box');
  const pos = {
    x: 0,
    y: 0,
  };

  let lastCall = 0;
  function observe(e) {
    // limit the rate
    const now = Date.now();
    if (now - lastCall < 50) {
      console.log('skipped');
      return;
    }
    lastCall = now;

    // definitions
    const rect = {
      left: Math.max(0, Math.min(pos.x, e.offsetX)),
      top: Math.max(0, Math.min(pos.y, e.offsetY)),
    };
    // fit to table
    rect.left = Math.floor(rect.left / split.width) * split.width;
    rect.top = Math.floor(rect.top / split.height) * split.height;

    rect.width = split.width * (Math.floor(Math.max(pos.x, e.offsetX) / split.width) + 1) - rect.left;
    rect.width = Math.min(rect.width, width - rect.left);
    rect.height = split.height * (Math.floor(Math.max(pos.y, e.offsetY) / split.height) + 1) - rect.top;
    rect.height = Math.min(rect.height, height - rect.top);

    Object.assign(box.style, {
      left: rect.left / width * 100 + '%',
      width: rect.width / width * 100 + '%',
      top: rect.top / height * 100 + '%',
      height: rect.height / height * 100 + '%'
    });

    ui.emit('change', box.style);
  }

  display.addEventListener('mousedown', e => {
    document.getElementById('savePreset').classList.add('sepButton-active');
    pos.x = e.offsetX;
    pos.y = e.offsetY;
    observe(e);
    display.addEventListener('mousemove', observe);
  });
  document.addEventListener('mouseup', () => display.removeEventListener('mousemove', observe));
}


document.addEventListener('DOMContentLoaded', () => {
  const request = new XMLHttpRequest();
  request.open('GET', '../Content/Data.json');
  request.onload = () => {
    shadowData = JSON.parse(request.responseText).presets;

    chrome.storage.local.get(['presets'], results => {
      if (results.presets !== undefined) {
        data = results.presets;
        data.sort(Compare);
      } else {
        data = shadowData;
      }
    });
  };
  request.send();
});

function Compare(a, b) {
  if (parseInt(a.sortorder) > parseInt(b.sortorder)) {
    return 1;
  }
  if (parseInt(a.sortorder) < parseInt(b.sortorder)) {
    return -1;
  }
  return 0;
}
