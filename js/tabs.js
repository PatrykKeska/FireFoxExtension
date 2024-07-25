document.addEventListener("DOMContentLoaded", () => {
  const tablinks = document.querySelectorAll(".tablinks");
  const tabcontent = document.querySelectorAll(".tabcontent");

  function openTab(tabName) {
    tabcontent.forEach((content) => {
      content.style.display = "none";
    });
    tablinks.forEach((link) => {
      link.className = link.className.replace(" active", "");
    });
    document.getElementById(tabName).style.display = "flex";
    document.querySelector(`[data-tab="${tabName}"]`).className += " active";
  }

  tablinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      openTab(event.target.getAttribute("data-tab"));
    });
  });

  // Open Tab1 by default
  openTab("Tab1");
});
