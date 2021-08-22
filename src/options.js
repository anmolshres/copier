const afterOpen = () => {
  console.log('initialized')

  chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
    document.body.innerHTML = clickedElements;
  });
}

document.addEventListener('DOMContentLoaded', afterOpen)