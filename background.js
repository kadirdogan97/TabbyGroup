let existingGroups = {};
let groupUrlPatterns = {};

chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});

async function initializeExtension() {
  try {
    await discoverExistingGroups();
    
    const result = await chrome.storage.sync.get(['urlPatterns']);
    if (result.urlPatterns) {
      groupUrlPatterns = result.urlPatterns;
    } else {
      const discoveredPatterns = {};
      await chrome.storage.sync.set({ urlPatterns: discoveredPatterns });
      groupUrlPatterns = discoveredPatterns;
    }
  } catch (error) {
  }
}

async function discoverExistingGroups() {
  try {
    const windows = await chrome.windows.getAll();
    
    for (const window of windows) {
      const groups = await chrome.tabGroups.query({ windowId: window.id });
      
      for (const group of groups) {
        existingGroups[group.title] = group.id;
        
        const tabs = await chrome.tabs.query({ groupId: group.id });
        
        if (tabs.length > 0) {
          if (!groupUrlPatterns[group.title]) {
            groupUrlPatterns[group.title] = [];
          }
          
          for (const tab of tabs) {
            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
              try {
                const urlObj = new URL(tab.url);
                const hostname = urlObj.hostname;
                
                if (!groupUrlPatterns[group.title].includes(hostname)) {
                  groupUrlPatterns[group.title].push(hostname);
                }
              } catch (error) {
              }
            }
          }
        }
      }
    }
    
    if (Object.keys(groupUrlPatterns).length > 0) {
      await chrome.storage.sync.set({ urlPatterns: groupUrlPatterns });
    }
  } catch (error) {
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab.url) {
    processTab(tab);
  }
});

async function processTab(tab) {
  try {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      return;
    }

    let hostname;
    try {
      const urlObj = new URL(tab.url);
      hostname = urlObj.hostname;
    } catch (error) {
      return;
    }
    
    let matchedGroup = null;
    
    await discoverExistingGroups();
    
    for (const [groupName, patterns] of Object.entries(groupUrlPatterns)) {
      if (Array.isArray(patterns)) {
        for (const pattern of patterns) {
          if (hostname.includes(pattern) || pattern.includes(hostname)) {
            matchedGroup = groupName;
            break;
          }
        }
      }
      
      if (matchedGroup) break;
    }
    
    if (matchedGroup) {
      await addTabToGroup(tab, matchedGroup);
    }
  } catch (error) {
  }
}

async function addTabToGroup(tab, groupName) {
  try {
    let groupId = existingGroups[groupName];
    
    if (groupId) {
      try {
        await chrome.tabs.group({ tabIds: tab.id, groupId: groupId });
      } catch (error) {
        groupId = null;
        delete existingGroups[groupName];
      }
    }
    
    if (!groupId) {
      try {
        const newGroupId = await chrome.tabs.group({ tabIds: [tab.id] });
        await chrome.tabGroups.update(newGroupId, { title: groupName });
        
        existingGroups[groupName] = newGroupId;
      } catch (error) {
      }
    }
  } catch (error) {
  }
}

chrome.tabGroups.onUpdated.addListener((group) => {
  existingGroups[group.title] = group.id;
  
  updateGroupPatterns(group);
});

chrome.tabGroups.onRemoved.addListener((groupId) => {
  for (const [groupName, id] of Object.entries(existingGroups)) {
    if (id === groupId) {
      delete existingGroups[groupName];
      break;
    }
  }
});

async function updateGroupPatterns(group) {
  try {
    const tabs = await chrome.tabs.query({ groupId: group.id });
    
    if (tabs.length > 0) {
      if (!groupUrlPatterns[group.title]) {
        groupUrlPatterns[group.title] = [];
      }
      
      for (const tab of tabs) {
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
          continue;
        }
        
        try {
          const urlObj = new URL(tab.url);
          const hostname = urlObj.hostname;
          
          if (!groupUrlPatterns[group.title].includes(hostname)) {
            groupUrlPatterns[group.title].push(hostname);
          }
        } catch (error) {
        }
      }
      
      await chrome.storage.sync.set({ urlPatterns: groupUrlPatterns });
    }
  } catch (error) {
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.urlPatterns) {
    groupUrlPatterns = changes.urlPatterns.newValue;
  }
}); 