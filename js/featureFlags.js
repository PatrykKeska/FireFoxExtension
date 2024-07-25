function executeInCurrentTab(func, args) {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        browser.tabs.executeScript(
          tabs[0].id,
          { code: `(${func.toString()})(${JSON.stringify(args)})` },
          (result) => {
            if (browser.runtime.lastError) {
              console.error(
                "Error executing script:",
                browser.runtime.lastError
              );
              resolve(null);
            } else {
              resolve(result && result[0] ? result[0] : null);
            }
          }
        );
      } else {
        console.warn("No active tab found");
        resolve(null);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const userInput = document.getElementById("userInput");
  const textList = document.createElement("ul");
  document.getElementById("Tab2").appendChild(textList);

  let savedTexts = [];

  // Load saved texts from storage
  browser.storage.local.get("savedTexts", (result) => {
    savedTexts = result.savedTexts || [];

    // Add default item if not added before
    const defaultItem = { value: "useFlatServices=1", isActive: true };
    browser.storage.local.get("defaultItemAdded", (result) => {
      if (!result.defaultItemAdded) {
        savedTexts.push(defaultItem);
        browser.storage.local.set({
          savedTexts: savedTexts,
          defaultItemAdded: true,
        });
      }
      renderTexts();
    });
  });

  const checkUrlParams = () => {
    executeInCurrentTab(() => window.location.href).then((currentUrl) => {
      if (currentUrl) {
        const url = new URL(currentUrl);
        const params = new URLSearchParams(url.search);

        savedTexts.forEach((textObj) => {
          const param = textObj.value.split("=")[0];
          textObj.isActive = params.has(param);
        });

        browser.storage.local.set({ savedTexts: savedTexts });
        renderTexts();
      }
    });
  };

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
        browser.storage.local.set({ savedTexts: savedTexts });
        if (switchInput.checked) {
          executeInCurrentTab(executeUrlUpdate, [textObj.value]).then(
            (result) => {
              if (result === null) {
                console.warn("Failed to execute URL update");
              }
            }
          );
        } else {
          executeInCurrentTab(removeParamAndReload, [
            textObj.value.split("=")[0],
          ]);
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
        browser.storage.local.set({ savedTexts: savedTexts });
        renderTexts();
      });

      switchWrapper.appendChild(deleteButton);

      listItem.appendChild(switchWrapper);
      textList.appendChild(listItem);
    });
  };

  const executeUrlUpdate = (text) => {
    let currentUrl = window.location.href;
    if (!currentUrl.includes(text)) {
      const queryChar = currentUrl.includes("?") ? "&" : "?";
      const newUrl = currentUrl + queryChar + text;
      window.location.href = newUrl;
    }
    return window.location.href;
  };

  const removeParamAndReload = (param) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState({}, "", url.toString());
    window.location.reload();
  };

  const showPopupMessage = (message) => {
    alert(message);
  };

  checkUrlParams();

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
        browser.storage.local.set({ savedTexts: savedTexts });
        userInput.value = "";
        renderTexts();
      }
    }
  });

  window.addEventListener("load", checkUrlParams);
  window.addEventListener("popstate", checkUrlParams);
});
