import axios from 'axios';
// Fetch all NCR records from JSON Server
async function getNCRs() {
    try {
        const response = await axios.get(
            'http://localhost:3000/ncrForms'
        );

        const tableBody = document.getElementById('ncr-table-body');

        //Search feature
        function filterNCRs() {
            const searchValue = document.getElementById('ncrSearch').value.trim();
            const activeChecked = document.getElementById('activeOnly').checked;
            const closedChecked = document.getElementById('closedOnly').checked;
            const engineeringChecked = document.getElementById('engineeringOnly').checked;

            response.data.forEach((ncr, index) => {
                const row = tableBody.rows[index];
            
                const matchesSearch = ncr.ncrNumber.includes(searchValue);
            
                const matchesStatus =
                    (!activeChecked && !closedChecked) ||
                    (activeChecked && ncr.status === 'Active') ||
                    (closedChecked && ncr.status === 'Closed');
            
                const matchesEngineering =
                    !engineeringChecked || ncr.engineeringRequired === 'yes';
            
                row.style.display =
                    matchesSearch && matchesStatus && matchesEngineering
                        ? ''
                        : 'none';
            });
        }
        
        document.getElementById('ncrSearch').addEventListener('input', filterNCRs);
        document.getElementById('activeOnly').addEventListener('change', filterNCRs);
        document.getElementById('closedOnly').addEventListener('change', filterNCRs);
        document.getElementById('engineeringOnly').addEventListener('change', filterNCRs);

        document.getElementById('ncrSearch').addEventListener('input', filterNCRs);
        

        tableBody.innerHTML = '';

        response.data.forEach(ncr => {
            const row = document.createElement('tr');
        
            row.innerHTML = `
                <td>${ncr.ncrNumber}</td>
                <td>${ncr.supplier}</td>
                <td>${ncr.dateCreated}</td>
                <td>
                    <span class="ncr-status ${ncr.status.toLowerCase()}">
                        ${ncr.status}
                    </span>
                </td>
                <td>
                    <a href="details.html?id=${ncr.id}" class="btn btn-outline-primary btn-sm">
                        Details
                    </a>

                    <a href="edit.html?id=${ncr.id}" class="btn btn-primary btn-sm">
                        Edit
                    </a>
                </td>
            `;
        
            tableBody.appendChild(row);
        });

        console.log(response.data);

    } catch (error) {
        console.error('Failed to load NCRs:', error);
    }
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', getNCRs);