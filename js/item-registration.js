document.addEventListener('DOMContentLoaded', function () {
    const itemType = document.getElementById('itemType');
    const customItemDiv = document.getElementById('customItemDiv');
    const customItem = document.getElementById('customItem');
    const continueBtn = document.getElementById('continueBtn');
    const itemSelection = document.getElementById('itemSelection');
    const itemForm = document.getElementById('itemForm');
    const itemName = document.getElementById('itemName');
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const addMoreBtn = document.getElementById('addMoreBtn');

    // Simulated storage (replace with DB in future)
    let items = JSON.parse(localStorage.getItem('items')) || {
        'Monitor': [],
        'Keyboard': []
    };

    // Show/hide custom item input based on selection
    itemType.addEventListener('change', function () {
        if (itemType.value === 'Other') {
            customItemDiv.style.display = 'block';
            customItem.required = true;
        } else {
            customItemDiv.style.display = 'none';
            customItem.required = false;
        }
    });

    // Handle continue button to show item details form
    continueBtn.addEventListener('click', function () {
        let selectedItem = itemType.value;
        if (selectedItem === 'Other') {
            selectedItem = customItem.value.trim();
            if (!selectedItem) {
                alert('Please enter a custom item name.');
                return;
            }
        }
        if (!selectedItem || selectedItem === '') {
            alert('Please select an item or enter a custom item name.');
            return;
        }
        itemName.value = selectedItem;
        itemSelection.style.display = 'none';
        itemForm.style.display = 'block';
    });

    // Handle form submission
    itemForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const itemData = {
            name: itemName.value,
            model: document.getElementById('model').value,
            serialNumber: document.getElementById('serialNumber').value,
            user: document.getElementById('user').value,
            price: document.getElementById('price').value,
            buyDate: document.getElementById('buyDate').value,
            extraDetails: document.getElementById('extraDetails').value,
            addedDate: new Date().toISOString().split('T')[0] // Current date
        };

        // Save item to appropriate category
        if (!items[itemData.name]) {
            items[itemData.name] = [];
        }
        items[itemData.name].push(itemData);
        localStorage.setItem('items', JSON.stringify(items));

        // Show confirmation modal
        confirmationModal.show();

        // Reset form and show item selection
        itemForm.reset();
        itemForm.style.display = 'none';
        itemSelection.style.display = 'block';
        itemType.value = '';
        customItemDiv.style.display = 'none';
        customItem.value = '';
    });

    // Handle add more button
    addMoreBtn.addEventListener('click', function () {
        confirmationModal.hide();
        itemType.focus();
    });
});