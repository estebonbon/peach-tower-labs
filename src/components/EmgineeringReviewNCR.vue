<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';

const toast = useToast();

const errors = reactive({});
const ncrForms = ref([]);
const employees = ref([]);
const selectedNcrId = ref('');

const engineeringReview = reactive({
    engineeringDisposition: '',
    customerNotificationRequired: '',
    customerMessage: '',
    dispositionInstructions: '',
    drawingUpdateRequired: '',
    originalRevisionNumber: '',
    updatedRevisionNumber: '',
    revisionDate: '',
    engineerId: '',
    engineeringApproval: '',
    engineeringDate: new Date().toLocaleDateString('en-CA')
});

onMounted(() => {
    getNcrForms();
    getEmployees();
});

async function getNcrForms() {
    try {
        const response = await axios.get(
            'http://localhost:3000/ncrForms'
        );

        ncrForms.value = response.data;
    } catch (error) {
        console.error(error);
        toast.error('Could not load NCR records.');
    }
}

async function getEmployees() {
    try {
        const response = await axios.get(
            'http://localhost:3000/employees'
        );

        employees.value = response.data;
    } catch (error) {
        console.error(error);
        toast.error('Could not load employee records.');
    }
}

const selectedNcr = computed(() => {
    return ncrForms.value.find(
        ncr => String(ncr.id) === String(selectedNcrId.value)
    );
});

const repairOrReworkSelected = computed(() => {
    return (
        engineeringReview.engineeringDisposition === 'repair' ||
        engineeringReview.engineeringDisposition === 'rework'
    );
});

const customerNotificationSelected = computed(() => {
    return (
        engineeringReview.customerNotificationRequired === 'yes'
    );
});

const drawingUpdateSelected = computed(() => {
    return engineeringReview.drawingUpdateRequired === 'yes';
});

function clearErrors() {
    Object.keys(errors).forEach(key => {
        delete errors[key];
    });
}

function validateEngineeringReview() {
    clearErrors();

    if (!selectedNcrId.value) {
        errors.selectedNcrId = 'Select an NCR to review.';
    }

    if (!engineeringReview.engineeringDisposition) {
        errors.engineeringDisposition =
            'Select an engineering disposition.';
    }

    if (!engineeringReview.customerNotificationRequired) {
        errors.customerNotificationRequired =
            'Select whether the customer requires notification.';
    }

    if (
        customerNotificationSelected.value &&
        !engineeringReview.customerMessage.trim()
    ) {
        errors.customerMessage =
            'Enter the message that will be sent to the customer.';
    }

    if (
        repairOrReworkSelected.value &&
        !engineeringReview.dispositionInstructions.trim()
    ) {
        errors.dispositionInstructions =
            'Enter the repair or rework instructions.';
    }

    if (!engineeringReview.drawingUpdateRequired) {
        errors.drawingUpdateRequired =
            'Select whether the drawing requires updating.';
    }

    if (drawingUpdateSelected.value) {
        if (!engineeringReview.originalRevisionNumber.trim()) {
            errors.originalRevisionNumber =
                'Enter the original revision number.';
        }

        if (!engineeringReview.updatedRevisionNumber.trim()) {
            errors.updatedRevisionNumber =
                'Enter the updated revision number.';
        }

        if (!engineeringReview.revisionDate) {
            errors.revisionDate = 'Select the revision date.';
        }
    }

    if (!engineeringReview.engineerId) {
        errors.engineerId = 'Select the reviewing engineer.';
    }

    if (!engineeringReview.engineeringApproval.trim()) {
        errors.engineeringApproval =
            'Enter the engineering approval or signature.';
    }

    if (!engineeringReview.engineeringDate) {
        errors.engineeringDate = 'Select the engineering date.';
    }

    return Object.keys(errors).length === 0;
}

function focusFirstError() {
    const firstError = Object.keys(errors)[0];

    if (!firstError) {
        return;
    }

    const input = document.getElementById(firstError);

    if (input) {
        input.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        input.focus({
            preventScroll: true
        });
    }
}

async function saveEngineeringReview() {
    if (!validateEngineeringReview()) {
        toast.error('Please correct the required fields.');
        focusFirstError();
        return;
    }

    try {
        const reviewInformation = {
            ...engineeringReview,
            customerMessage:
                engineeringReview.customerMessage.trim() || 'N/A',
            dispositionInstructions:
                engineeringReview.dispositionInstructions.trim() || 'N/A',
            originalRevisionNumber:
                engineeringReview.originalRevisionNumber.trim() || 'N/A',
            updatedRevisionNumber:
                engineeringReview.updatedRevisionNumber.trim() || 'N/A',
            revisionDate:
                engineeringReview.revisionDate || 'N/A'
        };

        const updatedNcr = {
            engineeringReview: reviewInformation,
            status:
                engineeringReview.engineeringDisposition === 'scrap'
                    ? 'Closed'
                    : 'Active'
        };

        await axios.patch(
            `http://localhost:3000/ncrForms/${selectedNcrId.value}`,
            updatedNcr
        );

        toast.success(
            `Engineering review for ${selectedNcr.value.ncrNumber} was saved.`
        );

        resetEngineeringReview();
        await getNcrForms();
    } catch (error) {
        console.error(error);
        toast.error('Failed to save the engineering review.');
    }
}

function resetEngineeringReview() {
    selectedNcrId.value = '';

    Object.assign(engineeringReview, {
        engineeringDisposition: '',
        customerNotificationRequired: '',
        customerMessage: '',
        dispositionInstructions: '',
        drawingUpdateRequired: '',
        originalRevisionNumber: '',
        updatedRevisionNumber: '',
        revisionDate: '',
        engineerId: '',
        engineeringApproval: '',
        engineeringDate: new Date().toLocaleDateString('en-CA')
    });

    clearErrors();
}

function cancelReview() {
    resetEngineeringReview();
    toast.info('Engineering review cleared.');
}
</script>

<template>
    <main>
        <div class="row justify-content-center">
            <div class="col-12">

                <section class="card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">

                        <!-- HEADER -->
                        <header class="form-header mb-4">
                            <div class="header-content">
                                <span class="header-extra">
                                    QUALITY MANAGEMENT NCR
                                </span>

                                <h1 class="h2 mb-2">
                                    Engineering Review
                                </h1>

                                <p class="text-secondary mb-0">
                                    Review the selected NCR and record the
                                    engineering disposition, drawing revisions,
                                    and approval information.
                                </p>
                            </div>
                        </header>

                        <p class="required-note">
                            <span class="required">*</span>
                            Required field
                        </p>

                        <form
                            id="engineering-form"
                            novalidate
                            @submit.prevent="saveEngineeringReview"
                        >
                            <!-- NCR INFORMATION -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    NCR Information
                                </legend>

                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label
                                            for="selectedNcrId"
                                            class="form-label"
                                        >
                                            Select NCR
                                            <span class="required">*</span>
                                        </label>

                                        <select
                                            id="selectedNcrId"
                                            v-model="selectedNcrId"
                                            class="form-select"
                                            name="selectedNcrId"
                                            required
                                            :aria-invalid="
                                                Boolean(errors.selectedNcrId)
                                            "
                                        >
                                            <option value="" disabled>
                                                Select an NCR
                                            </option>

                                            <option
                                                v-for="ncr in ncrForms"
                                                :key="ncr.id"
                                                :value="ncr.id"
                                            >
                                                {{ ncr.ncrNumber }} -
                                                {{ ncr.supplier }}
                                            </option>
                                        </select>

                                        <small
                                            v-if="errors.selectedNcrId"
                                            class="text-danger"
                                        >
                                            {{ errors.selectedNcrId }}
                                        </small>
                                    </div>

                                    <div
                                        v-if="selectedNcr"
                                        class="col-12 col-md-6"
                                    >
                                        <label
                                            for="selectedNcrStatus"
                                            class="form-label"
                                        >
                                            Current NCR Status
                                        </label>

                                        <input
                                            id="selectedNcrStatus"
                                            type="text"
                                            class="form-control"
                                            :value="selectedNcr.status"
                                            readonly
                                        >
                                    </div>

                                    <div
                                        v-if="selectedNcr"
                                        class="col-12"
                                    >
                                        <label
                                            for="selectedDefectDescription"
                                            class="form-label"
                                        >
                                            Defect Description
                                        </label>

                                        <textarea
                                            id="selectedDefectDescription"
                                            class="form-control"
                                            rows="3"
                                            :value="
                                                selectedNcr.defectDescription
                                            "
                                            readonly
                                        ></textarea>
                                    </div>
                                </div>
                            </fieldset>

                            <!-- ENGINEERING DISPOSITION -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    Review by CF Engineering
                                </legend>

                                <fieldset>
                                    <legend class="form-label fs-6">
                                        Engineering Disposition
                                        <span class="required">*</span>
                                    </legend>

                                    <div
                                        id="engineeringDisposition"
                                        class="d-flex flex-column
                                               flex-lg-row gap-4"
                                    >
                                        <div class="form-check">
                                            <input
                                                id="useAsIs"
                                                v-model="
                                                    engineeringReview
                                                        .engineeringDisposition
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="engineeringDisposition"
                                                value="use-as-is"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="useAsIs"
                                            >
                                                Use As Is
                                            </label>
                                        </div>

                                        <div class="form-check">
                                            <input
                                                id="repair"
                                                v-model="
                                                    engineeringReview
                                                        .engineeringDisposition
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="engineeringDisposition"
                                                value="repair"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="repair"
                                            >
                                                Repair
                                            </label>
                                        </div>

                                        <div class="form-check">
                                            <input
                                                id="rework"
                                                v-model="
                                                    engineeringReview
                                                        .engineeringDisposition
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="engineeringDisposition"
                                                value="rework"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="rework"
                                            >
                                                Rework
                                            </label>
                                        </div>

                                        <div class="form-check">
                                            <input
                                                id="scrap"
                                                v-model="
                                                    engineeringReview
                                                        .engineeringDisposition
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="engineeringDisposition"
                                                value="scrap"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="scrap"
                                            >
                                                Scrap
                                            </label>
                                        </div>
                                    </div>

                                    <small
                                        v-if="
                                            errors.engineeringDisposition
                                        "
                                        class="text-danger d-block mt-2"
                                    >
                                        {{
                                            errors.engineeringDisposition
                                        }}
                                    </small>
                                </fieldset>
                            </fieldset>

                            <!-- CUSTOMER NOTIFICATION -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    Customer Notification
                                </legend>

                                <fieldset>
                                    <legend class="form-label fs-6">
                                        Does the customer require notification
                                        of the NCR?
                                        <span class="required">*</span>
                                    </legend>

                                    <div
                                        id="customerNotificationRequired"
                                        class="d-flex gap-4"
                                    >
                                        <div class="form-check">
                                            <input
                                                id="customerNotificationYes"
                                                v-model="
                                                    engineeringReview
                                                        .customerNotificationRequired
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="
                                                    customerNotificationRequired
                                                "
                                                value="yes"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="
                                                    customerNotificationYes
                                                "
                                            >
                                                Yes
                                            </label>
                                        </div>

                                        <div class="form-check">
                                            <input
                                                id="customerNotificationNo"
                                                v-model="
                                                    engineeringReview
                                                        .customerNotificationRequired
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="
                                                    customerNotificationRequired
                                                "
                                                value="no"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="
                                                    customerNotificationNo
                                                "
                                            >
                                                No
                                            </label>
                                        </div>
                                    </div>

                                    <small
                                        v-if="
                                            errors
                                                .customerNotificationRequired
                                        "
                                        class="text-danger d-block mt-2"
                                    >
                                        {{
                                            errors
                                                .customerNotificationRequired
                                        }}
                                    </small>
                                </fieldset>

                                <div
                                    v-if="customerNotificationSelected"
                                    class="mt-3"
                                >
                                    <label
                                        for="customerMessage"
                                        class="form-label"
                                    >
                                        Message to Customer
                                        <span class="required">*</span>
                                    </label>

                                    <textarea
                                        id="customerMessage"
                                        v-model="
                                            engineeringReview.customerMessage
                                        "
                                        class="form-control"
                                        name="customerMessage"
                                        rows="4"
                                        placeholder="
                                            Detail the NCR issues for the
                                            customer
                                        "
                                        :aria-invalid="
                                            Boolean(errors.customerMessage)
                                        "
                                    ></textarea>

                                    <small
                                        v-if="errors.customerMessage"
                                        class="text-danger"
                                    >
                                        {{ errors.customerMessage }}
                                    </small>
                                </div>
                            </fieldset>

                            <!-- DISPOSITION INSTRUCTIONS -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    Disposition
                                </legend>

                                <label
                                    for="dispositionInstructions"
                                    class="form-label"
                                >
                                    Sequence of Work Steps

                                    <span
                                        v-if="repairOrReworkSelected"
                                        class="required"
                                    >
                                        *
                                    </span>

                                    <span
                                        v-else
                                        class="optional"
                                    >
                                        (Required for Repair or Rework)
                                    </span>
                                </label>

                                <textarea
                                    id="dispositionInstructions"
                                    v-model="
                                        engineeringReview
                                            .dispositionInstructions
                                    "
                                    class="form-control"
                                    name="dispositionInstructions"
                                    rows="7"
                                    placeholder="
                                        Enter the required repair or rework
                                        steps
                                    "
                                    :aria-invalid="
                                        Boolean(
                                            errors.dispositionInstructions
                                        )
                                    "
                                ></textarea>

                                <small
                                    v-if="
                                        errors.dispositionInstructions
                                    "
                                    class="text-danger"
                                >
                                    {{
                                        errors.dispositionInstructions
                                    }}
                                </small>
                            </fieldset>

                            <!-- DRAWING REVISION -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    Drawing Revision
                                </legend>

                                <fieldset>
                                    <legend class="form-label fs-6">
                                        Does the drawing require updating?
                                        <span class="required">*</span>
                                    </legend>

                                    <div
                                        id="drawingUpdateRequired"
                                        class="d-flex gap-4"
                                    >
                                        <div class="form-check">
                                            <input
                                                id="drawingUpdateYes"
                                                v-model="
                                                    engineeringReview
                                                        .drawingUpdateRequired
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="drawingUpdateRequired"
                                                value="yes"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="drawingUpdateYes"
                                            >
                                                Yes
                                            </label>
                                        </div>

                                        <div class="form-check">
                                            <input
                                                id="drawingUpdateNo"
                                                v-model="
                                                    engineeringReview
                                                        .drawingUpdateRequired
                                                "
                                                class="form-check-input"
                                                type="radio"
                                                name="drawingUpdateRequired"
                                                value="no"
                                                required
                                            >

                                            <label
                                                class="form-check-label"
                                                for="drawingUpdateNo"
                                            >
                                                No
                                            </label>
                                        </div>
                                    </div>

                                    <small
                                        v-if="errors.drawingUpdateRequired"
                                        class="text-danger d-block mt-2"
                                    >
                                        {{
                                            errors.drawingUpdateRequired
                                        }}
                                    </small>
                                </fieldset>

                                <div
                                    v-if="drawingUpdateSelected"
                                    class="row g-3 mt-2"
                                >
                                    <div class="col-12 col-md-4">
                                        <label
                                            for="originalRevisionNumber"
                                            class="form-label"
                                        >
                                            Original Revision Number
                                            <span class="required">*</span>
                                        </label>

                                        <input
                                            id="originalRevisionNumber"
                                            v-model="
                                                engineeringReview
                                                    .originalRevisionNumber
                                            "
                                            type="text"
                                            class="form-control"
                                            name="originalRevisionNumber"
                                            placeholder="Example: Rev. A"
                                            :aria-invalid="
                                                Boolean(
                                                    errors
                                                        .originalRevisionNumber
                                                )
                                            "
                                        >

                                        <small
                                            v-if="
                                                errors
                                                    .originalRevisionNumber
                                            "
                                            class="text-danger"
                                        >
                                            {{
                                                errors
                                                    .originalRevisionNumber
                                            }}
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label
                                            for="updatedRevisionNumber"
                                            class="form-label"
                                        >
                                            Updated Revision Number
                                            <span class="required">*</span>
                                        </label>

                                        <input
                                            id="updatedRevisionNumber"
                                            v-model="
                                                engineeringReview
                                                    .updatedRevisionNumber
                                            "
                                            type="text"
                                            class="form-control"
                                            name="updatedRevisionNumber"
                                            placeholder="Example: Rev. B"
                                            :aria-invalid="
                                                Boolean(
                                                    errors
                                                        .updatedRevisionNumber
                                                )
                                            "
                                        >

                                        <small
                                            v-if="
                                                errors
                                                    .updatedRevisionNumber
                                            "
                                            class="text-danger"
                                        >
                                            {{
                                                errors
                                                    .updatedRevisionNumber
                                            }}
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label
                                            for="revisionDate"
                                            class="form-label"
                                        >
                                            Revision Date
                                            <span class="required">*</span>
                                        </label>

                                        <input
                                            id="revisionDate"
                                            v-model="
                                                engineeringReview
                                                    .revisionDate
                                            "
                                            type="date"
                                            class="form-control"
                                            name="revisionDate"
                                            :aria-invalid="
                                                Boolean(errors.revisionDate)
                                            "
                                        >

                                        <small
                                            v-if="errors.revisionDate"
                                            class="text-danger"
                                        >
                                            {{ errors.revisionDate }}
                                        </small>
                                    </div>
                                </div>
                            </fieldset>

                            <!-- ENGINEERING APPROVAL -->
                            <fieldset class="form-section">
                                <legend class="section-title">
                                    Engineering Approval
                                </legend>

                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label
                                            for="engineerId"
                                            class="form-label"
                                        >
                                            Name of Engineer
                                            <span class="required">*</span>
                                        </label>

                                        <select
                                            id="engineerId"
                                            v-model="
                                                engineeringReview.engineerId
                                            "
                                            class="form-select"
                                            name="engineerId"
                                            required
                                            :aria-invalid="
                                                Boolean(errors.engineerId)
                                            "
                                        >
                                            <option value="" disabled>
                                                Select an engineer
                                            </option>

                                            <option
                                                v-for="employee in employees"
                                                :key="employee.id"
                                                :value="employee.id"
                                            >
                                                {{ employee.firstName }}
                                                {{ employee.lastName }}
                                            </option>
                                        </select>

                                        <small
                                            v-if="errors.engineerId"
                                            class="text-danger"
                                        >
                                            {{ errors.engineerId }}
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label
                                            for="engineeringDate"
                                            class="form-label"
                                        >
                                            Engineering Date
                                            <span class="required">*</span>
                                        </label>

                                        <input
                                            id="engineeringDate"
                                            v-model="
                                                engineeringReview
                                                    .engineeringDate
                                            "
                                            type="date"
                                            class="form-control"
                                            name="engineeringDate"
                                            required
                                            :aria-invalid="
                                                Boolean(
                                                    errors.engineeringDate
                                                )
                                            "
                                        >

                                        <small
                                            v-if="errors.engineeringDate"
                                            class="text-danger"
                                        >
                                            {{ errors.engineeringDate }}
                                        </small>
                                    </div>

                                    <div class="col-12">
                                        <label
                                            for="engineeringApproval"
                                            class="form-label"
                                        >
                                            Engineering Approval
                                            <span class="required">*</span>
                                        </label>

                                        <input
                                            id="engineeringApproval"
                                            v-model="
                                                engineeringReview
                                                    .engineeringApproval
                                            "
                                            type="text"
                                            class="form-control"
                                            name="engineeringApproval"
                                            placeholder="
                                                Enter approval or electronic
                                                signature
                                            "
                                            required
                                            :aria-invalid="
                                                Boolean(
                                                    errors
                                                        .engineeringApproval
                                                )
                                            "
                                        >

                                        <small
                                            v-if="
                                                errors.engineeringApproval
                                            "
                                            class="text-danger"
                                        >
                                            {{
                                                errors.engineeringApproval
                                            }}
                                        </small>
                                    </div>
                                </div>
                            </fieldset>

                            <p
                                id="form-message"
                                role="status"
                                aria-live="polite"
                            ></p>

                            <div class="action-buttons d-flex flex-wrap gap-3 mt-4">
                                
                                <button type="submit" class="btn btn-primary">
                                    Submit Review
                                </button>

                                <button type="button" class="btn btn-secondary" @click="cancelReview">
                                    Cancel
                                </button>

                            </div>
                        </form>

                    </div>
                </section>

            </div>
        </div>
    </main>
</template>

<style scoped>
.main {
  background-color: #fff;
}

.content .form-control,
.conten .form-select {
  background-color: #f3f4f6;
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