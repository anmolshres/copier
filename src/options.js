const updateList = (clickedElements) => {
  const actionList = document.getElementById('actions-list')
  actionList.innerHTML = ''

  for (const action of clickedElements) {
    const listNode = document.createElement("LI")
    const textNode = document.createTextNode(`${action.clickedElementSelectorString} clicked on DateTime ${action.actionTime}`)
    listNode.appendChild(textNode)
    actionList.appendChild(listNode)
  }
  console.log(`List updated to `, clickedElements)
}

const afterOpen = () => {
  console.log('initialized')

  chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
    updateList(clickedElements)
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if(namespace === 'sync'){
      const clickedElements = changes['clickedElements'].newValue
      updateList(clickedElements)
    }
  });
}

document.addEventListener('DOMContentLoaded', afterOpen)