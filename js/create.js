if (document.getElementById("create-form")) {

    const sampleUsers = [
        { id: "user-001", name: "Sample User 1" },
        { id: "user-002", name: "Sample User 2" },
        { id: "user-003", name: "Sample User 3" }
    ];

    const sampleSuppliers = [
        { id: "supplier-001", name: "Sample Supplier 1" },
        { id: "supplier-002", name: "Sample Supplier 2" },
        { id: "supplier-003", name: "Sample Supplier 3" }
    ];

    const sampleProducts = [
        { id: "product-001", name: "Sample Product 1" },
        { id: "product-002", name: "Sample Product 2" },
        { id: "product-003", name: "Sample Product 3" }
    ];

    function addOptions(selectId, choices) {
        const select = document.getElementById(selectId);

        for (const choice of choices) {
            const option = document.createElement("option");
            option.value = choice.id;
            option.textContent = choice.name;
            select.append(option);
        }
    }

    addOptions("userId", sampleUsers);
    addOptions("supplierId", sampleSuppliers);
    addOptions("productId", sampleProducts);

    const form = document.getElementById("create-form");
    const message = document.getElementById("form-message");
    const submitButton = form.querySelector('button[type="submit"]');

    document.getElementById("dateCreated").value =
        new Date().toISOString().split("T")[0];

    function generateNextNcrNumber() {

    let currentYear = new Date().getFullYear();

    let highestNumber = 0;

    for (let reportId of Object.keys(reports)) {

        let match = reportId.match(
            new RegExp(`^${currentYear}-(\\d+)$`)
        );

        if (match) {
            let number = parseInt(match[1]);

            if (number > highestNumber) {
                highestNumber = number;
            }
        }
    }

    return `${currentYear}-${String(highestNumber + 1).padStart(3, "0")}`;
}

    const quantityReceived =
        document.getElementById("quantityReceived");

    const quantityDefective =
        document.getElementById("quantityDefective");

    function validateQuantity() {
        const received = Number(quantityReceived.value);
        const defective = Number(quantityDefective.value);

        if (defective > received && received > 0) {
            quantityDefective.setCustomValidity(
                "Quantity Defective cannot exceed Quantity Received."
            );
        } else {
            quantityDefective.setCustomValidity("");
        }
    }

    quantityReceived.addEventListener("input", validateQuantity);
    quantityDefective.addEventListener("input", validateQuantity);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        message.textContent = "Submitting...";
    });
}