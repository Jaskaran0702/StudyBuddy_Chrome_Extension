// // Define the urlFilter that we want our webNavigation listener to catch
// // Gets recreated every time the service worker is restarted.
// // filter = [
// //     // If the host portion of the user's URL CONTAINS (not matches exactly)
// //     // any of the following, it will trigger the listener
// //     { hostContains: "youtube.com" },
// //     { hostContains: "instagram.com" },
// //     { hostContains: "twitter.com" },
// //     { hostContains: "reddit.com" },
// // ];
// let filter = [];

// function updateFilter() {
//     // Retrieve the list of blocked URLs from storage
//     chrome.storage.sync.get({ allUrls: [] }, function (result) {
//         filter = result.allUrls.map(url => ({ hostContains: url }));
//     });
// }

// // Call updateFilter initially to load the URLs on extension startup
// updateFilter();

// // When chrome navigates to one of the urls matching our urlFilter...
// chrome.webNavigation.onBeforeNavigate.addListener(
//     (details) => {
//         // Get the current system mode and when the most recent snooze expires
//         chrome.storage.sync.get(
//             { mode: false, endSnooze: null },
//             function (result) {
//                 // If study mode is ON and our most recent snooze either
//                 // doesn't exist or the expiration date has already passed...
//                 if (
//                     result.mode &&
//                     (!result.endSnooze ||
//                         new Date(result.endSnooze) < new Date())
//                 ) {
//                     // Update the url of the user's current tab to point to our alternatively defined HTML page
//                     // Because this depends on the user's browser, we let chrome figure out the exact URL
//                     chrome.tabs.update(details.tabId, {
//                         url: chrome.runtime.getURL("/html/altPage.html"),
//                     });
//                 }
//             }
//         );
//     },
//     { url: filter }
// );
// Define the urlFilter that we want our webNavigation listener to catch
let filter = [];

function updateFilter() {
    // Retrieve the list of blocked URLs from storage
    chrome.storage.sync.get({ allUrls: [] }, function (result) {
        filter = result.allUrls.map(url => ({ hostContains: url }));
    });
}

// Call updateFilter initially to load the URLs on extension startup
updateFilter();

// When chrome navigates, check if the URL matches the filter
chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
        // Get the current system mode and when the most recent snooze expires
        chrome.storage.sync.get(
            { mode: false, endSnooze: null },
            function (result) {
                // If study mode is ON and our most recent snooze either
                // doesn't exist or the expiration date has already passed...
                if (
                    result.mode &&
                    (!result.endSnooze ||
                        new Date(result.endSnooze) < new Date())
                ) {
                    // Check if the URL matches any of the blocked URLs
                    const isBlocked = filter.some(rule => {
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
            }
        );
    }
);

// Listen for changes to the list of blocked URLs
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request === "updateUrls") {
            updateFilter();
        }
    }
);
