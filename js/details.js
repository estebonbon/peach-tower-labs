// // Find the controls on details.html.
// if(document.getElementById("report-details")){
//     const searchInput = document.getElementById("reportSearch");
//     const message = document.getElementById("details-message");
//     const reportDetails = document.getElementById("report-details");
//     const editLink = document.getElementById("edit-link");

//     // Display the selected NCR's information.
//     function showReport(reportId) {
//         // Show an error if the requested report does not exist.
//         if (!Object.hasOwn(reports, reportId)) {
//             reportDetails.hidden = true;
//             editLink.hidden = true;
//             message.textContent = "This NCR report could not be found.";
//             return;
//         }

//         const report = reports[reportId];

//         // Fill each labelled detail with its report value.
//         for (const element of document.querySelectorAll("[data-field]")) {
//             const field = element.dataset.field;
//             let value = report[field];

//             // Display readable process names.
//             if (field === "processApplicable") {
//                 value = value === "supplier"
//                     ? "Supplier or Rec-Insp"
//                     : "WIP (Production Order)";
//             }

//             // Display readable Yes/No values.
//             if (field === "itemMarkedNonconforming") {
//                 value = value === "yes" ? "Yes" : "No";
//             }
//             if (field === "engineeringRequired") {
//                 value = value === "yes" ? "Yes" : "No";
//             }

//             // Use textContent to display data safely.
//             element.textContent = value ?? "Not provided";

//             if (value === "") {
//                 element.textContent = "Not provided";
//             }
//         }

//         // Reveal the report information and Edit link.
//         reportDetails.hidden = false;
//         editLink.hidden = false;

//         // Link to this report on the existing Edit page.
//         editLink.href = "edit.html?id=" + encodeURIComponent(reportId);

//         // Announce the loaded report to screen readers.
//         message.textContent = reportId + " details loaded.";
//     }

//     // Read the NCR number from the URL, if supplied.
//     const requestedId = new URLSearchParams(window.location.search).get("id");

//     if (requestedId && Object.hasOwn(reports, requestedId)) {
//         selector.value = requestedId;
//     }

//     // Display another report when the dropdown changes.
//     searchInput.addEventListener("input", function () {
//     const value = searchInput.value.trim();

//     if (Object.hasOwn(reports, value)) {
//         showReport(value);
//     }
// });

//     // Display the initial report when the page opens.
//     if (requestedId) {
//     searchInput.value = requestedId;
//     showReport(requestedId);
// }
// }

if (document.getElementById("report-details")) {
    const searchInput = document.getElementById("reportSearch");
    const message = document.getElementById("details-message");
    const reportDetails = document.getElementById("report-details");
    const editLink = document.getElementById("edit-link");

    // Create the search results container.
    const resultsList = document.createElement("div");
    resultsList.id = "report-search-results";
    resultsList.className = "list-group mt-2";
    resultsList.setAttribute("role", "listbox");
    resultsList.hidden = true;

    document.querySelector(".search-box")
        .insertAdjacentElement("afterend", resultsList);

    // Hide report details until a report is selected.
    reportDetails.hidden = true;
    editLink.hidden = true;

    // Display the selected NCR's information.
    function showReport(reportId) {
        if (!Object.hasOwn(reports, reportId)) {
            reportDetails.hidden = true;
            editLink.hidden = true;
            message.textContent = "This NCR report could not be found.";
            return;
        }

        const report = reports[reportId];

        // Populate the report fields.
        document.querySelectorAll("[data-field]").forEach(element => {
            const field = element.dataset.field;
            let value = report[field];

            // Convert process codes into readable labels.
            if (field === "processApplicable") {
                const processes = {
                    "supplier-rec-insp": "Supplier or Rec-Insp",
                    "wip-production-order": "WIP (Production Order)"
                };

                value = processes[value] ?? value;
            }

            // Display Yes/No consistently.
            if (
                field === "itemMarkedNonconforming" ||
                field === "engineeringRequired"
            ) {
                const answer = String(value ?? "").toLowerCase();

                if (answer === "yes" || answer === "no") {
                    value = answer === "yes" ? "Yes" : "No";
                }
            }

            element.textContent =
                value === undefined || value === null || value === ""
                    ? "Not provided"
                    : value;
        });

        // Reveal the selected report.
        reportDetails.hidden = false;
        editLink.hidden = false;

        // Pass the selected NCR ID to the Edit page.
        editLink.href = "edit.html?id=" +
            encodeURIComponent(reportId);

        // Show the selected report in the search box.
        searchInput.value =
            `${reportId} — ${report.supplier}`;

        resultsList.hidden = true;
        resultsList.replaceChildren();

        message.textContent = `${reportId} details loaded.`;
    }

    // Search by NCR number or supplier name.
    function searchReports() {
        const query = searchInput.value.trim().toLowerCase();

        resultsList.replaceChildren();
        reportDetails.hidden = true;
        editLink.hidden = true;

        if (!query) {
            resultsList.hidden = true;
            message.textContent = "";
            return;
        }

        const matches = Object.entries(reports).filter(
            ([reportId, report]) =>
                reportId.toLowerCase().includes(query) ||
                (report.supplier ?? "").toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            resultsList.hidden = true;
            message.textContent = "No matching NCR reports found.";
            return;
        }

        // Create a clickable result for each match.
        matches.forEach(([reportId, report]) => {
            const result = document.createElement("button");

            result.type = "button";
            result.className = "list-group-item list-group-item-action";
            result.setAttribute("role", "option");
            result.textContent =
                `${reportId} — ${report.supplier}`;

            result.addEventListener("click", () => {
                showReport(reportId);
            });

            resultsList.appendChild(result);
        });

        resultsList.hidden = false;
        message.textContent =
            `${matches.length} matching report(s) found.`;
    }

    // Update results as the user types.
    searchInput.addEventListener("input", searchReports);

    // Load an NCR when its ID is supplied in the URL.
    const requestedId =
        new URLSearchParams(window.location.search).get("id");

    if (requestedId) {
        if (Object.hasOwn(reports, requestedId)) {
            showReport(requestedId);
        } else {
            message.textContent =
                "This NCR report could not be found.";
        }
    }
}