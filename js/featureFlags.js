function executeInCurrentTab(func, args) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: func,
        args: args,
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const userInput = document.getElementById("userInput");
  const textList = document.createElement("ul");
  document.getElementById("Tab2").appendChild(textList);

  // Load saved texts from local storage
  let savedTexts = JSON.parse(localStorage.getItem("savedTexts")) || [];

  // Add default item if not added before
  const defaultItem = { value: "useFlatServices=1", isActive: true };
  if (!localStorage.getItem("defaultItemAdded")) {
    savedTexts.push(defaultItem);
    localStorage.setItem("savedTexts", JSON.stringify(savedTexts));
    localStorage.setItem("defaultItemAdded", "true");
  }

  // Function to check URL for parameters
  const checkUrlParams = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => window.location.href,
          },
          (results) => {
            const currentUrl = results[0].result;
            const url = new URL(currentUrl);
            const params = new URLSearchParams(url.search);

            savedTexts.forEach((textObj) => {
              const param = textObj.value.split("=")[0];
              textObj.isActive = params.has(param);
            });

            localStorage.setItem("savedTexts", JSON.stringify(savedTexts));
            renderTexts();
          }
        );
      }
    });
  };

  // Function to render the list of texts
  const renderTexts = () => {
    textList.innerHTML = "";
    textList.classList.add("feature-flags-list");
    savedTexts.forEach((textObj) => {
      const listItem = document.createElement("li");
      listItem.classList.add("feature-flags-list-element");

      const span = document.createElement("span");
      span.textContent = textObj.value;
      span.classList.add("list-element-text");

      listItem.appendChild(span);

      const switchWrapper = document.createElement("div");
      switchWrapper.classList.add("switch-wrapper");

      const switchLabel = document.createElement("label");
      switchLabel.classList.add("switch");

      const switchInput = document.createElement("input");
      switchInput.type = "checkbox";
      switchInput.checked = textObj.isActive || false;
      switchInput.addEventListener("change", () => {
        textObj.isActive = switchInput.checked;
        localStorage.setItem("savedTexts", JSON.stringify(savedTexts));
        if (switchInput.checked) {
          executeInCurrentTab(executeUrlUpdate, [textObj.value]);
        } else {
          executeInCurrentTab(removeUrlParam, [textObj.value]);
        }
      });

      const slider = document.createElement("span");
      slider.classList.add("slider", "round");

      switchLabel.appendChild(switchInput);
      switchLabel.appendChild(slider);
      switchWrapper.appendChild(switchLabel);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn-small");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        savedTexts.splice(savedTexts.indexOf(textObj), 1);
        localStorage.setItem("savedTexts", JSON.stringify(savedTexts));
        renderTexts();
      });

      switchWrapper.appendChild(deleteButton);

      listItem.appendChild(switchWrapper);
      textList.appendChild(listItem);
    });
  };

  // Function to add URL parameter
  const executeUrlUpdate = (text) => {
    let currentUrl = window.location.href;
    if (!currentUrl.includes(text)) {
      const queryChar = currentUrl.includes("?") ? "&" : "?";
      const newUrl = currentUrl + queryChar + text;
      window.location.href = newUrl;
    }
  };

  // Function to remove URL parameter
  const removeUrlParam = (text) => {
    let currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const params = new URLSearchParams(url.search);
    params.delete(text.split("=")[0]);
    url.search = params.toString();
    window.location.href = url.toString();
  };

  // Function to show popup message
  const showPopupMessage = (message) => {
    alert(message);
  };

  // Initial render
  checkUrlParams();

  // Save button click handler
  saveButton.addEventListener("click", () => {
    const text = { value: userInput.value.trim(), isActive: false };
    if (text.value) {
      const isDuplicate = savedTexts.some(
        (savedText) => savedText.value === text.value
      );
      if (isDuplicate) {
        showPopupMessage("Feature flag already exists!");
      } else {
        savedTexts.push(text);
        localStorage.setItem("savedTexts", JSON.stringify(savedTexts));
        userInput.value = ""; // Clear the input field
        renderTexts();
      }
    }
  });

  // Check URL params on page load and history change
  window.addEventListener("load", checkUrlParams);
  window.addEventListener("popstate", checkUrlParams);
});
