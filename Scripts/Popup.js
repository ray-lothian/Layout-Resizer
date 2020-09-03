/* global loadPresets, browser, Sortable, resizeWindow, comparePresets */

const main = document.getElementsByTagName('main')[0];
const resetPreset = document.getElementById('resetPreset');

let data;
let shortcuts;
let workArea;

window.addEventListener('load', () => chrome.system.display.getInfo({}, info => {
  chrome.windows.getCurrent(win => {
    const o = info.filter(o => {
      return win.left >= o.workArea.left &&
        win.top >= o.workArea.top &&
        win.width <= o.workArea.width &&
        win.height <= o.workArea.height;
    }).shift() || info[0];
    workArea = o.workArea;
    loadPresets(initialize);
  });
}));

function initialize(loadedData) {
  data = loadedData;

  function initWithBrowserCommands(browserCommands) {
    shortcuts = browserCommands.filter(cmd => cmd.name.match(/resize\d/));

    for (let i = 0; i < data.length; i++) {
      createPreset(data[i], i);
    }

    Sortable.create(main, {
      animation: 250,
      onStart: function() {
        const presets = document.getElementsByClassName('preset');
        for (let i = 0; i < presets.length; i++) {
          presets[i].classList.add('presetDisableHover');
        }
      },
      onEnd: function() {
        const presets = document.getElementsByClassName('preset');
        for (let i = 0; i < presets.length; i++) {
          presets[i].classList.remove('presetDisableHover');
          presets[i].setAttribute('data-sortorder', i);
          data.find(p => p.id === presets[i].getAttribute('data-id')).sortorder = i;
        }
        chrome.storage.local.set({
          'presets': data
        }, () => {

        });
      }
    });
  }

  try {
    browser.commands.getAll().then(initWithBrowserCommands);
  }
  catch (err) {
    chrome.commands.getAll((initWithBrowserCommands));
  }
}

function createPreset(preset, index) {
  if (preset.isempty === false) {
    const shortcut = index < shortcuts.length ? shortcuts[index] : null;

    const presetElem = document.createElement('div');
    presetElem.className = 'preset';
    presetElem.setAttribute('data-sortorder', preset.sortorder);
    presetElem.setAttribute('data-id', preset.id);
    presetElem.setAttribute('data-width', preset.width);
    presetElem.setAttribute('data-height', preset.height);
    presetElem.setAttribute('data-left', preset.left);
    presetElem.setAttribute('data-top', preset.top);
    const btnRemove = document.createElement('i');
    btnRemove.className = 'icon-trash';
    btnRemove.setAttribute('data-removeElem', preset.id);
    const sizeElem = document.createElement('span');
    sizeElem.textContent =
      Math.round(preset.width / 100 * workArea.width) + ' * ' +
      Math.round(preset.height / 100 * workArea.height);
    const img = document.createElement('div');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'c' + preset.id);
    canvas.setAttribute('width', '64');
    canvas.setAttribute('height', '64');
    presetElem.appendChild(btnRemove);
    presetElem.appendChild(sizeElem);
    presetElem.appendChild(img);
    presetElem.appendChild(canvas);
    if (shortcut != null) {
      const key = shortcut.shortcut.replace('MacCtrl', 'Ctrl');
      const hotkeyInfo = document.createElement('span');
      hotkeyInfo.className = 'hotkey';
      hotkeyInfo.textContent = key;
      presetElem.appendChild(hotkeyInfo);
    }
    main.appendChild(presetElem);
    drawRec(
      canvas.id,
      Math.round(preset.left / 100 * 45.6), Math.round(preset.top / 100 * 30),
      Math.round(preset.width / 100 * 45.6), Math.round(preset.height / 100 * 30)
    );
  }
  else {
    const presetElem = document.createElement('div');
    presetElem.className = 'preset';
    presetElem.setAttribute('data-sortorder', preset.sortorder);
    presetElem.setAttribute('data-id', preset.id);
    main.appendChild(presetElem);
  }
}

function drawRec(canvasId, x, y, w, h) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#663399';
  ctx.rect(x + 9, y + 15, w, h);
  ctx.fill();
}


let selectedElem;
document.addEventListener('click', e => {
  const dialog = document.getElementsByClassName('dialogWrapper')[0];
  const dialogReset = document.getElementsByClassName('dialogWrapper')[1];

  if (e.target.className == 'icon-trash') {
    dialog.style.display = 'flex';
    selectedElem = e.target.parentElement.getAttribute('data-id');
  }
  let presets;
  const btnEdit = document.getElementById('btnEdit');
  switch (e.target.id) {
  case 'btnEdit':
    presets = document.getElementsByClassName('preset');
    if (e.target.state == undefined) {
      for (let i = 0; i < presets.length; i++) {
        presets[i].classList.add('editMode');
      }
      e.target.classList.add('editMode-cancel');
      e.target.state = 'IsInEditMode';
    }
    else {
      for (let i = 0; i < presets.length; i++) {
        presets[i].classList.remove('editMode');
      }
      e.target.classList.remove('editMode-cancel');
      e.target.state = undefined;
    }
    break;
  case 'btnNewPreset':
    chrome.tabs.create({
      'url': '../CustomPreset.html'
    });
    break;
  case 'btnCancel':
    dialog.style.display = 'none';
    break;
  case 'btnResetCancel':
    dialogReset.style.display = 'none';
    break;
  case 'btnOk':
    dialog.style.display = 'none';
    emptyMain();
    removePreset(selectedElem);
    presets = document.getElementsByClassName('preset');
    for (let i = 0; i < presets.length; i++) {
      presets[i].classList.remove('editMode');
    }
    if (btnEdit.state != undefined) {
      btnEdit.classList.remove('editMode-cancel');
      btnEdit.state = undefined;
    }
    data.sort(comparePresets);
    for (let i = 0; i < data.length; i++) {
      createPreset(data[i], i);
    }
    break;
  case 'btnResetOk':
    chrome.storage.local.remove('presets', () => chrome.runtime.sendMessage({
      method: 'notify',
      message: 'Layouts are reset to the default values'
    }));
    fetch('../Content/Data.json').then(r => r.json()).then(j => {
      data = j.presets;
      emptyMain();
      initialize();
    });
    dialogReset.style.display = 'none';
    break;
  default:
  }

  if (e.target.className == 'preset') {
    const x = parseInt(e.target.getAttribute('data-left'));
    const y = parseInt(e.target.getAttribute('data-top'));
    const w = parseInt(e.target.getAttribute('data-width'));
    const h = parseInt(e.target.getAttribute('data-height'));
    resizeWindow(x, y, w, h);
  }
});

function emptyMain() {
  while (main.firstChild) {
    main.removeChild(main.firstChild);
  }
}

function removePreset(dataID) {
  data.map(obj =>{
    if (obj.id === dataID) {
      obj.isempty = true;
    }
  });
  chrome.storage.local.set({
    'presets': data
  }, () => {

  });
}
resetPreset.addEventListener('click', () => {
  const dialogForReset = document.getElementsByClassName('dialogWrapper')[1];
  dialogForReset.style.display = 'flex';
});
