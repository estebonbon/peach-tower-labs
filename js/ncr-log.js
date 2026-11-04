// Get elements from status.html
let tableBody = document.getElementById("ncr-table-body");
let nextNcrNumber = document.getElementById("next-ncr-number");

// Get the saved NCR records
let ncrRecords =
    JSON.parse(localStorage.getItem("ncrRecords")) || [];

// Display each saved NCR
for (let i = 0; i < ncrRecords.length; i++) {

    let ncr = ncrRecords[i];

    // Create a table row
    let row = document.createElement("tr");

    // NCR number cell
    let numberCell = document.createElement("td");
    numberCell.textContent = ncr.ncrNumber;

    // Supplier cell
    let supplierCell = document.createElement("td");
    supplierCell.textContent = ncr.supplier;

    // Product cell
    let productCell = document.createElement("td");
    productCell.textContent = ncr.product;

    // Problem cell
    let problemCell = document.createElement("td");
    problemCell.textContent = ncr.problem;

    // Status cell and dropdown
    let statusCell = document.createElement("td");

    let statusDropdown = document.createElement("select");
    statusDropdown.className = "form-select form-select-sm";

    statusDropdown.setAttribute(
        "aria-label",
        "Status for NCR " + ncr.ncrNumber
    );

    let openOption = document.createElement("option");
    openOption.value = "Open";
    openOption.textContent = "Open";

    let progressOption = document.createElement("option");
    progressOption.value = "In Progress";
    progressOption.textContent = "In Progress";

    let completeOption = document.createElement("option");
    completeOption.value = "Complete";
    completeOption.textContent = "Complete";

    // Add all options to the dropdown
    statusDropdown.append(
        openOption,
        progressOption,
        completeOption
    );

    // Select the NCR's saved status
    statusDropdown.value = ncr.status;

    // Add the dropdown to its table cell
    statusCell.append(statusDropdown);

    // Actions cell
    let actionsCell = document.createElement("td");

    let actionsContainer = document.createElement("div");
    actionsContainer.className = "d-flex flex-wrap gap-2";

    // Details link
    let detailsLink = document.createElement("a");

    detailsLink.href =
        "details.html?id=" +
        encodeURIComponent(ncr.ncrNumber);

    detailsLink.className =
        "btn btn-sm btn-outline-primary";

    detailsLink.textContent = "Details";

    // Edit link
    let editLink = document.createElement("a");

    editLink.href =
        "edit.html?id=" +
        encodeURIComponent(ncr.ncrNumber);

    editLink.className =
        "btn btn-sm btn-outline-secondary";

    editLink.textContent = "Edit";

    // Add both links to the actions container
    actionsContainer.append(
        detailsLink,
        editLink
    );

    // Add the container to its table cell
    actionsCell.append(actionsContainer);

    // Add all cells to the row
    row.append(
        numberCell,
        supplierCell,
        productCell,
        problemCell,
        statusCell,
        actionsCell
    );

    // Add the completed row to the table
    tableBody.append(row);
}

// Calculate the next NCR number
let nextNumber = ncrRecords.length + 1;

nextNcrNumber.textContent =
    "2026-" + String(nextNumber).padStart(3, "0");