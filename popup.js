import { plForm } from "./tenants/pl.js";
import { lvForm } from "./tenants/lv.js";
import { ltForm } from "./tenants/lt.js";
import { eeForm } from "./tenants/ee.js";
import { huForm } from "./tenants/hu.js";
import { czForm } from "./tenants/cz.js";
import { skForm } from "./tenants/sk.js";
import { switchStates } from "./js/switch.js";
import { selectRandomPaymentMethod } from "./js/choosePayment.js";
import { skipFirstStep } from "./js/skipFirstStep.js";
import { nextStep } from "./js/nextStep.js";
import { enForm } from "./tenants/en.js";

const buttonFunctionMap = {
  "btn-pl": plForm,
  "btn-lv": lvForm,
  "btn-lt": ltForm,
  "btn-ee": eeForm,
  "btn-hu": huForm,
  "btn-cz": czForm,
  "btn-sk": skForm,
  "btn-en": enForm,
};

function executeInCurrentTab(func, args = []) {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        browser.tabs.executeScript(
          tabs[0].id,
          { code: `(${func.toString()})(${JSON.stringify(args)})` },
          (results) => {
            if (results && results[0] instanceof Promise) {
              results[0].then(resolve);
            } else {
              resolve(results);
            }
          }
        );
      } else {
        resolve();
      }
    });
  });
}

function getCurrentTabUrl() {
  return new Promise((resolve) => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        resolve(tabs[0].url);
      } else {
        resolve(null);
      }
    });
  });
}

function waitForUrlChange(...expectedUrls) {
  return new Promise((resolve) => {
    const checkUrl = async () => {
      const currentUrl = await getCurrentTabUrl();
      if (expectedUrls.some((url) => currentUrl.includes(url))) {
        resolve(currentUrl);
      } else {
        setTimeout(checkUrl, 500); // Check every 500ms
      }
    };
    checkUrl();
  });
}

async function executeAndWaitForUrlChange(func, params, expectedUrl) {
  console.log(
    `Executing function and waiting for URL to include: ${expectedUrl}`
  );
  await executeInCurrentTab(func, params ? [params] : []);
  const newUrl = await waitForUrlChange(expectedUrl);
  console.log("URL changed to:", newUrl);
  return newUrl;
}

function logPageContent() {
  console.log("Page content:", document.body.innerHTML);
}

async function handleButtonClick(buttonId, params) {
  console.log("Button clicked:", buttonId);
  let initialUrl = await getCurrentTabUrl();
  console.log("Initial URL:", initialUrl);

  // Initial form filling
  await executeInCurrentTab(
    buttonFunctionMap[buttonId],
    params ? [params] : []
  );

  // Wait for a short time to allow for potential URL change
  await new Promise((resolve) => setTimeout(resolve, 500));

  let currentUrl = await getCurrentTabUrl();
  console.log("Current URL after initial action:", currentUrl);

  // If URL hasn't changed, trigger another click
  if (currentUrl === initialUrl) {
    console.log("URL didn't change, triggering another click");
    await executeInCurrentTab(
      buttonFunctionMap[buttonId],
      params ? [params] : []
    );
    currentUrl = await getCurrentTabUrl();
    console.log("Current URL after second click:", currentUrl);
  }

  // Check if we've gone directly to payment
  if (currentUrl.includes("/booking/payment")) {
    console.log("Directly at payment page, skipping services step");
  }
  // Go to services if needed and if the page exists
  else if (
    switchStates["goToServicesSwitch"] &&
    !currentUrl.includes("/booking/services")
  ) {
    console.log("Attempting to go to services page");
    await executeInCurrentTab(skipFirstStep);
    currentUrl = await waitForUrlChange(
      "/booking/services",
      "/booking/payment"
    );
    console.log("URL after attempting to go to services:", currentUrl);
  }

  // If we're not at payment page yet
  if (
    !currentUrl.includes("/booking/payment") &&
    switchStates["goToPaymentSwitch"]
  ) {
    console.log("Going to payment page");
    currentUrl = await executeAndWaitForUrlChange(
      nextStep,
      null,
      "/booking/payment"
    );
    console.log("URL after going to payment:", currentUrl);
  }

  // Go to summary
  if (
    switchStates["gotoSummarySwitch"] &&
    currentUrl.includes("/booking/payment")
  ) {
    console.log("At payment page, selecting random payment method");
    await executeInCurrentTab(selectRandomPaymentMethod);
    console.log("Random payment method selected, waiting for any changes");

    // Wait for a short time to allow for any changes
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if URL has changed
    let newUrl = await getCurrentTabUrl();
    console.log("URL after selecting payment method:", newUrl);

    // Log page content
    await executeInCurrentTab(logPageContent);

    // If URL hasn't changed, try to move to summary
    if (newUrl === currentUrl) {
      console.log(
        "URL didn't change after selecting payment, attempting to move to summary"
      );
      currentUrl = await executeAndWaitForUrlChange(
        nextStep,
        null,
        "/booking/summary"
      );
      console.log("URL after attempting to go to summary:", currentUrl);
    } else {
      currentUrl = newUrl;
    }
  }

  console.log("Process completed. Final URL:", currentUrl);
}

Object.keys(buttonFunctionMap).forEach((buttonId) => {
  const button = document.querySelector(`.${buttonId}`);
  if (button) {
    button.addEventListener("click", () =>
      handleButtonClick(buttonId, {
        switchStates,
      })
    );
  }
});

// Update selectRandomPaymentMethod in choosePayment.js
// export function selectRandomPaymentMethod() {
//   console.log("Starting selectRandomPaymentMethod");
//   const paymentMethods = document.querySelectorAll(".payment-method");
//   console.log(`Found ${paymentMethods.length} payment methods`);
//   if (paymentMethods.length > 0) {
//     const randomIndex = Math.floor(Math.random() * paymentMethods.length);
//     console.log(`Selecting payment method at index ${randomIndex}`);
//     paymentMethods[randomIndex].click();
//     console.log("Payment method selected");
//   } else {
//     console.log("No payment methods found");
//   }
// }
