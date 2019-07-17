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
 * Add event listener for keyboard commands
 */
browser.commands.onCommand.addListener((name) => {
  // Trigger the preset with the index corresponding to the last letter
  // of the name of the keyboard shortcut triggered (as defined in manifest)
  var triggered = parseInt(name.slice(-1), 10)

  loadPresets(presets => {
    var preset = presets[triggered]
    let x = parseInt(preset.left)
    let y = parseInt(preset.top)
    let w = parseInt(preset.width)
    let h = parseInt(preset.height)
    resizeWindow(x, y, w, h);
  })
})
