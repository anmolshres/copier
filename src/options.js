const afterOpen = () => {
  console.log('initialized')

  chrome.storage.sync.get("clickedElementSelector", ({ clickedElementSelector }) => {
    document.body.innerText = clickedElementSelector;
  });
}

document.addEventListener('DOMContentLoaded', afterOpen)