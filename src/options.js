const afterOpen = () => {
  console.log('initialized')

  chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
    const actionList = document.getElementById('actions-list')
    for (const action of clickedElements) {
      const listNode = document.createElement("LI")
      const textNode = document.createTextNode(action)
      listNode.appendChild(textNode)
      actionList.appendChild(listNode)
    }
  });
}

document.addEventListener('DOMContentLoaded', afterOpen)