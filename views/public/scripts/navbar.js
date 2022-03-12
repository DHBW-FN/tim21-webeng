// Defining and getting object to later modify
const body = document.querySelector("body");
const sidebar = body.querySelector(".sidebar");
const toggle = body.querySelector(".toggle");
const searchBtn = body.querySelector(".search-box");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");

// Add click event to open/close button of sidebar to open/close sidebar
toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

// Add click event to search button to expand(open) sidebar
searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});

// Add click event to mode switch to switch between light and dark mode
modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light Mode";
    } else {
        modeText.innerText = "Dark Mode";
    }
});