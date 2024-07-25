export const skForm = () => {
  const formDataSK = {
    "customer.name": "Jan",
    "customer.surname": "Kowalski",
    birthdate: {
      day: "1",
      month: "0",
      year: "1990",
    },
    "customer.phoneNumber": "522333111",
    "customer.email": "jan.kowalski@example.com",
    "customer.address": "Ulica 123",
    "customer.postCode": "81000",
    "customer.city": "Bratislava",
    persons: [
      {
        name: "Jan",
        surname: "Kowalski",
        birthdate: {
          day: "1",
          month: "0",
          year: "1990",
        },
        title: "Male",
      },
      {
        name: "Anna",
        surname: "Nowak",
        birthdate: {
          day: "2",
          month: "1",
          year: "1985",
        },
        title: "Female",
      },
      {
        name: "Jan",
        surname: "Kowalski",
        birthdate: {
          day: "1",
          month: "0",
          year: "1990",
        },
        title: "Male",
      },
      {
        name: "Anna",
        surname: "Nowak",
        birthdate: {
          day: "2",
          month: "1",
          year: "1985",
        },
        title: "Female",
      },
    ],
    children: [
      {
        name: "Kasia",
        surname: "Kowalska",
        birthdate: {
          day: "3",
          month: "2",
          year: "2015",
        },
        title: "Female",
      },
      {
        name: "Piotr",
        surname: "Kowalski",
        birthdate: {
          day: "4",
          month: "3",
          year: "2018",
        },
        title: "Male",
      },
      {
        name: "Kasia",
        surname: "Kowalska",
        birthdate: {
          day: "3",
          month: "2",
          year: "2015",
        },
        title: "Female",
      },
      {
        name: "Piotr",
        surname: "Kowalski",
        birthdate: {
          day: "4",
          month: "3",
          year: "2018",
        },
        title: "Male",
      },
    ],
  };

  const triggerEvents = (input) => {
    ["input", "change", "blur"].forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true });
      input.dispatchEvent(event);
    });
  };

  const setNativeValue = (input, value) => {
    const valueDescriptor = Object.getOwnPropertyDescriptor(input, "value");
    const prototype = Object.getPrototypeOf(input);
    const prototypeValueDescriptor = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    );

    if (
      valueDescriptor &&
      valueDescriptor.set &&
      valueDescriptor.set !== prototypeValueDescriptor.set
    ) {
      prototypeValueDescriptor.set.call(input, value);
    } else if (valueDescriptor && valueDescriptor.set) {
      valueDescriptor.set.call(input, value);
    } else {
      input.value = value;
    }

    triggerEvents(input);
  };

  const setInputValue = (selector, value) => {
    const input = document.querySelector(selector);
    if (input) {
      try {
        setNativeValue(input, value);
      } catch (error) {}
    }
  };

  const setPhoneNumberValue = (selector, value) => {
    const input = document.querySelector(selector);
    if (input) {
      try {
        if (input.type === "tel") {
          input.focus();
          input.value = "";
          for (const char of value) {
            input.value += char;
            input.dispatchEvent(
              new KeyboardEvent("keydown", { bubbles: true })
            );
            input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
            input.dispatchEvent(
              new KeyboardEvent("keypress", { bubbles: true })
            );
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
          input.blur();
        } else {
          setNativeValue(input, value);
        }
      } catch (error) {}
    }
  };

  const setSelectValue = (selector, value) => {
    const select = document.querySelector(selector);
    if (select) {
      const option = Array.from(select.options).find(
        (opt) => opt.value === value
      );
      if (option) {
        try {
          select.value = option.value;
          triggerEvents(select);
        } catch (error) {}
      }
    }
  };

  // Fill text inputs for Customer
  setInputValue(`[name="customer.name"]`, formDataSK["customer.name"]);
  setInputValue(`[name="customer.surname"]`, formDataSK["customer.surname"]);
  setInputValue(`[name="customer.email"]`, formDataSK["customer.email"]);
  setInputValue(`[name="customer.address"]`, formDataSK["customer.address"]);
  setInputValue(`[name="customer.postCode"]`, formDataSK["customer.postCode"]);
  setInputValue(`[name="customer.city"]`, formDataSK["customer.city"]);

  document.querySelectorAll("select").forEach((select) => {
    Array.from(select.options).forEach((option) => {
      if (option.value === "SK") {
        select.value = option.value;
        // Trigger change event
        const event = new Event("change", { bubbles: true });
        select.dispatchEvent(event);
      }
    });
  });

  // Use special handling for phone number input
  setPhoneNumberValue(
    `[name="customer.phoneNumber"]`,
    formDataSK["customer.phoneNumber"]
  );

  // Fill Customer Birthdate select inputs
  setSelectValue(
    `[data-testid="customer-birthdate-day"]`,
    formDataSK.birthdate.day
  );
  setSelectValue(
    `[data-testid="customer-birthdate-month"]`,
    formDataSK.birthdate.month
  );
  setSelectValue(
    `[data-testid="customer-birthdate-year"]`,
    formDataSK.birthdate.year
  );

  // Fill form data for Persons/Adults
  formDataSK.persons.forEach((person, index) => {
    setInputValue(`[name="adults.${index}.name"]`, person.name);
    setInputValue(`[name="adults.${index}.surname"]`, person.surname);
    setSelectValue(
      `[data-testid="adults-${index}-birthdate-day"]`,
      person.birthdate.day
    );
    setSelectValue(
      `[data-testid="adults-${index}-birthdate-month"]`,
      person.birthdate.month
    );
    setSelectValue(
      `[data-testid="adults-${index}-birthdate-year"]`,
      person.birthdate.year
    );
    setSelectValue(`[data-testid="title-adult-${index}}"]`, person.title); // there is no typo here it should be }
  });

  // Fill form data for Children
  formDataSK.children.forEach((child, index) => {
    setInputValue(`[name="children.${index}.name"]`, child.name);
    setInputValue(`[name="children.${index}.surname"]`, child.surname);
    setSelectValue(
      `[data-testid="children-${index}-birthdate-day"]`,
      child.birthdate.day
    );
    setSelectValue(
      `[data-testid="children-${index}-birthdate-month"]`,
      child.birthdate.month
    );
    setSelectValue(
      `[data-testid="children-${index}-birthdate-year"]`,
      child.birthdate.year
    );
    setSelectValue(`[data-testid="title-child-${index}}"]`, child.title); // there is no typo here it should be }
  });
};
