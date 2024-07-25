export let switchStates = {};

document.addEventListener("DOMContentLoaded", function () {
  const switchIds = [
    "goToServicesSwitch",
    "goToPaymentSwitch",
    "gotoSummarySwitch",
    "suggestedSwitch",
  ];

  // Initialize switchStates from localStorage
  switchIds.forEach((switchId) => {
    const input = document.getElementById(switchId);
    if (input) {
      const storedState = localStorage.getItem(switchId);
      switchStates[switchId] = storedState === "true";
      input.checked = switchStates[switchId];

      input.addEventListener("change", function () {
        switchStates[switchId] = this.checked;
        localStorage.setItem(switchId, switchStates[switchId]);
        updateButtonVisibility();
      });
    }
  });

  // Initial button visibility update
  updateButtonVisibility();

  // Detect language and highlight button
  detectAndHighlight();
});

function detectAndHighlight(retries = 3) {
  detectLanguage((lang) => {
    if (lang) {
      localStorage.setItem("detectedLang", lang);
      highlightButton(lang);
    } else if (retries > 0) {
      setTimeout(() => detectAndHighlight(retries - 1), 1000);
    } else {
      console.error("Failed to detect language");
    }
  });
}

export function detectLanguage(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => document.documentElement.lang.toLowerCase(),
      },
      (injectionResults) => {
        const lang = injectionResults[0].result;
        callback(lang);
      }
    );
  });
}

export function highlightButton(lang) {
  const langMap = {
    pl: "pl",
    lv: "lv",
    lt: "lt",
    et: "ee",
    hu: "hu",
    cs: "cz",
    sk: "sk",
    en: "en",
  };

  const btnId = langMap[lang] || lang;
  const button = document.getElementById(btnId);

  if (button) {
    document
      .querySelectorAll(".suggested")
      .forEach((btn) => btn.classList.remove("suggested"));
    button.classList.add("suggested");
    console.log(`Added 'suggested' class to button with id: ${btnId}`);
    updateButtonVisibility();
  } else {
    console.log(`No button found for language: ${lang}`);
  }
}

function updateButtonVisibility() {
  if (switchStates["suggestedSwitch"]) {
    document.querySelectorAll(".btn").forEach((btn) => {
      if (btn.classList.contains("suggested")) {
        btn.classList.remove("hidden");
      } else {
        btn.classList.add("hidden");
      }
    });
  } else {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.remove("hidden");
    });
  }
}

// Listen for changes to the switch state
window.addEventListener("storage", () => {
  updateButtonVisibility();
});
