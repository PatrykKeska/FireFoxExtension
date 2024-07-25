let lastUrl = location.href;

function checkUrlChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Remove the skipFirstStep call from here
  }
  setTimeout(checkUrlChange, 100);
}

export function skipFirstStep() {
  let btn = document.querySelector(
    'button[data-testid="wizard-sidebar-next-button"]'
  );

  function findButton() {
    const buttons = document.querySelectorAll("button");
    return Array.from(buttons).find((btn) => {
      const classes = Array.from(btn.classList);
      return (
        classes.some((c) => c.startsWith("styles_c__")) &&
        classes.some((c) => c.includes("primary")) &&
        classes.some((c) => c.includes("fullWidth"))
      );
    });
  }

  let mobileButton = findButton();
  if (btn) {
    btn.click();
    setTimeout(() => {
      btn.click();
    }, 1000);
  }
  if (mobileButton) {
    mobileButton.click();
  }
}

checkUrlChange();

// Now skipFirstStep can be called from elsewhere as needed
