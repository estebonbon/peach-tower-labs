// async function loadNavbar() {
//     try {
//         const response = await fetch("navbar.html");

//         if (!response.ok) {
//             throw new Error("Unable to load navigation.");
//         }

//         const html = await response.text();

//         document.getElementById("navbar-container").innerHTML = html;

//         const sidebar = document.getElementById("sidebar");
//         const mobileBtn = document.getElementById("mobile-toggle-btn");
//         const overlay = document.getElementById("sidebar-overlay");
//         const logo = document.getElementById("sidebar-logo");
//         const content = document.querySelector(".content");
//         const menuIcon = mobileBtn.querySelector("i");

//         const mobileScreen = window.matchMedia("(max-width: 768px)");

//         // Open and close mobile menu
//         function toggleMobileMenu() {
//             const isOpen = sidebar.classList.toggle("mobile-open");

//             overlay.classList.toggle("show", isOpen);
//             mobileBtn.setAttribute("aria-expanded", isOpen);
//             mobileBtn.setAttribute(
//                 "aria-label",
//                 isOpen ? "Close navigation menu" : "Open navigation menu"
//             );

//             menuIcon.classList.toggle("fa-bars", !isOpen);
//             menuIcon.classList.toggle("fa-xmark", isOpen);

//             document.body.style.overflow = isOpen ? "hidden" : "";
//         }

//         // Close mobile menu
//         function closeMobileMenu() {
//             sidebar.classList.remove("mobile-open");
//             overlay.classList.remove("show");

//             mobileBtn.setAttribute("aria-expanded", "false");
//             mobileBtn.setAttribute("aria-label", "Open navigation menu");

//             menuIcon.classList.remove("fa-xmark");
//             menuIcon.classList.add("fa-bars");

//             document.body.style.overflow = "";
//         }

//         // Hamburger button
//         mobileBtn.addEventListener("click", toggleMobileMenu);

//         // Click outside sidebar
//         overlay.addEventListener("click", closeMobileMenu);

//         // Close after selecting a navigation link
//         sidebar.querySelectorAll("nav a").forEach(link => {
//             link.addEventListener("click", closeMobileMenu);
//         });

//         // Close using Escape
//         document.addEventListener("keydown", event => {
//             if (event.key === "Escape") {
//                 closeMobileMenu();
//             }
//         });

//         // Desktop sidebar collapse
//         logo.addEventListener("click", () => {
//             if (!mobileScreen.matches) {
//                 sidebar.classList.toggle("collapsed");

//                 if (content) {
//                     content.classList.toggle("expanded");
//                 }
//             }
//         });

//         // Reset mobile menu when returning to desktop
//         mobileScreen.addEventListener("change", event => {
//             if (!event.matches) {
//                 closeMobileMenu();
//             }
//         });

//     } catch (error) {
//         console.error("Navbar error:", error);
//     }
// }

// document.addEventListener("DOMContentLoaded", loadNavbar);

async function loadNavbar() {
    try {
        const response = await fetch("navbar.html");

        if (!response.ok) {
            throw new Error("Could not load navbar.html");
        }

        const html = await response.text();

        document.getElementById("navbar-container").innerHTML = html;

        // Get navbar elements
        const sidebar = document.querySelector(".sidebar");
        const logo = document.querySelector(".sidebar .logo");
        const mobileBtn = document.getElementById("mobile-toggle-btn");
        const overlay = document.getElementById("sidebar-overlay");
        // const content = document.querySelector("#DetailsPage .content")
        //     || document.querySelector("#ArchiveDetailsPage .content")
        //     || document.querySelector(".content");
        const content = document.querySelector(
            "#DetailsPage.content, #ArchiveDetailsPage.content,#EngineeringReviewPage.content, .content");
        const mobileScreen = window.matchMedia("(max-width: 768px)");

        if (!sidebar || !logo || !mobileBtn || !overlay) {
            console.error("Navbar elements are missing.");
            return;
        }

        const menuIcon = mobileBtn.querySelector("i");

        // DESKTOP: Collapse and expand sidebar
        logo.addEventListener("click", function () {

            if (mobileScreen.matches) {
                closeMobileMenu();
                return;
            }

            sidebar.classList.toggle("collapsed");

            if (content) {
                content.classList.toggle(
                    "expanded",
                    sidebar.classList.contains("collapsed")
                );
            }
        });

        // MOBILE: Open and close menu
        mobileBtn.addEventListener("click", function () {
            const isOpen = sidebar.classList.toggle("mobile-open");

            overlay.classList.toggle("show", isOpen);

            mobileBtn.setAttribute("aria-expanded", isOpen);
            mobileBtn.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuIcon.classList.toggle("fa-bars", !isOpen);
            menuIcon.classList.toggle("fa-xmark", isOpen);

            document.body.style.overflow = isOpen ? "hidden" : "";
        });

        // Close mobile menu
        function closeMobileMenu() {
            sidebar.classList.remove("mobile-open");
            overlay.classList.remove("show");

            mobileBtn.setAttribute("aria-expanded", "false");
            mobileBtn.setAttribute("aria-label", "Open navigation menu");

            menuIcon.classList.remove("fa-xmark");
            menuIcon.classList.add("fa-bars");

            document.body.style.overflow = "";
        }

        // Click outside sidebar
        overlay.addEventListener("click", closeMobileMenu);

        // Click navigation links
        sidebar.querySelectorAll("nav a").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });

        // Escape key
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });

        // Switch between mobile and desktop
        mobileScreen.addEventListener("change", function (event) {
            closeMobileMenu();

            if (event.matches) {
                sidebar.classList.remove("collapsed");

                if (content) {
                    content.classList.remove("expanded");
                }
            }
        });

    } catch (error) {
        console.error("Navbar error:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadNavbar);
