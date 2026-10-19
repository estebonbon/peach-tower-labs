import axios from 'axios';
// Fetch all NCR records from JSON Server
async function getNCRs() {
    try {
        const response = await axios.get(
            'http://localhost:3000/ncrForms'
        );

        const tableBody = document.getElementById('ncr-table-body');

        //Search feature
        const activeCheckbox = document.getElementById('activeOnly');

        function filterNCRs() {
            const searchValue = document.getElementById('ncrSearch').value.trim();
        
            tableBody.querySelectorAll('tr').forEach(row => {
                const ncrNumber = row.cells[0].textContent;
                const status = row.cells[3].textContent.trim();
            
                const matchesSearch = ncrNumber.includes(searchValue);
                const matchesStatus = !activeCheckbox.checked || status === 'Active';
            
                row.style.display = matchesSearch && matchesStatus ? '' : 'none';
            });
        }

        document.getElementById('ncrSearch').addEventListener('input', filterNCRs);
        activeCheckbox.addEventListener('change', filterNCRs);
        
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