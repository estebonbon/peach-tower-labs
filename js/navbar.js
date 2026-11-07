// async function loadNavbar() {
//     const response = await fetch("navbar.html");
//     const html = await response.text();

//     document.getElementById("navbar-container").innerHTML = html;
// }

// document.addEventListener("DOMContentLoaded", loadNavbar);

// async function loadNavbar() {
//     const response = await fetch("navbar.html");
//     const html = await response.text();

//     document.getElementById("navbar-container").innerHTML = html;

//     const sidebar = document.querySelector(".sidebar");
//     const content = document.querySelector(".content");
//     const logo = document.querySelector(".logo");

//     logo.addEventListener("click", () => {
//         sidebar.classList.toggle("collapsed");
//         content.classList.toggle("expanded");
//     });
// }
// document.addEventListener("DOMContentLoaded", loadNavbar);

async function loadNavbar() {
    const response = await fetch("navbar.html");
    const html = await response.text();

    document.getElementById("navbar-container").innerHTML = html;

    const sidebar = document.querySelector(".sidebar");
    const mobileBtn = document.querySelector(".mobile-menu-btn");

    if (mobileBtn) {
        mobileBtn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }
    
    const logo = document.querySelector(".logo");
    const content = document.querySelector(".content");

    if (logo) {
        logo.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");

            if (content) {
                content.classList.toggle("expanded");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", loadNavbar);