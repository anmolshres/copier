async function startListening() {
  // When the button is clicked, inject setPageBackgroundColor into current page
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: listenStarter,
  });
}

const listenStarter = () => {
  const body = document.body
  body.addEventListener("click", (e) => {
    console.log(e.target)
  });
}

const initialize = () => {
  const listenButton = document.getElementById("listen-button")

  listenButton.addEventListener('click',(e) => {
    e.preventDefault()
    startListening()
  })
}

document.addEventListener('DOMContentLoaded', initialize)