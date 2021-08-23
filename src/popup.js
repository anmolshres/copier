/**
  MIT License

  Copyright (c) 2017 Cindy Wang

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/** */
async function onSwitchClick(e) {
  e.target.value = e.target.value === 'on' ? 'off' : 'on'
  const listenSwitchValue = e.target.value
  chrome.storage.local.set({listenSwitchValue}, function() {
    console.log(`Listen switcher was set to ${listenSwitchValue}`);
  });

  if (listenSwitchValue === 'on') {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: listenStarter,
    });
  }
}

async function startReplaying() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: replayStarter,
  });
}

const replayStarter = () => {
  chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
    const replayAction = (actionItem) => {
      let elementToClick = document.querySelector(actionItem.clickedElementSelectorString)
          
      while(true){
        try {
          elementToClick.click();
          console.log(`Clicking element with css selector: "${actionItem.clickedElementSelectorString}"`)
          break
        } catch (_error) {
          elementToClick = elementToClick.parentElement
          continue
        }
      }
    }

    if(!clickedElements.length){
      console.log(`No saved elements to replay`)
      return
    }
    
    const startTime = clickedElements[0].actionTime
    for(const actionItem of clickedElements) {
      setTimeout(() => replayAction(actionItem), (actionItem.actionTime - startTime))
    }
  });
}

const listenStarter = () => {

  /**
   * Start of code from Cindy Wang at https://github.com/CindyLinz/JS-extract-css-selector
   */
  function extract_css_selector(target) {
    var nodes, classList, c, d, cs, i;
    var base, elem;
    var selectors = '';

    base = document.body;
    elem = target;

    function css_ident(str) {
      return str.replace(/[^a-zA-Z0-9\xa0-\uffff]/g, '\\$&');
    }

    GAP: while (base !== target) {
      if (elem.id) {
        nodes = base.querySelectorAll('#' + css_ident(elem.id));
        if (nodes.length === 1) {
          selectors += ' #' + css_ident(elem.id);
          base = elem;
          elem = target;
          continue GAP;
        }
      }

      if (elem.name) {
        nodes = base.querySelectorAll('[name="' + elem.name.replace(/(["\\])/g, '\\$1') + '"]');
        if (nodes.length === 1) {
          selectors += ' [name="' + elem.name.replace(/(["\\])/g, '\\$1') + '"]';
          base = elem;
          elem = target;
          continue GAP;
        }
      }

      cs = elem.classList;
      for (i = 0; i < cs.length; ++i) {
        c = css_ident(cs[i]);
        nodes = base.querySelectorAll('.' + c);
        if (nodes.length === 1) {
          selectors += ' .' + c;
          base = elem;
          elem = target;
          continue GAP;
        }
      }
      for (i = 0; i < cs.length; ++i) {
        c = css_ident(cs[i]);
        nodes = base.querySelectorAll(elem.nodeName + '.' + c);
        if (nodes.length === 1) {
          selectors += ' ' + elem.nodeName + '.' + c;
          base = elem;
          elem = target;
          continue GAP;
        }
      }

      if (elem.parentNode === base) {
        cs = elem.parentNode.children;
        c = 1; d = 0;
        for (i = 0; i < cs.length; ++i) {
          if (cs[i] === elem) {
            for (++i; i < cs.length; ++i) {
              if (cs[i].nodeName === elem.nodeName)
                ++d;
            }
            break;
          }
          if (cs[i].nodeName === elem.nodeName)
            ++c;
        }
        if (c === 1 && d === 0)
          selectors += '>' + elem.nodeName;
        else if (c === 1)
          selectors += '>' + elem.nodeName + ':first-of-type';
        else if (d === 0)
          selectors += '>' + elem.nodeName + ':last-of-type';
        else
          selectors += '>' + elem.nodeName + ':nth-of-type(' + c + ')';
        base = elem;
        elem = target;
        continue GAP;
      }

      elem = elem.parentNode;
    }

    return selectors.substr(1);
  }
  /**
   * End of code from Cindy Wang at https://github.com/CindyLinz/JS-extract-css-selector
   */

  /** */

  const sendToStorage = (e) => {
    const clickedElementSelectorString = extract_css_selector(e.target)
    const actionTime = Date.now()
    chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
      let toPush = [];
      
      if(clickedElements) toPush = [...clickedElements, {clickedElementSelectorString, actionTime}];
      else toPush = [{clickedElementSelectorString, actionTime}]
      
      chrome.storage.sync.set({ "clickedElements" : toPush });
      console.log(`Element with css selector "${clickedElementSelectorString}" was clicked`)
    });
  }

  const onStartListening = async (e) => {
    chrome.storage.local.get("listenSwitchValue", ({ listenSwitchValue }) => {
      if ( listenSwitchValue === 'on') {
        sendToStorage(e)
      }
      else if (listenSwitchValue === 'off') {
        document.body.removeEventListener("click",onStartListening)
        console.log(`document click event listener removed`)
      }
    })
  }
  
  const body = document.body
  body.addEventListener("click", onStartListening);
}

const saveActions = () =>{
  chrome.storage.sync.get("clickedElements", ({ clickedElements }) => {
    console.log(clickedElements);
  });
}

const clearClickedElements = () => {
  chrome.storage.sync.set({ "clickedElements" : [] })
  console.log(`Clicked Elements array was emptied`)
}


const initialize = () => {
  const listenSwitch = document.querySelector(".switch-input")
  const replayButton = document.getElementById("replay-button")
  const saveButton = document.getElementById("save-button")
  const clearButton = document.getElementById("clear-button")
  
  chrome.storage.local.get("listenSwitchValue",({listenSwitchValue}) => {
    if(listenSwitchValue === 'on'){
      listenSwitch.click()
    }
    console.log(listenSwitchValue)
  })

  replayButton.addEventListener('click', (e) => {
    e.preventDefault()
    startReplaying()
  })

  saveButton.addEventListener('click', (e) => {
    e.preventDefault()
    saveActions()
  })

  listenSwitch.addEventListener('click', (e) => {
    onSwitchClick(e)
  })

  clearButton.addEventListener('click', (e) => {
    e.preventDefault()
    clearClickedElements()
  })
}

document.addEventListener('DOMContentLoaded', initialize)