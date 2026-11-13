<script setup>
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const toast = useToast();
const ncrs = ref([]);
const loading = ref(true);
const error = ref('');
const archivingIds = ref(new Set());
const archiveDialog = ref(null);
const pendingArchive = ref(null);
const search = ref('');
const activeOnly = ref(false);
const closedOnly = ref(false);
const engineeringOnly = ref(false);
const stage = ref('');

const filteredNcrs = computed(() => ncrs.value.filter((ncr) => {
    const matchesSearch = String(ncr.ncrNumber || '')
        .toLowerCase()
        .includes(search.value.trim().toLowerCase());
    const matchesStatus = (!activeOnly.value && !closedOnly.value)
        || (activeOnly.value && ncr.status === 'Active')
        || (closedOnly.value && ncr.status === 'Closed');
    const matchesEngineering = !engineeringOnly.value || ncr.engineeringRequired === 'yes';
    const matchesStage = !stage.value || ncr.stage === stage.value;

    return matchesSearch && matchesStatus && matchesEngineering && matchesStage;
}));

async function loadNcrs() {
    loading.value = true;
    error.value = '';

    try {
        const response = await axios.get('http://localhost:3000/ncrForms');
        ncrs.value = response.data;
    } catch (loadError) {
        console.error('Failed to load NCRs:', loadError);
        error.value = 'Unable to load NCRs. Check that the database server is running.';
    } finally {
        loading.value = false;
    }
}

function requestArchive(ncr) {
    pendingArchive.value = ncr;
    archiveDialog.value?.showModal();
}

function cancelArchive(event) {
    if (pendingArchive.value && archivingIds.value.has(pendingArchive.value.id)) {
        event.preventDefault();
        return;
    }

    pendingArchive.value = null;
}

async function archiveNcr(ncr) {
    if (!ncr) {
        return;
    }

    if (archivingIds.value.has(ncr.id)) {
        return;
    }

    archivingIds.value = new Set(archivingIds.value).add(ncr.id);

    try {
        const archiveRecord = {
            ...ncr,
            status: 'Archived',
            archivedDate: new Date().toLocaleDateString('en-CA'),
            archiveReason: 'Completed NCR archived.'
        };
        const response = await axios.post(
            'http://localhost:3000/archives',
            archiveRecord
        );

        try {
            await axios.delete(
                `http://localhost:3000/ncrForms/${encodeURIComponent(ncr.id)}`
            );
        } catch (deleteError) {
            try {
                await axios.delete(
                    `http://localhost:3000/archives/${encodeURIComponent(response.data.id)}`
                );
            } catch (rollbackError) {
                console.error('Failed to roll back the archived NCR:', rollbackError);
                toast.error(
                    'The archive was created, but the original NCR could not be removed. Check both lists for duplicates.'
                );
                return;
            }

            throw deleteError;
        }

        ncrs.value = ncrs.value.filter(item => item.id !== ncr.id);
        archiveDialog.value?.close();
        pendingArchive.value = null;
        toast.success(`NCR ${ncr.ncrNumber} archived.`);
    } catch (archiveError) {
        console.error('Failed to archive NCR:', archiveError);
        toast.error('Failed to archive the NCR.');
    } finally {
        const remainingIds = new Set(archivingIds.value);
        remainingIds.delete(ncr.id);
        archivingIds.value = remainingIds;
    }
}

onMounted(loadNcrs);
</script>

<template>
    <main class="row justify-content-center">
            <header class="form-header mb-4">
                <span class="header-extra">QUALITY MANAGEMENT NCR</span>
                <h1 class="h2 mb-2">NCR Log</h1>
                <p class="text-secondary mb-0">
                    View current and completed NCRs or update an existing report.
                </p>
            </header>

            <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                <p class="mb-0" aria-live="polite">{{ filteredNcrs.length }} reports</p>
                <RouterLink class="btn btn-primary" to="/reports/create">Create NCR</RouterLink>
            </div>

            <label for="ncrSearch" class="form-label">Search by NCR Number</label>
            <input
                id="ncrSearch"
                v-model="search"
                class="form-control mb-4"
                type="search"
                placeholder="Search NCR number, e.g. 2026-011"
            >

            <div class="d-flex flex-wrap align-items-center gap-4 mb-3 ncr-log-filters">
                <div class="form-check">
                    <input id="activeOnly" v-model="activeOnly" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="activeOnly">Show Active</label>
                </div>
                <div class="form-check">
                    <input id="closedOnly" v-model="closedOnly" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="closedOnly">Show Closed</label>
                </div>
                <div class="form-check">
                    <input id="engineeringOnly" v-model="engineeringOnly" class="form-check-input" type="checkbox">
                    <label class="form-check-label" for="engineeringOnly">Engineering Required</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <label for="stageFilter" class="fw-semibold">Stage</label>
                    <select id="stageFilter" v-model="stage" class="form-select">
                        <option value="">All Stages</option>
                        <option>QI Started</option>
                        <option>Start Engineering</option>
                        <option>Engineer Started</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            <div v-if="loading" class="py-4 text-center" role="status">Loading NCRs...</div>
            <div v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <div v-else class="table-responsive ncr-log-table-wrapper">
                <table class="table ncr-log-table align-middle">
                    <thead>
                        <tr>
                            <th scope="col">NCR Number</th>
                            <th scope="col">Supplier</th>
                            <th scope="col">Date Created</th>
                            <th scope="col">Status</th>
                            <th scope="col">Current Stage</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ncr in filteredNcrs" :key="ncr.id">
                            <td>{{ ncr.ncrNumber }}</td>
                            <td>{{ ncr.supplier }}</td>
                            <td>{{ ncr.dateCreated }}</td>
                            <td>
                                <span class="ncr-status" :class="String(ncr.status).toLowerCase()">
                                    {{ ncr.status }}
                                </span>
                            </td>
                            <td><span class="ncr-stage">{{ ncr.stage || 'N/A' }}</span></td>
                            <td>
                                <div class="d-flex flex-nowrap gap-2">
                                    <RouterLink class="btn btn-primary" :to="{ name: 'details', query: { id: ncr.id } }">
                                        Details
                                    </RouterLink>
                                    <button
                                        v-if="ncr.stage === 'Completed' || ncr.status === 'Closed'"
                                        class="btn btn-secondary"
                                        type="button"
                                        :disabled="archivingIds.has(ncr.id)"
                                        @click="requestArchive(ncr)"
                                    >
                                        {{ archivingIds.has(ncr.id) ? 'Archiving...' : 'Archive!' }}
                                    </button>
                                    <button
                                        v-else-if="ncr.stage === 'QI Complete' && ncr.engineeringRequired !== 'yes'"
                                        class="btn btn-secondary"
                                        type="button"
                                        disabled
                                    >
                                        Create Ops
                                    </button>
                                    <RouterLink
                                        v-else-if="ncr.stage === 'Start Engineering'"
                                        class="btn btn-secondary"
                                        :to="{ name: 'engineering-review', query: { id: ncr.id } }"
                                    >
                                        Create Eng
                                    </RouterLink>
                                    <RouterLink
                                        v-else-if="ncr.stage === 'Engineer Started'"
                                        class="btn btn-secondary"
                                        :to="{ name: 'engineering-review', query: { id: ncr.id } }"
                                    >
                                        Edit Eng
                                    </RouterLink>
                                    <RouterLink
                                        v-else
                                        class="btn btn-secondary"
                                        :to="{ name: 'edit', query: { id: ncr.id } }"
                                    >
                                        Edit QI
                                    </RouterLink>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredNcrs.length === 0">
                            <td colspan="6" class="text-center text-secondary py-4">No matching NCRs found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <dialog
                ref="archiveDialog"
                class="archive-confirmation"
                aria-labelledby="archive-confirmation-title"
                @cancel="cancelArchive"
                @close="pendingArchive = null"
            >
                <h2 id="archive-confirmation-title">Confirm archive</h2>
                <p>
                    Are you sure you want to archive
                    <strong>{{ pendingArchive?.ncrNumber }}</strong>?
                </p>
                <div class="d-flex justify-content-end gap-2">
                    <button
                        class="btn btn-secondary"
                        type="button"
                        :disabled="pendingArchive && archivingIds.has(pendingArchive.id)"
                        @click="archiveDialog?.close()"
                    >
                        Cancel
                    </button>
                    <button
                        class="btn btn-primary"
                        type="button"
                        :disabled="!pendingArchive || archivingIds.has(pendingArchive.id)"
                        @click="archiveNcr(pendingArchive)"
                    >
                        {{ pendingArchive && archivingIds.has(pendingArchive.id) ? 'Archiving...' : 'Archive!' }}
                    </button>
                </div>
            </dialog>
    </main>
</template>
