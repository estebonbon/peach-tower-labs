const closedReports = Object.values(reports).filter(report => report.status === "Closed");
const archiveBody = document.getElementById("archive-table-body");
document.getElementById("archive-count").textContent = closedReports.length;

const processLabels = {
    "supplier-rec-insp": "Supplier / Receiving Inspection",
    "wip-production-order": "Work in Progress / Production"
};

for (const report of closedReports) {
    const row = document.createElement("tr");
    const values = [report.ncrNumber, report.supplier, report.productId, report.dateCreated, report.status];
    values.forEach((value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        if (index === 4) {
            const badge = document.createElement("span");
            badge.className = "archive-status";
            badge.textContent = value;
            cell.append(badge);
        } else {
            cell.textContent = value ?? "—";
        }
        row.append(cell);
    });

    const detailsCell = document.createElement("td");
    const details = document.createElement("details");
    details.className = "archive-details";
    const summary = document.createElement("summary");
    summary.textContent = "View details";
    const list = document.createElement("dl");
    const fields = [
        ["Reference number", report.referenceNumber],
        ["Sales order", report.salesOrderNumber],
        ["Process", processLabels[report.processApplicable] || report.processApplicable],
        ["Quantity received / defective", `${report.quantityReceived} / ${report.quantityDefective}`],
        ["Description of non-conformance", report.defectDescription],
        ["Quality representative", report.qualityRep],
        ["Additional information", report.additional]
    ];
    for (const [label, value] of fields) {
        const term = document.createElement("dt");
        term.textContent = label;
        const description = document.createElement("dd");
        description.textContent = value ?? "—";
        list.append(term, description);
    }
    details.append(summary, list);
    detailsCell.append(details);
    row.append(detailsCell);
    archiveBody.append(row);
}

if (closedReports.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No closed NCRs available.";
    row.append(cell);
    archiveBody.append(row);
}
