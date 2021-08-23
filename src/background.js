chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ "listenSwitchValue" : "off" });
  console.log(`Switch set to off on runtime intalled`);
});