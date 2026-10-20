<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { generateNcrNumber } from '../resources/generateNCRNum.js';
import { validateNCR } from '../resources/validateNCR.js';
import axios from 'axios';

onMounted(() => {
    getEmployees();
});

//This line will keep track of where to display errors
const errors = reactive({});
const toast = useToast();

// Employee dropdown data
const employees = ref([]);

async function getEmployees() {
    const response = await axios.get('http://localhost:3000/employees');

    employees.value = response.data;
}

//Create a clear ncr function
function resetNCR() {
    Object.assign(ncr, {
        ncrNumber: '',
        dateCreated: new Date().toLocaleDateString('en-CA'),
        employeeId: '',
        supplier: '',
        poOrProdNum: '',
        salesOrderNumber: '',
        processApplicable: '',
        productId: '',
        itemDescription: '',
        defectDescription: '',
        quantityReceived: null,
        quantityDefective: null,
        itemMarkedNonconforming: '',
        engineeringRequired: '',
        previousNcrNumber: null
    });

    // Clear validation errors
    Object.keys(errors).forEach(key => delete errors[key]);
}

// NCR form information, this is what helps the v-model feature sync up inputs on the html to the variables where data can be stored
const ncr = reactive({
    ncrNumber: '',
    dateCreated: new Date().toLocaleDateString('en-CA'), //Takes only todays date
    employeeId: '',
    supplier: '',
    poOrProdNum: '',
    salesOrderNumber: '',
    processApplicable: '',
    productId: '',
    itemDescription: '',
    defectDescription: '',
    quantityReceived: null,
    quantityDefective: null,
    itemMarkedNonconforming: '',
    engineeringRequired: '',
    previousNcrNumber: null
});

//This saves the NCR to the db.json file
async function saveNCR() {
    try {
        //1 Validate the form first
        const validationErrors = validateNCR(ncr); // Passes the current ncr values from the v-model created form above into the method, which is on another file
        
        // Clear old errors
        Object.keys(errors).forEach(key => delete errors[key]);

        // Add new errors to the reactive errors object
        Object.assign(errors, validationErrors); //Errors represents the box being tracked inside of CreateNCR, and the return value from validatencr

        // Stop if any validation errors exist
        if (Object.keys(errors).length > 0) {
            toast.error('Please correct the required fields.');

            // Find the first field with an error
            const firstError = Object.keys(errors)[0];

            // Find the matching HTML input
            const input = document.getElementById(firstError);

            if (input) {
                // Scroll to the input
                input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            
                // Focus on the input without interrupting the scroll
                input.focus({ preventScroll: true });
            }
        
            return;
        }

        // Grabs the generateNCR method from another file and runs and saves the value into the variable generated
        const generated = await generateNcrNumber();
        const newNCR = {
            ...ncr,
            id: generated.id,
            ncrNumber: generated.ncrNumber,
            status: 'Active'
        };

        // Replace empty optional fields with N/A
        const optionalFields = [
            'poOrProdNum',
            'salesOrderNumber',
            'previousNcrNumber'
        ];

        optionalFields.forEach(field => {
            if (newNCR[field] === '' || newNCR[field] == null) {
                newNCR[field] = 'N/A';
            }
        });

        const response = await axios.post(
            'http://localhost:3000/ncrForms',
            newNCR
        );

        console.log(response.data);

        toast.success(`NCR ${generated.ncrNumber} successfully created!`);

        if (ncr.engineeringRequired === 'yes') {
            toast.info('Email notification sent to Engineering Department.');
        }

        resetNCR();
    } catch (error) {
        console.error(error);

        toast.error('Failed to save NCR.');
    }
}

</script>


<template>
  <main class="content">
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

            <form id="create-form" @submit.prevent="saveNCR" novalidate>

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
                      placeholder="Assigned when report submited"
                      readonly
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
                      v-model="ncr.employeeId"
                      required
                    >
                      <option value="" disabled selected>Select an employee</option>
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
                      v-model="ncr.supplier"
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
                      v-model="ncr.productId"
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
                      v-model="ncr.itemDescription"
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
                      v-model="ncr.poOrProdNum"
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
                      v-model="ncr.salesOrderNumber"
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
                      v-model="ncr.previousNcrNumber"
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
                            v-model="ncr.itemMarkedNonconforming"
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
                            v-model="ncr.itemMarkedNonconforming"
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
                      placeholder="type in a number ex: 12 units"
                      v-model="ncr.quantityReceived"
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
                      placeholder="type in number ex: 9 units"
                      v-model="ncr.quantityDefective"
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
                      v-model="ncr.defectDescription"
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

                      <div class="d-flex flex-column flex-sm-row gap-3">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="radio"
                            id="processSupplier"
                            name="processApplicable"
                            value="supplier-rec-insp"
                            required
                            v-model="ncr.processApplicable"

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
                            v-model="ncr.processApplicable"
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
                            v-model="ncr.engineeringRequired"
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
                            v-model="ncr.engineeringRequired"
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

                <button type="button" class="btn btn-secondary">
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
