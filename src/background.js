let filter = [];

function updateFilter() {
  // Retrieve the list of blocked URLs from storage
  chrome.storage.sync.get({ allUrls: [] }, function (result) {
    filter = result.allUrls.map((url) => ({ hostContains: url }));
  });
}

// Call updateFilter initially to load the URLs on extension startup
updateFilter();

// When chrome navigates, check if the URL matches the filter
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Get the current system mode and when the most recent snooze expires
  chrome.storage.sync.get({ mode: false, endSnooze: null }, function (result) {
    // If study mode is ON and our most recent snooze either
    // doesn't exist or the expiration date has already passed...
    if (
      result.mode &&
      (!result.endSnooze || new Date(result.endSnooze) < new Date())
    ) {
      // Check if the URL matches any of the blocked URLs
      const isBlocked = filter.some((rule) => {
        const url = new URL(details.url);
        return url.hostname.includes(rule.hostContains);
      });

      // If the URL is blocked, update the tab URL
      if (isBlocked) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("/html/altPage.html"),
        });
      }
    }
  });
});

// Listen for changes to the list of blocked URLs
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "updateUrls") {
    updateFilter();
  }
});
