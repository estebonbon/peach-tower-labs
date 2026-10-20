
<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const ncr = ref(null);
const employee = ref(null);
const loading = ref(true);
const error = ref('');

const urlParams = new URLSearchParams(window.location.search);
const ncrId = urlParams.get('id');

// Load the existing NCR and its employee information
async function getNCRDetails() {
    try {
        if (!ncrId) {
            throw new Error('No NCR ID was provided.');
        }

        const response = await axios.get(
            `http://localhost:3000/ncrForms/${ncrId}`
        );

        ncr.value = response.data;

        // Find the employee associated with this NCR
        if (ncr.value.employeeId) {
            const employeesResponse = await axios.get(
                'http://localhost:3000/employees'
            );

            employee.value = employeesResponse.data.find(
                person => String(person.id) === String(ncr.value.employeeId)
            ) || null;
        }

    } catch (err) {
        console.error('Failed to load NCR details:', err);
        error.value = 'Unable to load this NCR report.';
    } finally {
        loading.value = false;
    }
}

// Display N/A for fields that have no value
function displayValue(value) {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    return value;
}

// Format yes/no values for display
function displayYesNo(value) {
    if (value === true || String(value).toLowerCase() === 'yes') {
        return 'Yes';
    }

    if (value === false || String(value).toLowerCase() === 'no') {
        return 'No';
    }

    return displayValue(value);
}

const processName = computed(() => {
    const process = ncr.value?.processApplicable;

    if (process === 'supplier-rec-insp') {
        return 'Supplier / Receiving Inspection';
    }

    if (process === 'wip-production-order') {
        return 'WIP / Production Order';
    }

    return displayValue(process);
});

const employeeName = computed(() => {
    if (!employee.value) {
        return displayValue(ncr.value?.employeeId);
    }

    const person = employee.value;

    return person.name ||
        [person.firstName, person.lastName].filter(Boolean).join(' ') ||
        displayValue(ncr.value?.employeeId);
});

onMounted(() => {
    getNCRDetails();
});
</script>

<template>
    <main class="content">
        <div class="row justify-content-center">
            <div class="col-12">
                <section class="card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">

                        <!-- Page Heading -->
                        <header class="form-header mb-4">
                            <div class="header-content">
                                <span class="header-extra">
                                    QUALITY MANAGEMENT NCR
                                </span>

                                <h1 class="h2 mb-2">
                                    Non-Conformance Report Details
                                </h1>

                                <p class="mb-0 text-secondary">
                                    CrossFire Canada — Document No. OPS-00011.
                                    Review the information recorded for this non-conformance report.
                                </p>
                            </div>
                        </header>

                        <div v-if="loading" class="py-5 text-center">
                            Loading NCR details...
                        </div>

                        <div v-else-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>

                        <template v-else-if="ncr">

                            <!-- NCR number and status -->
                            <div class="report-summary mb-4">
                                <div>
                                    <span class="summary-label">NCR REPORT</span>
                                    <h2 class="report-number mb-0">
                                        {{ displayValue(ncr.ncrNumber) }}
                                    </h2>
                                </div>

                                <span
                                    class="status-badge"
                                    :class="ncr.status === 'Closed' ? 'closed' : 'active'"
                                >
                                    {{ displayValue(ncr.status) }}
                                </span>
                            </div>

                            <!-- Report Information -->
                            <section class="detail-section">
                                <h2 class="section-heading">Report Information</h2>

                                <div class="row g-4">
                                    <div class="col-md-4">
                                        <div class="detail-label">NCR Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.ncrNumber) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Date Created</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.dateCreated) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Quality Inspector</div>
                                        <div class="detail-value">
                                            {{ employeeName }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Supplier and Product Information -->
                            <section class="detail-section">
                                <h2 class="section-heading">
                                    Supplier &amp; Product Information
                                </h2>

                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <div class="detail-label">Supplier</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.supplier) }}
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="detail-label">Product ID / SAP Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.productId) }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <div class="detail-label">Item Description</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.itemDescription) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">PO / Production Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.poOrProdNum ?? ncr.referenceNumber) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Sales Order Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.salesOrderNumber) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Previous NCR Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.previousNcrNumber) }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Defect Information -->
                            <section class="detail-section">
                                <h2 class="section-heading">Defect Information</h2>

                                <div class="row g-4">
                                    <div class="col-md-4">
                                        <div class="detail-label">Item Marked Nonconforming</div>
                                        <div class="detail-value">
                                            {{ displayYesNo(ncr.itemMarkedNonconforming) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Quantity Received</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.quantityReceived) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Quantity Defective</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.quantityDefective) }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <div class="detail-label">Defect Description</div>
                                        <div class="description-box">
                                            {{ displayValue(ncr.defectDescription) }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Engineering Review -->
                            <section class="detail-section">
                                <h2 class="section-heading">Engineering Review</h2>

                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <div class="detail-label">Process Applicable</div>
                                        <div class="detail-value">
                                            {{ processName }}
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="detail-label">Engineering Review Required?</div>
                                        <div class="detail-value">
                                            {{ displayYesNo(ncr.engineeringRequired) }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Navigation Buttons -->
                            <div class="action-buttons d-flex flex-wrap gap-3 mt-4">
                                <a
                                    href="ncr-log.html"
                                    class="btn btn-outline-secondary"
                                >
                                    <i class="fas fa-arrow-left me-2"></i>
                                    Back to NCR Log
                                </a>

                                <a
                                    :href="`edit.html?id=${encodeURIComponent(ncrId)}`"
                                    class="btn btn-primary"
                                >
                                    <i class="fas fa-edit me-2"></i>
                                    Edit NCR
                                </a>
                            </div>

                        </template>

                        <div v-else class="alert alert-warning">
                            NCR not found.
                        </div>

                    </div>
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.content {
    background-color: white;
}

.form-header {
    background: #e8eef5;
    border-left: 6px solid #193b59;
    border-radius: 12px;
    padding: 32px;
}

.header-extra {
    color: #536c83;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 2px;
}

.form-header h1 {
    color: #193b59;
    font-weight: 700;
    margin-top: 14px;
}

.report-summary {
    background: #f3f6f9;
    border: 1px solid #e1e7ed;
    border-radius: 10px;
    padding: 22px 26px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.summary-label {
    color: #65798b;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1.5px;
}

.report-number {
    color: #193b59;
    font-size: 1.6rem;
    font-weight: 700;
    margin-top: 6px;
}

.status-badge {
    border-radius: 30px;
    padding: 7px 16px;
    font-size: 0.85rem;
    font-weight: 700;
}

.status-badge.active {
    background: #e3f3e9;
    color: #226b43;
}

.status-badge.closed {
    background: #e9edf1;
    color: #536170;
}

.detail-section {
    padding: 28px 0;
    border-bottom: 1px solid #e0e6ed;
}

.section-heading {
    color: #193b59;
    font-size: 1.45rem;
    font-weight: 700;
    margin-bottom: 28px;
}

.detail-label {
    color: #6c7d8b;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 8px;
}

.detail-value {
    color: #23384b;
    font-size: 1rem;
    font-weight: 600;
    overflow-wrap: anywhere;
}

.description-box {
    background: #f4f6f8;
    border: 1px solid #e0e6ed;
    border-radius: 8px;
    padding: 18px;
    color: #23384b;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.action-buttons {
    padding-top: 12px;
}

.action-buttons .btn {
    padding: 11px 20px;
    font-weight: 600;
    border-radius: 7px;
}

.action-buttons .btn-primary {
    background: #193b59;
    border-color: #193b59;
}

.action-buttons .btn-primary:hover {
    background: #285779;
    border-color: #285779;
}
</style>
