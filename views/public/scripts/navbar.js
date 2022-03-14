/**
 * Modify navbar and add functionality to elements
 *
 * @type {HTMLBodyElement}
 */
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

    if (sidebar.classList.contains("close")) {
        localStorage.setItem('closed', 'enabled');
    } else {
        localStorage.setItem('closed', 'disabled');
    }
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
        localStorage.setItem('darkMode', 'enabled');
    } else {
        modeText.innerText = "Dark Mode";
        localStorage.setItem('darkMode', 'disabled');
    }
});

// Load darkMode value from localstorage and set darkMode if enabled
if(localStorage.getItem('darkMode') === 'enabled'){
    document.body.classList.add('no_transition')
    document.body.classList.add('dark');
    setTimeout(() => document.body.classList.remove("no_transition"), 1);
}
if(localStorage.getItem('closed') === 'enabled'){
    sidebar.classList.add('no_transition')
    sidebar.classList.add('close');
    setTimeout(() => sidebar.classList.remove("no_transition"), 1);
}