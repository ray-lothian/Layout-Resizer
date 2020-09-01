/* global loadPresets */
'use strict';

chrome.runtime.onMessage.addListener(request => {
  if (request.method === 'notify') {
    const notificationOptions = {
      type: 'basic',
      title: 'Success Operation',
      iconUrl: 'Content/Images/24.png',
      message: request.message
    };
    chrome.notifications.create(notificationOptions);
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install'
            });
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}

/**
 * Event listener for keyboard commands
 *
 * This event listener binds to keyboard shortcuts defined in `manifest.json`.
 * It triggers the preset with the index concerting to the last digit of
 * the keyboard shortcut preset's name. That is, the shortcut `resize0` would
 * trigger the first preset.
 */
function shortcutHandler(name) {
  const triggered = parseInt(name.slice(-1), 10);

  loadPresets(presets => {
    const preset = presets[triggered];
    const x = parseInt(preset.left);
    const y = parseInt(preset.top);
    const w = parseInt(preset.width);
    const h = parseInt(preset.height);
    resizeWindow(x, y, w, h);
  });
};

try {
  browser.commands.onCommand.addListener(shortcutHandler);
}
catch (err) {
  chrome.commands.onCommand.addListener(shortcutHandler);
}
