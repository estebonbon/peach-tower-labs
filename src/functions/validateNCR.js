export function validateNCR(ncr) {
    const errors = {};
    const qualityInspector = ncr.qualityInspector;

    if (!qualityInspector.employeeId) {
        errors.employeeId = 'Please select an employee.';
    }

    if (!qualityInspector.supplier?.trim()) {
        errors.supplier = 'Please enter a supplier name.';
    }

    if (!qualityInspector.productId?.trim()) {
        errors.productId = 'Please enter a Product ID.';
    }

    if (!qualityInspector.itemDescription?.trim()) {
        errors.itemDescription = 'Please enter an item description.';
    }

    if (!qualityInspector.processApplicable) {
        errors.processApplicable = 'Please select the applicable process.';
    }

    if (!qualityInspector.engineeringRequired) {
        errors.engineeringRequired = 'Please select Yes or No.';
    }

    if (!qualityInspector.defectDescription?.trim()) {

    if (!ncr.employeeId) {
        errors.employeeId = 'Please select an employee.';
    }

    if (!ncr.supplier?.trim()) {
        errors.supplier = 'Please enter a supplier name.';
    }

    if (!ncr.productId?.trim()) {
        errors.productId = 'Please enter a Product ID.';
    }

    if (!ncr.itemDescription?.trim()) {
        errors.itemDescription = 'Please enter an item description.';
    }

    if (!ncr.processApplicable) {
        errors.processApplicable = 'Please select the applicable process.';
    }

    if (!ncr.engineeringRequired) {
        errors.engineeringRequired = 'Please select Yes or No.';
    }

    if (!ncr.defectDescription?.trim()) {
        errors.defectDescription = 'Please describe the defect.';
    }

    if (
        qualityInspector.quantityReceived == null ||
        qualityInspector.quantityReceived === '' ||
        !Number.isInteger(Number(qualityInspector.quantityReceived)) ||
        Number(qualityInspector.quantityReceived) <= 0
        ncr.quantityReceived == null ||
        ncr.quantityReceived === '' ||
        !Number.isInteger(Number(ncr.quantityReceived)) ||
        Number(ncr.quantityReceived) <= 0
    ) {
        errors.quantityReceived = 'Please enter a valid quantity greater than zero.';
    }

    if (
        qualityInspector.quantityDefective == null ||
        qualityInspector.quantityDefective === '' ||
        !Number.isInteger(Number(qualityInspector.quantityDefective)) ||
        Number(qualityInspector.quantityDefective) <= 0
    ) {
        errors.quantityDefective = 'Please enter a valid defective quantity greater than zero.';
    } else if (Number(qualityInspector.quantityDefective) > Number(qualityInspector.quantityReceived)) {
        errors.quantityDefective = 'Defective quantity cannot exceed quantity received.';
    }

    if (!qualityInspector.itemMarkedNonconforming) {
        ncr.quantityDefective == null ||
        ncr.quantityDefective === '' ||
        !Number.isInteger(Number(ncr.quantityDefective)) ||
        Number(ncr.quantityDefective) <= 0
    ) {
        errors.quantityDefective = 'Please enter a valid defective quantity greater than zero.';
    } else if (Number(ncr.quantityDefective) > Number(ncr.quantityReceived)) {
        errors.quantityDefective = 'Defective quantity cannot exceed quantity received.';
    }

    if (!ncr.itemMarkedNonconforming) {
        errors.itemMarkedNonconforming = 'Please select Yes or No.';
    }

    return errors;
}