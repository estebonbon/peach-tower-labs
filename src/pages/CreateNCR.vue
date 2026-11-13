<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { generateNcrNumber, isNcrIdentityAvailable } from '../functions/generateNCRNum.js';
import { validateNCR } from '../functions/validateNCR.js';
import axios from 'axios';

const errors = reactive({});
const toast = useToast();
const generatedNCR = ref(null);
const numberError = ref('');
const employees = ref([]);

function emptyQualityInspector() {
    return {
        employeeId: '',
        supplier: '',
        productId: '',
        itemDescription: '',
        processApplicable: '',
        poOrProdNum: '',
        salesOrderNumber: '',
        previousNcrNumber: null,
        defectDescription: '',
        quantityReceived: null,
        quantityDefective: null,
        itemMarkedNonconforming: '',
        engineeringRequired: ''
    };
}

const ncr = reactive({
    ncrNumber: '',
    dateCreated: new Date().toLocaleDateString('en-CA'),
    qualityInspector: emptyQualityInspector(),
    engineering: {},
    operations: {}
});

onMounted(() => {
    getEmployees();
    refreshGeneratedNcr();
});

async function getEmployees() {
    try {
        const response = await axios.get('http://localhost:3000/employees');
        employees.value = response.data;
    } catch (error) {
        console.error('Failed to load employees:', error);
        toast.error('Could not load employee records.');
    }
}

async function refreshGeneratedNcr() {
    try {
        generatedNCR.value = await generateNcrNumber();
        ncr.ncrNumber = generatedNCR.value.ncrNumber;
        numberError.value = '';
    } catch (error) {
        console.error('Failed to generate an NCR number:', error);
        generatedNCR.value = null;
        ncr.ncrNumber = '';
        numberError.value = 'Unable to generate an NCR number. Check that the database server is running.';
        toast.error(numberError.value);
    }
}

function resetNCR() {
    Object.assign(ncr, {
        ncrNumber: '',
        dateCreated: new Date().toLocaleDateString('en-CA'),
        qualityInspector: emptyQualityInspector(),
        engineering: {},
        operations: {}
    });
    Object.keys(errors).forEach(key => delete errors[key]);
}

async function saveNCR(isDraft = false) {
    try {
        Object.keys(errors).forEach(key => delete errors[key]);

        const validationErrors = isDraft ? {} : validateNCR(ncr);
        if (!isDraft) {
            Object.assign(errors, validationErrors);
        }

        if (!isDraft && Object.keys(errors).length > 0) {
            toast.error('Please correct the required fields.');
            const firstError = Object.keys(errors)[0];
            const input = document.getElementById(firstError);
            if (input) {
                input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                input.focus({ preventScroll: true });
            }
            return;
        }

        let generated = generatedNCR.value;
        if (!generated) {
            throw new Error('An NCR number is not available yet.');
        }

        if (!await isNcrIdentityAvailable(generated)) {
            generated = await generateNcrNumber();
            generatedNCR.value = generated;
            ncr.ncrNumber = generated.ncrNumber;

            if (!await isNcrIdentityAvailable(generated)) {
                throw new Error('A unique NCR number could not be reserved. Please try again.');
            }
        }

        const newNCR = {
            id: generated.id,
            ncrNumber: generated.ncrNumber,
            dateCreated: ncr.dateCreated,
            status: 'Active',
            stage: isDraft
                ? 'QI Started'
                : ncr.qualityInspector.engineeringRequired === 'yes'
                    ? 'Start Engineering'
                    : 'Start Operations',
            qualityInspector: { ...ncr.qualityInspector },
            engineering: { ...ncr.engineering },
            operations: { ...ncr.operations }
        };

        const optionalFields = [
            'poOrProdNum',
            'salesOrderNumber',
            'previousNcrNumber'
        ];

        optionalFields.forEach(field => {
            if (newNCR.qualityInspector[field] === '' || newNCR.qualityInspector[field] == null) {
                newNCR.qualityInspector[field] = 'N/A';
            }
        });

        await axios.post(
            'http://localhost:3000/ncrForms',
            newNCR
        );

        toast.success(`NCR ${generated.ncrNumber} successfully created!`);

        if (ncr.qualityInspector.engineeringRequired === 'yes') {
            toast.info('Email notification sent to Engineering Department.');
        }

        resetNCR();
        await refreshGeneratedNcr();
    } catch (error) {
        console.error('Failed to save NCR:', error);
        toast.error('Failed to save NCR.');
    }
}

</script>


<template>
  <main>
    <div class="row justify-content-center">
      <div class="col-12">
        <section class="p-4 p-md-5">

            <!-- HEADER -->
            <header class="form-header mb-4">
              <div class="header-content">
                <span class="header-extra">QUALITY MANAGEMENT NCR</span>
                <h1 class="h2 mb-2">Create a Non-Conformance Report</h1>
                <p class="text-secondary mb-0">
                  Complete the information below to report a non-conformance.
                </p>
              </div>
            </header>

            <p class="required-note">
              <span class="required">*</span> Required field
            </p>

            <p v-if="numberError" class="alert alert-danger" role="alert">
              {{ numberError }}
            </p>

            <form id="create-form" @submit.prevent="saveNCR(false)" novalidate>

              <!-- REPORT INFORMATION -->
              <fieldset class="form-section">
                <legend class="section-title">Report Information</legend>

                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="ncrNumber" class="form-label">NCR Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="ncrNumber"
                      name="ncrNumber"
                      placeholder="Assigned when the database is available"
                      readonly
                      v-model="ncr.ncrNumber"
                    >
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="dateCreated" class="form-label">Date Created</label>
                    <input
                      type="date"
                      class="form-control"
                      id="dateCreated"
                      name="dateCreated"
                      :value="ncr.dateCreated"
                      readonly
                    >
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="employeeId" class="form-label">
                      Employee <span class="required">*</span>
                    </label>
                    <select
                      class="form-select"
                      id="employeeId"
                      name="employeeId"
                      v-model="ncr.qualityInspector.employeeId"
                      required
                    >
                      <option value="" disabled selected>Select a quality inspector</option>
                      <option
                        v-for="employee in employees"
                            :key="employee.id"
                            :value="employee.id">
                             {{ employee.firstName }} 
                         </option>
                    </select>
                    <small
                        v-if="errors.employeeId"
                        class="text-danger"
                    >
                        {{ errors.employeeId }}
                    </small>
                  </div>
                </div>
              </fieldset>

              <!-- SUPPLIER & PRODUCT INFORMATION -->
              <fieldset class="form-section">
                <legend class="section-title">Supplier &amp; Product Information</legend>

                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="supplier" class="form-label">
                      Supplier <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="supplier"
                      name="supplier"
                      placeholder="Place the name of the suplier eg: Brampton Tech"
                      required
                      v-model="ncr.qualityInspector.supplier"
                    >
                    <small v-if="errors.supplier" class="text-danger">{{ errors.supplier }}</small>
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="productId" class="form-label">
                      Product ID / SAP Number <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="productId"
                      name="productId"
                      placeholder="Type in the Product ID, eg: 344319"
                      required
                      v-model="ncr.qualityInspector.productId"
                    >
                    <small v-if="errors.productId" class="text-danger">{{ errors.productId }}</small>
                  </div>

                  <div class="col-12">
                    <label for="itemDescription" class="form-label">
                      Item Description <span class="required">*</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="itemDescription"
                      name="itemDescription"
                      placeholder="Describe the item. eg: A powderized screw length 4 inches"
                      required
                      v-model="ncr.qualityInspector.itemDescription"
                    >
                    <small v-if="errors.itemDescription" class="text-danger">{{ errors.itemDescription }}</small>
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="poOrProdNum" class="form-label">
                      Purchase Order / Production Number
                      <span class="optional">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="poOrProdNum"
                      name="poOrProdNum"
                      placeholder="Type in the appropriate number eg: 233454841"
                      v-model="ncr.qualityInspector.poOrProdNum"
                    >
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="salesOrderNumber" class="form-label">
                      Sales Order Number
                      <span class="optional">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="salesOrderNumber"
                      name="salesOrderNumber"
                      placeholder="Enter the sales number eg: GN344877"
                      v-model="ncr.qualityInspector.salesOrderNumber"
                    >
                  </div>

                  <div class="col-12">
                    <label for="previousNcrNumber" class="form-label">
                      Previous NCR Number
                      <span class="optional">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="previousNcrNumber"
                      name="previousNcrNumber"
                      placeholder="If related to a previous NCR"
                      v-model="ncr.qualityInspector.previousNcrNumber"
                    >
                  </div>
                </div>
              </fieldset>

              <!-- DEFECT INFORMATION -->
              <fieldset class="form-section">
                <legend class="section-title">Defect Information</legend>
                <div class="row g-3">

                  <div class="col-12 col-md-4">
                    <fieldset>
                      <legend class="form-label fs-6">
                        Item Marked Nonconforming
                        <span class="required">*</span>
                      </legend>

                      <div class="d-flex gap-3">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="nonconformingYes"
                            name="itemMarkedNonconforming"
                            value="yes"
                            required
                            v-model="ncr.qualityInspector.itemMarkedNonconforming"
                          >
                          <label class="form-check-label" for="nonconformingYes">
                            Yes
                          </label>
                        </div>

                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="nonconformingNo"
                            name="itemMarkedNonconforming"
                            value="no"
                            v-model="ncr.qualityInspector.itemMarkedNonconforming"
                          >
                          <label class="form-check-label" for="nonconformingNo">
                            No
                          </label>
                        </div>
                        <small v-if="errors.itemMarkedNonconforming" class="text-danger">{{ errors.itemMarkedNonconforming }}</small>
                      </div>
                    </fieldset>
                  </div>

                  <div class="col-12 col-md-4">
                    <label for="quantityReceived" class="form-label">
                      Quantity Received <span class="required">*</span>
                    </label>
                    <input
                      type="number"
                      class="form-control"
                      id="quantityReceived"
                      name="quantityReceived"
                      min="0"
                      step="1"
                      required
                      placeholder="ex: 3"
                      v-model="ncr.qualityInspector.quantityReceived"
                    >
                    <small v-if="errors.quantityReceived" class="text-danger">{{ errors.quantityReceived }}</small>
                  </div>

                  <div class="col-12 col-md-4">
                    <label for="quantityDefective" class="form-label">
                      Quantity Defective <span class="required">*</span>
                    </label>
                    <input
                      type="number"
                      class="form-control"
                      id="quantityDefective"
                      name="quantityDefective"
                      min="0"
                      step="1"
                      required
                      placeholder="ex: 9"
                      v-model="ncr.qualityInspector.quantityDefective"
                    >
                    <small v-if="errors.quantityDefective" class="text-danger">{{ errors.quantityDefective }}</small>
                  </div>

                  <div class="col-12">
                    <label for="defectDescription" class="form-label">
                      Defect Description <span class="required">*</span>
                    </label>
                    <textarea
                      class="form-control"
                      id="defectDescription"
                      name="defectDescription"
                      rows="4"
                      placeholder="Describe the defect... eg: The welded joints dont meet ISO standards"
                      required
                      v-model="ncr.qualityInspector.defectDescription"
                    ></textarea>
                    <small v-if="errors.defectDescription" class="text-danger">{{ errors.defectDescription }}</small>
                  </div>
                </div>  
              </fieldset>

              <!-- ENGINEERING REVIEW -->
              <fieldset class="form-section">
                <legend class="section-title">Engineering Review</legend>

                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <fieldset>
                      <legend class="form-label fs-6">
                        Process Applicable <span class="required">*</span>
                      </legend>

                      <div class="d-flex flex-column gap-3">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="processSupplier"
                            name="processApplicable"
                            value="supplier-rec-insp"
                            required
                            v-model="ncr.qualityInspector.processApplicable"

                          >
                          <label class="form-check-label" for="processSupplier">
                            Supplier / Receiving Inspection
                          </label>
                        </div>

                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="processWip"
                            name="processApplicable"
                            value="wip-production-order"
                            v-model="ncr.qualityInspector.processApplicable"
                          >
                          <label class="form-check-label" for="processWip">
                            WIP / Production Order
                          </label>
                        </div>
                        <small v-if="errors.processApplicable" class="text-danger">{{ errors.processApplicable }}</small>
                      </div>
                    </fieldset>
                  </div>

                  <div class="col-12 col-md-6">
                    <fieldset>
                      <legend class="form-label fs-6">
                        Engineering Review Required?
                        <span class="required">*</span>
                      </legend>

                      <div class="d-flex gap-4">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="engineeringYes"
                            name="engineeringRequired"
                            value="yes"
                            required
                            v-model="ncr.qualityInspector.engineeringRequired"
                          >
                          <label class="form-check-label" for="engineeringYes">
                            Yes
                          </label>
                        </div>

                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="engineeringNo"
                            name="engineeringRequired"
                            value="no"
                            v-model="ncr.qualityInspector.engineeringRequired"
                          >
                          <label class="form-check-label" for="engineeringNo">
                            No
                          </label>
                        </div>
                        <small v-if="errors.engineeringRequired" class="text-danger">{{ errors.engineeringRequired }}</small>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </fieldset>

              <!-- FORM MESSAGES -->
              <p
                id="form-message"
                class="mb-3"
                role="status"
                aria-live="polite"
              ></p>

              <!-- ACTION BUTTONS -->
              <div class="action-buttons d-flex flex-wrap gap-3 mt-4">
                <button type="submit" class="btn btn-primary">
                  Submit
                </button>
                <!-- Remember a false saveNCR(false) means everything will be validated, this says false so it will skip validation -->
                <button type="button" class="btn btn-secondary" @click="saveNCR(true)">
                  Save as Draft
                </button>
              </div>

            </form>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.content {
  background-color: #fff;
}

.content .form-control,
.content .form-select {
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
