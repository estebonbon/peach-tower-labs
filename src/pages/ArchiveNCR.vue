<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const archives = ref([]);
const loading = ref(true);
const error = ref('');

async function loadArchives() {
    try {
        const response = await axios.get('http://localhost:3000/archives');
        archives.value = response.data;
    } catch (loadError) {
        console.error('Failed to load archived NCRs:', loadError);
        error.value = 'Unable to load archived reports. Check that the database server is running.';
    } finally {
        loading.value = false;
    }
}

onMounted(loadArchives);
</script>

<template>
    <main class="archive-section">
        <header class="form-header">
            <span class="header-extra">QUALITY MANAGEMENT NCR</span>
            <h1>Archived Non-Conformance Reports</h1>
            <p>Review archived reports and their non-conformance details.</p>
        </header>

        <div class="archive-heading">
            <h2>Archived Reports <span class="archive-count">{{ archives.length }}</span></h2>
            <RouterLink class="archive-create" to="/reports/create">
                <i class="fas fa-plus-circle" aria-hidden="true"></i> Create NCR
            </RouterLink>
        </div>

        <div v-if="loading" class="py-4 text-center" role="status">Loading archived reports...</div>
        <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
        <div v-else class="archive-table-wrapper" role="region" aria-label="Archived reports table" tabindex="0">
            <table class="archive-table">
                <caption>Archived NCR records</caption>
                <thead>
                    <tr>
                        <th scope="col">NCR Number</th>
                        <th scope="col">Supplier</th>
                        <th scope="col">Product</th>
                        <th scope="col">Archived Date</th>
                        <th scope="col">Status</th>
                        <th scope="col">Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ncr in archives" :key="ncr.id">
                        <th scope="row">{{ ncr.ncrNumber }}</th>
                        <td>{{ ncr.supplier }}</td>
                        <td>{{ ncr.itemDescription }}, SAP No. {{ ncr.productId }}</td>
                        <td>{{ ncr.archivedDate }}</td>
                        <td><span class="archive-status">{{ ncr.status }}</span></td>
                        <td>
                            <RouterLink
                                class="btn archive-details-btn"
                                :to="{ name: 'archive-details', query: { id: ncr.id } }"
                            >
                                Details
                            </RouterLink>
                        </td>
                    </tr>
                    <tr v-if="archives.length === 0">
                        <td colspan="6" class="text-center text-secondary py-4">No archived reports found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="archive-footer">Archive data is provided by the local JSON Server database.</p>
    </main>
</template>
