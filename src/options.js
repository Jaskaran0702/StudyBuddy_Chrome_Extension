const urlInput = document.getElementById("urlInput");
const addUrlButton = document.getElementById("addUrlButton");
const deleteUrlButton = document.getElementById("deleteUrlButton");
const urlsDiv = document.getElementById("enabledUrls");
const clearButton = document.getElementById("clearButton");

let urlsList = [];

function createUrlItem(urlText) {
  const urlItem = document.createElement("p");
  urlItem.textContent = urlText;
  urlItem.classList.add("urlItem");
  urlsDiv.appendChild(urlItem); // Append to the urlsDiv instead of document.body
}

function printFromStorage() {
  chrome.storage.sync.get({ allUrls: [] }, function (result) {
    const urlsArray = result.allUrls;

    if (!urlsArray) return;

    for (let i = 0; i < urlsArray.length; i++)
      console.log("urlsArray[" + i + "] = " + urlsArray[i]);
  });
}

function alreadyHaveUrl(url) {
  if (urlsList.indexOf(url) !== -1) return true;
  return false;
}

window.onload = function () {
  urlsList = [];

  chrome.storage.sync.get({ allUrls: [] }, function (result) {
    const urlsArray = result.allUrls;
    for (let i = 0; i < urlsArray.length; i++) {
      createUrlItem(urlsArray[i]);
      urlsList.push(urlsArray[i]);
    }
  });
};

addUrlButton.addEventListener("click", function () {
  const newUrlText = urlInput.value.toLowerCase();

  if (alreadyHaveUrl(newUrlText)) {
    alert("That URL is already in the list!");
    return;
  }

  createUrlItem(newUrlText);
  urlsList.push(newUrlText);

  chrome.storage.sync.set({ allUrls: urlsList });

  chrome.runtime.sendMessage("updateUrls", function (response) {
    console.log(response ?? "Couldn't update service worker");
  });

  urlInput.value = "";
});



deleteUrlButton.addEventListener("click", function () {
  const newUrlText = urlInput.value.toLowerCase();

  if (!alreadyHaveUrl(newUrlText)) {
    alert("That URL is not in the list!");
    return;
  }

  urlsList = urlsList.filter((url) => url !== newUrlText);

  const urlItems = document.getElementsByClassName("urlItem");

  for (let i = 0; i < urlItems.length; i++) {
    if (urlItems[i].textContent === newUrlText) {
      urlItems[i].remove();
      break;
    }
  }

  chrome.storage.sync.set({ allUrls: urlsList });

  chrome.runtime.sendMessage("updateUrls", function (response) {
    console.log(response ?? "Couldn't update service worker");
  });

  urlInput.value = "";
});

clearButton.addEventListener("click", function () {
  chrome.storage.sync.set({ allUrls: [] }, function () {
    const urlItems = document.getElementsByClassName("urlItem");

    for (let i = urlItems.length - 1; i >= 0; i--) urlItems[i].remove();

    urlsList = [];
  });

  chrome.runtime.sendMessage("updateUrls", function (response) {
    console.log(response ?? "Couldn't update service worker");
  });
});
