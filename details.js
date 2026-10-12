// Sample NCR reports matching the Edit page.
const reports = {
    "NCR-001": {
        process: "supplier",
        supplier: "Maple Industrial Supplies",
        ncrNumber: "NCR-001",
        reference: "PO-45821",
        salesOrder: "SO-78210",
        item: "Steel mounting bracket, SAP No. 104582",
        received: "20",
        defective: "3",
        defect: "Three brackets have cracks near the mounting holes.",
        marked: "yes",
        qualityRep: "Sarah Wilson",
        qualityDate: "2026-10-01",
        additional: "Inspection photos show cracks beside the mounting holes."
    },

    "NCR-002": {
        process: "wip",
        supplier: "Northern Metalworks",
        ncrNumber: "NCR-002",
        reference: "PROD-63142",
        salesOrder: "SO-78235",
        item: "Aluminium enclosure panel, SAP No. 207316",
        received: "15",
        defective: "2",
        defect: "Two panels were scratched during assembly, exposing the metal beneath the coating.",
        marked: "yes",
        qualityRep: "Omar Ali",
        qualityDate: "2026-10-02",
        additional: "Surface inspection photos document the coating damage."
    },

    "NCR-003": {
        process: "supplier",
        supplier: "Precision Fastener Supply",
        ncrNumber: "NCR-003",
        reference: "PO-45903",
        salesOrder: "SO-78301",
        item: "M12 × 40 mm hex bolt, SAP No. 309724",
        received: "50",
        defective: "10",
        defect: "Ten bolts measure 35 mm in length instead of the specified 40 mm.",
        marked: "yes",
        qualityRep: "Grace Thompson",
        qualityDate: "2026-10-01",
        additional: "Measurement records confirm the incorrect bolt lengths."
    }
};

// Find the controls on details.html.
const selector = document.getElementById("reportSelect");
const message = document.getElementById("details-message");
const reportDetails = document.getElementById("report-details");
const editLink = document.getElementById("edit-link");

// Display the selected NCR's information.
function showReport(reportId) {
    // Show an error if the requested report does not exist.
    if (!Object.hasOwn(reports, reportId)) {
        reportDetails.hidden = true;
        editLink.hidden = true;
        message.textContent = "This NCR report could not be found.";
        return;
    }

    const report = reports[reportId];

    // Fill each labelled detail with its report value.
    for (const element of document.querySelectorAll("[data-field]")) {
        const field = element.dataset.field;
        let value = report[field];

        // Display readable process names.
        if (field === "process") {
            value = value === "supplier"
                ? "Supplier or Rec-Insp"
                : "WIP (Production Order)";
        }

        // Display readable Yes/No values.
        if (field === "marked") {
            value = value === "yes" ? "Yes" : "No";
        }

        // Use textContent to display data safely.
        element.textContent = value ?? "Not provided";

        if (value === "") {
            element.textContent = "Not provided";
        }
    }

    // Reveal the report information and Edit link.
    reportDetails.hidden = false;
    editLink.hidden = false;

    // Link to this report on the existing Edit page.
    editLink.href = "edit.html?id=" + encodeURIComponent(reportId);

    // Announce the loaded report to screen readers.
    message.textContent = reportId + " details loaded.";
}

// Read the NCR number from the URL, if supplied.
const requestedId = new URLSearchParams(window.location.search).get("id");

if (requestedId && Object.hasOwn(reports, requestedId)) {
    selector.value = requestedId;
}

// Display another report when the dropdown changes.
selector.addEventListener("change", function () {
    showReport(selector.value);
});

// Display the initial report when the page opens.
showReport(requestedId || selector.value);