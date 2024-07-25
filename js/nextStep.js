export function nextStep() {
  const button = document.querySelector(
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

  const mobileButton = findButton();

  if (button) {
    button.click();
  }
  if (mobileButton) {
    mobileButton.click();
  }
}
