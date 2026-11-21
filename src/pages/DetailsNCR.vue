
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import axios from 'axios';
import crossfireLogo from '../../images/Crossfire Logo - no bkgd.png';

const ncr = ref(null);
const employee = ref(null);
const loading = ref(true);
const error = ref('');
const selectedView = ref('inspector');

const route = useRoute();
const ncrId = computed(() => route.query.id);
const isArchived = computed(() => route.name === 'archive-details');

const engineeringRequired = computed(() => {
    const value = ncr.value?.qualityInspector?.engineeringRequired;

    return value === true ||
        String(value).trim().toLowerCase() === 'yes';
});

const isEngineerView = computed(() => {
    return engineeringRequired.value &&
        selectedView.value === 'engineer';
});

const engineering = computed(() => ncr.value?.engineering || {});

const dispositionName = computed(() => {
    const value = engineering.value.engineeringDisposition;

    const dispositions = {
        'use-as-is': 'Use As Is',
        repair: 'Repair',
        rework: 'Rework',
        scrap: 'Scrap'
    };

    return dispositions[value] || displayValue(value);
});

function toggleView() {
    if (!engineeringRequired.value) {
        return;
    }

    selectedView.value = isEngineerView.value
        ? 'inspector'
        : 'engineer';
}

// Load the existing NCR and its employee information
async function getNCRDetails() {
    loading.value = true;
    error.value = '';
    ncr.value = null;
    employee.value = null;
    selectedView.value = 'inspector';

    try {
        if (!ncrId.value) {
            throw new Error('No NCR ID was provided.');
        }

        const collection = isArchived.value ? "archives" : "ncrForms";

        const response = await axios.get(
            `http://localhost:3000/${collection}/${encodeURIComponent(ncrId.value)}`
        );

        ncr.value = response.data;

        // Find the employee associated with this NCR
        if (ncr.value.employeeId) {
            const employeesResponse = await axios.get(
                'http://localhost:3000/employees'
            );

            employee.value = employeesResponse.data.find(
                person =>
                    String(person.id) ===
                    String(ncr.value.qualityInspector.employeeId)
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
    if (
        value === true ||
        String(value).trim().toLowerCase() === 'yes'
    ) {
        return 'Yes';
    }

    if (
        value === false ||
        String(value).trim().toLowerCase() === 'no'
    ) {
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

function escapeReportText(value) {
    return String(displayValue(value)).replace(
        /[&<>"']/g,
        character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]
    );
}

function viewReport() {
    if (!ncr.value) {
        return;
    }

    const previewWindow = window.open('about:blank', '_blank');

    if (!previewWindow) {
        window.alert(
            'Please allow pop-ups for this website to view the report.'
        );
        return;
    }

    previewWindow.opener = null;

    const record = ncr.value;
    const inspector = record.qualityInspector || {};
    const review = record.engineering || {};
    const showEngineering = isEngineerView.value;

    const viewLabel = showEngineering
        ? 'Engineer'
        : 'Quality Inspector';

    const logoUrl = new URL(
        crossfireLogo,
        window.location.href
    ).href;

    const text = value => escapeReportText(value);

    const field = (label, value, fullWidth = false) => `
        <div class="report-field ${fullWidth ? 'full-width' : ''}">
            <div class="field-label">${text(label)}</div>
            <div class="field-value">${text(value)}</div>
        </div>
    `;

    const section = (number, title, content) => `
        <section class="report-section">
            <div class="section-header">
                <span class="section-number">${number}</span>
                <h2>${text(title)}</h2>
            </div>
            <div class="field-grid">${content}</div>
        </section>
    `;

    const yesNoValue = value => {
        if (value === true) return 'yes';
        if (value === false) return 'no';

        return String(value ?? '').trim().toLowerCase();
    };

    const choices = (label, value, options) => {
        const selected = String(value ?? '').trim().toLowerCase();

        return `
            <div class="report-field full-width">
                <div class="field-label">${text(label)}</div>
                <div class="choice-list">
                    ${options.map(([optionValue, labelText]) => `
                        <span class="choice">
                            <span class="choice-box">
                                ${selected === optionValue ? '✓' : ''}
                            </span>
                            ${text(labelText)}
                        </span>
                    `).join('')}
                </div>
                ${!selected
                    ? '<div class="not-recorded">Not recorded</div>'
                    : ''}
            </div>
        `;
    };

    const notificationRequired = yesNoValue(
        review.customerNotificationRequired
    );

    const drawingUpdateRequired = yesNoValue(
        review.drawingUpdateRequired
    );

    const engineeringSections = showEngineering
        ? `
            ${section(
                '05',
                'Engineering Disposition',
                choices(
                    'Review by CF Engineering',
                    review.engineeringDisposition,
                    [
                        ['use-as-is', 'Use As Is'],
                        ['repair', 'Repair'],
                        ['rework', 'Rework'],
                        ['scrap', 'Scrap']
                    ]
                ) +
                field(
                    'Sequence of Work Steps',
                    review.dispositionInstructions,
                    true
                )
            )}

            ${section(
                '06',
                'Customer Notification',
                choices(
                    'Does the customer require notification?',
                    notificationRequired,
                    [['yes', 'Yes'], ['no', 'No']]
                ) +
                (notificationRequired === 'yes'
                    ? field(
                        'Message to Customer',
                        review.customerMessage,
                        true
                    )
                    : '')
            )}

            ${section(
                '07',
                'Drawing Revision',
                choices(
                    'Does the drawing require updating?',
                    drawingUpdateRequired,
                    [['yes', 'Yes'], ['no', 'No']]
                ) +
                (drawingUpdateRequired === 'yes'
                    ? field(
                        'Original Revision',
                        review.originalRevisionNumber
                    ) +
                    field(
                        'Updated Revision',
                        review.updatedRevisionNumber
                    ) +
                    field(
                        'Revision Date',
                        review.revisionDate
                    )
                    : '')
            )}

            ${section(
                '08',
                'Engineering Approval',
                field('Engineer ID', review.engineerId) +
                field('Engineering Date', review.engineeringDate) +
                field(
                    'Approval / Signature',
                    review.engineeringApproval,
                    true
                )
            )}
        `
        : '';

    previewWindow.document.open();

    previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                ${text(record.ncrNumber)} — NCR Report Preview
            </title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    background: #525659;
                    color: #263746;
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                }

                .toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 14px;
                    min-height: 64px;
                    padding: 12px 24px;
                    background: #303438;
                    color: white;
                    box-shadow: 0 2px 8px #0003;
                }

                .toolbar-title {
                    font-size: 14px;
                    font-weight: bold;
                    overflow-wrap: anywhere;
                }

                .toolbar-subtitle {
                    margin-top: 3px;
                    color: #cbd2d8;
                    font-size: 11px;
                }

                .toolbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .preview-label {
                    color: #d3dbe2;
                    font-size: 12px;
                }

                .print-button {
                    padding: 9px 22px;
                    border: 0;
                    border-radius: 5px;
                    background: #e8eef5;
                    color: #193b59;
                    font: inherit;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .print-button:hover {
                    background: white;
                }

                .print-button:focus-visible {
                    outline: 3px solid #8ebeff;
                    outline-offset: 3px;
                }

                .preview-message {
                    max-width: 860px;
                    margin: 18px auto 0;
                    padding: 12px 18px;
                    border-radius: 5px;
                    background: #e8eef5;
                    color: #193b59;
                    font-size: 13px;
                }

                .preview-area {
                    padding: 28px 20px 48px;
                }

                .document {
                    width: 100%;
                    max-width: 860px;
                    min-height: 1050px;
                    margin: 0 auto;
                    padding: 38px 42px;
                    background: white;
                    box-shadow: 0 4px 22px #0005;
                }

                .document-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 24px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #193b59;
                }

                .header-text {
                    flex: 1;
                    min-width: 0;
                }

                .eyebrow {
                    color: #607386;
                    font-size: 10px;
                    font-weight: bold;
                    letter-spacing: 1.8px;
                }

                h1 {
                    margin: 9px 0 7px;
                    color: #193b59;
                    font-size: 25px;
                    line-height: 1.2;
                }

                .document-subtitle {
                    margin: 0;
                    color: #6b7885;
                    font-size: 11px;
                }

                .logo {
                    display: block;
                    width: 150px;
                    max-width: 30%;
                    height: auto;
                    object-fit: contain;
                }

                .document-summary {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                    padding: 15px 0;
                    border-bottom: 1px solid #dce2e8;
                }

                .ncr-number {
                    color: #193b59;
                    font-size: 18px;
                    font-weight: bold;
                    overflow-wrap: anywhere;
                }

                .summary-right {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                    font-size: 11px;
                }

                .status {
                    padding: 4px 10px;
                    border: 1px solid #cbd5df;
                    border-radius: 20px;
                    color: #193b59;
                    font-weight: bold;
                }

                .report-section {
                    margin-top: 22px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 13px;
                    padding-bottom: 7px;
                    border-bottom: 1px solid #cbd5df;
                }

                .section-number {
                    color: #7a8c9d;
                    font-size: 11px;
                    font-weight: bold;
                }

                h2 {
                    margin: 0;
                    color: #193b59;
                    font-size: 14px;
                    font-weight: bold;
                }

                .field-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 12px 16px;
                }

                .report-field {
                    min-width: 0;
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .field-label {
                    margin-bottom: 4px;
                    color: #607386;
                    font-size: 10px;
                    font-weight: bold;
                }

                .field-value {
                    padding: 5px 8px;
                    border: 1px solid #e1e6eb;
                    border-radius: 3px;
                    background: #f5f7f9;
                    color: #263746;
                    font-size: 12px;
                    line-height: 1.35;
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                }

                .choice-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px 24px;
                    padding: 4px 0;
                }

                .choice {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 12px;
                }

                .choice-box {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 15px;
                    height: 15px;
                    border: 1px solid #7d8fa0;
                    color: #193b59;
                    font-size: 12px;
                    font-weight: bold;
                }

                .not-recorded {
                    margin-top: 4px;
                    color: #6b7885;
                    font-size: 11px;
                }

                .document-footer {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 32px;
                    padding-top: 12px;
                    border-top: 1px solid #cbd5df;
                    color: #71808d;
                    font-size: 10px;
                }

                @media (max-width: 600px) {
                    .toolbar {
                        padding: 12px 16px;
                    }

                    .preview-area {
                        padding: 16px 10px;
                    }

                    .document {
                        min-height: auto;
                        padding: 24px;
                    }

                    .document-header {
                        gap: 12px;
                    }

                    h1 {
                        font-size: 21px;
                    }

                    .field-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>

        <body>
            <header class="toolbar">
                <div>
                    <div class="toolbar-title">
                        ${text(record.ncrNumber)} — NCR Report
                    </div>

                    <div class="toolbar-subtitle">
                        Document preview · ${text(viewLabel)}
                    </div>
                </div>

                <div class="toolbar-actions">
                    <span class="preview-label">Read-only</span>

                    <button
                        id="fake-print"
                        class="print-button"
                        type="button"
                    >
                        Print
                    </button>
                </div>
            </header>

            <div
                id="print-message"
                class="preview-message"
                role="status"
                aria-live="polite"
                hidden
            ></div>

            <div class="preview-area">
                <main class="document">
                    <header class="document-header">
                        <div class="header-text">
                            <div class="eyebrow">
                                QUALITY MANAGEMENT
                            </div>

                            <h1>Non-Conformance Report</h1>

                            <p class="document-subtitle">
                                CrossFire Canada · Document No. OPS-00011
                            </p>
                        </div>

                        <img
                            class="logo"
                            src="${text(logoUrl)}"
                            alt="Crossfire"
                        >
                    </header>

                    <div class="document-summary">
                        <div class="ncr-number">
                            ${text(record.ncrNumber)}
                        </div>

                        <div class="summary-right">
                            <span>${text(viewLabel)} view</span>

                            <span class="status">
                                ${text(record.status)}
                            </span>
                        </div>
                    </div>

                    ${section(
                        '01',
                        'Report Information',
                        field('NCR Number', record.ncrNumber) +
                        field('Date Created', record.dateCreated) +
                        field('Quality Inspector', employeeName.value)
                    )}

                    ${section(
                        '02',
                        'Supplier & Product Information',
                        field('Supplier', inspector.supplier) +
                        field('Product ID / SAP Number', inspector.productId) +
                        field(
                            'PO / Production Number',
                            inspector.poOrProdNum ??
                            inspector.referenceNumber
                        ) +
                        field(
                            'Sales Order Number',
                            inspector.salesOrderNumber
                        ) +
                        field(
                            'Previous NCR Number',
                            inspector.previousNcrNumber
                        ) +
                        field(
                            'Item Description',
                            inspector.itemDescription,
                            true
                        )
                    )}

                    ${section(
                        '03',
                        'Defect Information',
                        field(
                            'Item Marked Nonconforming',
                            displayYesNo(inspector.itemMarkedNonconforming)
                        ) +
                        field(
                            'Quantity Received',
                            inspector.quantityReceived
                        ) +
                        field(
                            'Quantity Defective',
                            inspector.quantityDefective
                        ) +
                        field(
                            'Defect Description',
                            inspector.defectDescription,
                            true
                        )
                    )}

                    ${section(
                        '04',
                        'Engineering Review Requirement',
                        field(
                            'Process Applicable',
                            processName.value
                        ) +
                        field(
                            'Engineering Review Required?',
                            displayYesNo(inspector.engineeringRequired)
                        )
                    )}

                    ${engineeringSections}

                    <footer class="document-footer">
                        <span>CrossFire Canada · OPS-00011</span>
                        <span>Read-only report preview</span>
                    </footer>
                </main>
            </div>
        </body>
        </html>
    `);

    previewWindow.document.close();

    const printButton = previewWindow.document.getElementById(
        'fake-print'
    );

    const printMessage = previewWindow.document.getElementById(
        'print-message'
    );

    printButton.addEventListener('click', () => {
        printMessage.hidden = false;
        printMessage.textContent =
            'Preview only — no document was printed or downloaded.';
    });
}
onMounted(() => {
    getNCRDetails();
});

watch(() => route.fullPath, getNCRDetails);
</script>

<template>
    <main>
        <div class="row justify-content-center">
            <div class="col-12">
                <section>
                    <div class="p-4 p-md-5">

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

                            <div
                                v-if="engineeringRequired"
                                class="view-selector"
                            >
                                <span
                                    class="current-view"
                                    aria-live="polite"
                                >
                                    Viewing as:
                                    <strong>
                                        {{ isEngineerView
                                            ? 'Engineer'
                                            : 'Quality Inspector' }}
                                    </strong>
                                </span>

                                <button
                                    type="button"
                                    class="btn btn-secondary"
                                    :aria-pressed="isEngineerView"
                                    @click="toggleView"
                                >
                                    {{ isEngineerView
                                        ? 'View as Quality Inspector'
                                        : 'View as Engineer' }}
                                </button>
                            </div>

                            <!-- Report Information -->
                            <section class="detail-section">
                                <h2 class="section-heading">
                                    Report Information
                                </h2>

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
                                            {{ displayValue(ncr.qualityInspector?.supplier) }}
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="detail-label">Product ID / SAP Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.productId) }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <div class="detail-label">Item Description</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.itemDescription) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">PO / Production Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(
                                                ncr.qualityInspector?.poOrProdNum ??
                                                ncr.qualityInspector?.referenceNumber
                                            ) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Sales Order Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.salesOrderNumber) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Previous NCR Number</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.previousNcrNumber) }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Defect Information -->
                            <section class="detail-section">
                                <h2 class="section-heading">
                                    Defect Information
                                </h2>

                                <div class="row g-4">
                                    <div class="col-md-4">
                                        <div class="detail-label">Item Marked Nonconforming</div>
                                        <div class="detail-value">
                                            {{ displayYesNo(ncr.qualityInspector?.itemMarkedNonconforming) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Quantity Received</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.quantityReceived) }}
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="detail-label">Quantity Defective</div>
                                        <div class="detail-value">
                                            {{ displayValue(ncr.qualityInspector?.quantityDefective) }}
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <div class="detail-label">Defect Description</div>
                                        <div class="description-box">
                                            {{ displayValue(ncr.qualityInspector?.defectDescription) }}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- Engineering Review -->
                            <section class="detail-section">
                                <h2 class="section-heading">
                                    Engineering Review
                                </h2>

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
                                            {{ displayYesNo(ncr.qualityInspector?.engineeringRequired) }}
                                        </div>
                                    </div>

                                    <template v-if="isEngineerView">
                                        <div class="col-md-6">
                                            <div class="detail-label">Engineering Disposition</div>
                                            <div class="detail-value">
                                                {{ dispositionName }}
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="detail-label">Engineer</div>
                                            <div class="detail-value">
                                                {{ displayValue(engineering.engineerId) }}
                                            </div>
                                        </div>

                                        <div class="col-12">
                                            <div class="detail-label">Engineering Instructions</div>
                                            <div class="description-box">
                                                {{ displayValue(engineering.dispositionInstructions) }}
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </section>

                            <!-- Navigation Buttons -->
                            <div class="action-buttons d-flex flex-wrap gap-3 mt-4">
                                <RouterLink
                                    :to="isArchived ? { name: 'archive' } : { name: 'ncr-log' }"
                                    class="btn btn-primary"
                                >
                                    {{ isArchived ? 'Back to Archives' : 'Back to NCR Log' }}
                                </RouterLink>

                                <RouterLink
                                    v-if="!isArchived && !isEngineerView"
                                    :to="{ name: 'edit', query: { id: ncrId } }"
                                    class="btn btn-secondary"
                                >
                                <i class="fa-solid fa-pen" aria-hidden="true"></i>
                                    Edit NCR
                                </RouterLink>

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    @click="viewReport"
                                >
                                <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>
                                    View Report
                                </button>
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
.main {
    background-color: white;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
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

.view-selector {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 20px;
    margin-bottom: 8px;
    background: #f3f6f9;
    border: 1px solid #e1e7ed;
    border-radius: 10px;
}

.current-view {
    color: #193b59;
    font-size: 0.95rem;
}

.view-selector .btn {
    padding: 10px 18px;
    border-radius: 7px;
    font-weight: 600;
}
</style>