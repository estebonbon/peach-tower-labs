// Existing NCR report data.
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

// Find the controls in edit.html.
const form = document.getElementById("edit-form");
const selector = document.getElementById("reportSelect");
const message = document.getElementById("form-message");
const cancelButton = document.getElementById("cancel-button");

let currentReportId = selector.value;

// JavaScript runs validation before saving.
form.noValidate = true;

// Fill the form with the selected existing report.
function loadReport(reportId) {
    const report = reports[reportId];

    for (const field of form.elements) {
        if (!field.name) continue;

        field.setCustomValidity("");
        field.removeAttribute("aria-invalid");

        if (field.type === "radio") {
            field.checked = report[field.name] === field.value;
        } else {
            field.value = report[field.name] ?? "";
        }
    }
}

// Read all Quality Inspector form values.
function readValues() {
    const values = {};

    for (const field of form.elements) {
        if (!field.name) continue;

        if (field.type === "radio") {
            if (!(field.name in values)) {
                values[field.name] = "";
            }

            if (field.checked) {
                values[field.name] = field.value;
            }
        } else {
            values[field.name] = field.value;
        }
    }

    return values;
}

// Check whether the form differs from the last saved report.
function hasUnsavedChanges() {
    const values = readValues();

    return Object.keys(values).some(
        name => values[name] !== reports[currentReportId][name]
    );
}

// Validate required fields and quantities.
function validateFields() {
    for (const field of form.querySelectorAll(
        'input:not([type="radio"]), textarea'
    )) {
        field.setCustomValidity("");

        if (field.required && !field.value.trim()) {
            field.setCustomValidity("Please complete this field.");
        }
    }

    const received = document.getElementById("received");
    const defective = document.getElementById("defective");

    if (
        received.value !== "" &&
        defective.value !== "" &&
        Number(defective.value) > Number(received.value)
    ) {
        defective.setCustomValidity(
            "Quantity Defective cannot exceed Quantity Received."
        );
    }
}

// Mark invalid fields for screen readers.
form.addEventListener("invalid", function (event) {
    event.target.setAttribute("aria-invalid", "true");
}, true);

// Update validation while the user edits.
form.addEventListener("input", function () {
    validateFields();

    for (const field of form.elements) {
        if (field.validity?.valid) {
            field.removeAttribute("aria-invalid");
        }
    }

    message.textContent = "";
});

// Switch to another existing NCR.
selector.addEventListener("change", function () {
    if (hasUnsavedChanges()) {
        const discard = window.confirm(
            "Discard your unsaved changes and switch reports?"
        );

        if (!discard) {
            selector.value = currentReportId;
            return;
        }
    }

    currentReportId = selector.value;
    loadReport(currentReportId);

    message.textContent = currentReportId + " loaded for editing.";
});

// Confirm and save changes.
form.addEventListener("submit", function (event) {
    event.preventDefault();
    validateFields();

    if (!form.reportValidity()) {
        message.textContent = "Please correct the invalid fields.";
        return;
    }

    if (!hasUnsavedChanges()) {
        message.textContent = "There are no changes to save.";
        window.alert("There are no changes to save.");
        return;
    }

    const save = window.confirm(
        "Are you sure you want to save changes to " + currentReportId + "?"
    );

    if (!save) return;

    Object.assign(reports[currentReportId], readValues());

    message.textContent =
        "Changes to " + currentReportId + " saved successfully.";

    window.alert("Changes saved successfully.");
});

// Cancel edits and stay on the edit page.
cancelButton.addEventListener("click", function () {
    if (!hasUnsavedChanges()) {
        message.textContent = "There are no changes to cancel.";
        window.alert("There are no changes to cancel.");
        return;
    }

    const discard = window.confirm(
        "Are you sure you want to cancel your changes?"
    );

    if (!discard) return;

    loadReport(currentReportId);

    message.textContent = "Changes cancelled. Saved values restored.";
    window.alert("Your changes have been cancelled.");
});

// Load the first NCR when the page opens.
loadReport(currentReportId);