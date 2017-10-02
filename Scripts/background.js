'use strict';

chrome.runtime.onMessage.addListener(message => {
  const notificationOptions = {
    type: 'basic',
    title: 'Success Operation',
    iconUrl: 'Content/Images/24.png'
  };
  if (message === 'success' || message === 'error') {
    if (message === 'success') {
      notificationOptions.message = 'The operation was successful.';
    }
    else {
      notificationOptions.message = `You have reached the maximum number of allowed configurations!

Delete at least one configuration and try again.`;
    }
    chrome.notifications.create('notification', notificationOptions);
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
