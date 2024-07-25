export function selectRandomPaymentMethod() {
  const paymentMethods = document.querySelectorAll('input[name="method"]');
  const button = document.querySelector(
    '[data-testid="wizard-sidebar-next-button"]'
  );

  const preferredTestIds = [
    "payment-method-traditionaltransfer",
    "payment-method-creditcard",
    "payment-method-googlepay",
    "payment-method-blik",
  ];

  const availableMethods = Array.from(paymentMethods).filter(
    (method) => !method.disabled
  );

  let selectedMethod;

  for (const testId of preferredTestIds) {
    selectedMethod = availableMethods.find(
      (method) => method.getAttribute("data-testid") === testId
    );
    if (selectedMethod) break;
  }

  if (!selectedMethod) {
    const randomIndex = Math.floor(Math.random() * availableMethods.length);
    selectedMethod = availableMethods[randomIndex];
  }

  if (selectedMethod) {
    selectedMethod.click();
    setTimeout(() => button.click(), 500);
    console.log(`Selected payment method: ${selectedMethod.value}`);
  } else {
    console.log("No payment methods available");
  }
}
