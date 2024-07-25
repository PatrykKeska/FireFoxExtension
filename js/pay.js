function selectRandomPaymentMethod() {
  // Get all radio inputs for payment methods
  const paymentMethods = document.querySelectorAll('input[name="method"]');

  // Convert NodeList to Array and filter out any disabled methods
  const availableMethods = Array.from(paymentMethods).filter(
    (method) => !method.disabled
  );

  // Select a random method from the available ones
  const randomIndex = Math.floor(Math.random() * availableMethods.length);
  const selectedMethod = availableMethods[randomIndex];

  // Click the selected method
  if (selectedMethod) {
    selectedMethod.click();
    console.log(`Selected payment method: ${selectedMethod.value}`);
  } else {
    console.log("No payment methods available");
  }
}
