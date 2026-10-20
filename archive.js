async function loadArchivedNCRs() {
    try {
        const response = await fetch("http://localhost:3000/archives");
        const ncrs = await response.json();

        const archivedNCRs = ncrs;

        console.log("Archived NCRs:", archivedNCRs);

        const tableBody = document.getElementById("archive-table-body");

        tableBody.innerHTML = archivedNCRs.map(ncr => `
            <tr>
                <th scope="row">${ncr.ncrNumber}</th>
                <td>${ncr.supplier}</td>
                <td>${ncr.itemDescription}, SAP No. ${ncr.productId}</td>
                <td>${ncr.archivedDate}</td>
                <td><span class="archive-status">${ncr.status}</span></td>
                <td>
                    <a href="archive-details.html?id=${ncr.id}" class="btn archive-details-btn">
                        Details
                    </a>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error loading archives:", error);
    }
}

loadArchivedNCRs();