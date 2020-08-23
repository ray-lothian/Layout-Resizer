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

// FAQs & Feedback
chrome.storage.local.get({
  'version': null,
  'faqs': navigator.userAgent.indexOf('Firefox') === -1
}, prefs => {
  const version = chrome.runtime.getManifest().version;

  if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
    chrome.storage.local.set({version}, () => {
      chrome.tabs.create({
        url: 'http://add0n.com/layout-resizer.html?version=' + version +
          '&type=' + (prefs.version ? ('upgrade&p=' + prefs.version) : 'install')
      });
    });
  }
});

{
  const {name, version} = chrome.runtime.getManifest();
  chrome.runtime.setUninstallURL('http://add0n.com/feedback.html?name=' + name + '&version=' + version);
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
  var triggered = parseInt(name.slice(-1), 10)

  loadPresets(presets => {
    var preset = presets[triggered]
    let x = parseInt(preset.left)
    let y = parseInt(preset.top)
    let w = parseInt(preset.width)
    let h = parseInt(preset.height)
    resizeWindow(x, y, w, h);
  })
};

try {
  browser.commands.onCommand.addListener(shortcutHandler);
} catch(err) {
  chrome.commands.onCommand.addListener(shortcutHandler);
}
