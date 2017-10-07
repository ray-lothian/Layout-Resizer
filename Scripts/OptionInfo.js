/* globals ui */
'use strict';

{
  const left = document.getElementById('txtLeft');
  const top = document.getElementById('txtTop');
  const width = document.getElementById('txtWidth');
  const height = document.getElementById('txtHeight');

  const save = document.getElementById('savePreset');

  const modes = document.getElementById('mode');
  let mode = modes.querySelector(':checked').value;
  modes.addEventListener('change', ({target}) => {
    mode = target.value;
    ui.emit('change', {
      left: left.dataset.value,
      top: top.dataset.value,
      width: width.dataset.value,
      height: height.dataset.value
    });
  });

  function insert(e, value, max) {
    e.dataset.value = value;
    e.value = mode === 'percent' ? value : (parseInt(value) * max / 100).toFixed(0) + 'px';
  }

  ui.on('change', rect => {
    insert(left, rect.left, screen.availWidth);
    insert(width, rect.width, screen.availWidth);
    insert(top, rect.top, screen.availHeight);
    insert(height, rect.height, screen.availHeight);

    save.disabled = rect.width === '0%' || rect.height === '0%';

  });
  // save
  save.addEventListener('click', () => {
      chrome.storage.local.get(['presets'], results => {
        if (results.presets !== undefined) {
          data = results.presets;
          data.sort(Compare);
        }

        const widthValue = width.dataset.value.replace('%','');
        const heightValue = height.dataset.value.replace('%','');
        const leftValue = left.dataset.value.replace('%','');
        const topValue = top.dataset.value.replace('%','');
        let idValue;

        let isAnyEmptyPreset = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i].isempty === true) {
            idValue = data[i].id;
            isAnyEmptyPreset = true;
            break;
          }
        }
        if (isAnyEmptyPreset === false) {
          chrome.runtime.sendMessage({
            method: 'notify',
            message: `You have reached the maximum number of allowed configurations!

    Delete at least one configuration and try again.`
          });
          return;
        } else {
          data.map(preset => {
            if (preset.id === idValue) {
              preset.width = widthValue;
              preset.height = heightValue;
              preset.left = leftValue;
              preset.top = topValue;
              preset.isempty = false;
            }
          });
          chrome.storage.local.set({
            'presets': data
          }, () => {
            chrome.runtime.sendMessage({
              method: 'notify',
              message: 'The operation was successful.'
            }, () => location.reload());
          });
        }
      });

  });
}
