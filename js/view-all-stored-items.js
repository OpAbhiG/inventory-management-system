document.addEventListener('DOMContentLoaded', function () {
    const itemsTableBody = document.getElementById('itemsTableBody');
    const editItemModalElement = document.getElementById('editItemModal');
    const deleteItemModalElement = document.getElementById('deleteItemModal');
    const relocateItemModalElement = document.getElementById('relocateItemModal');
    const historyModalElement = document.getElementById('historyModal');
    const successToastElement = document.getElementById('successToast');
    const relocateToastElement = document.getElementById('relocateToast');

    // Initialize modals and toasts with error handling
    let editItemModal, deleteItemModal, relocateItemModal, historyModal, successToast, relocateToast;
    try {
        editItemModal = new bootstrap.Modal(editItemModalElement, { backdrop: 'static' });
        deleteItemModal = new bootstrap.Modal(deleteItemModalElement, { backdrop: 'static' });
        relocateItemModal = new bootstrap.Modal(relocateItemModalElement, { backdrop: 'static' });
        historyModal = new bootstrap.Modal(historyModalElement, { backdrop: 'static' });
        successToast = new bootstrap.Toast(successToastElement, { autohide: true, delay: 5000 });
        relocateToast = new bootstrap.Toast(relocateToastElement, { autohide: true, delay: 5000 });
    } catch (error) {
        console.error('Error initializing Bootstrap components:', error);
        alert('Failed to initialize components. Please refresh the page.');
        return;
    }

    const editItemForm = document.getElementById('editItemForm');
    const relocateItemForm = document.getElementById('relocateItemForm');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const saveRelocateBtn = document.getElementById('saveRelocateBtn');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const sortableHeaders = document.querySelectorAll('.sortable');

    // Load items from localStorage
    let items = JSON.parse(localStorage.getItem('items')) || {};
    let currentCategory = null;
    let currentIndex = null;
    let sortColumn = 'name';
    let sortDirection = 'asc';

    // Function to show toast notification
    function showToast(message, isRelocate = false) {
        const toastElement = isRelocate ? relocateToastElement : successToastElement;
        const toastBody = toastElement.querySelector('.toast-body');
        toastBody.textContent = message;
        const toast = isRelocate ? relocateToast : successToast;
        toast.show();
    }

    // Function to get current timestamp
    function getCurrentTimestamp() {
        return new Date().toISOString();
    }

    // Function to format timestamp for display
    function formatTimestamp(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    // Function to validate edit form
    function validateEditForm() {
        const model = document.getElementById('editModel').value.trim();
        const serialNumber = document.getElementById('editSerialNumber').value.trim();
        const user = document.getElementById('editUser').value.trim();
        if (!model || !serialNumber || !user) {
            showToast('Please fill in all required fields (Model, Serial Number, User).');
            return false;
        }
        return true;
    }

    // Function to validate relocate form
    function validateRelocateForm() {
        const fromLocation = document.getElementById('relocateFromLocation').value.trim();
        const toLocation = document.getElementById('relocateToLocation').value.trim();
        const relocatedBy = document.getElementById('relocateBy').value.trim();
        if (!fromLocation || !toLocation || !relocatedBy) {
            showToast('Please fill in all required fields (From Location, To Location, Relocated By).');
            return false;
        }
        return true;
    }

    // Function to display items in the table
    function displayItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = filterType.value;

        // Flatten items for sorting
        let allItems = [];
        for (let category in items) {
            items[category].forEach((item, index) => {
                allItems.push({ ...item, category, index });
            });
        }

        // Filter items
        allItems = allItems.filter(item => {
            if (selectedType !== 'all' && item.name !== selectedType && item.category !== selectedType) {
                return false;
            }
            if (searchTerm &&
                !item.name.toLowerCase().includes(searchTerm) &&
                !item.model.toLowerCase().includes(searchTerm) &&
                !item.serialNumber.toLowerCase().includes(searchTerm)) {
                return false;
            }
            return true;
        });

        // Sort items
        allItems.sort((a, b) => {
            let valueA = a[sortColumn] || '';
            let valueB = b[sortColumn] || '';
            if (sortColumn === 'price') {
                valueA = parseFloat(valueA) || 0;
                valueB = parseFloat(valueB) || 0;
            } else if (sortColumn === 'updatedDate') {
                valueA = new Date(valueA).getTime() || 0;
                valueB = new Date(valueB).getTime() || 0;
            }
            if (typeof valueA === 'string' && sortColumn !== 'updatedDate') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            if (sortDirection === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        // Update table
        itemsTableBody.innerHTML = '';
        allItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.model}</td>
                <td>${item.serialNumber}</td>
                <td>${item.user}</td>
                <td>${item.price || '-'}</td>
                <td>${item.buyDate || '-'}</td>
                <td>${item.extraDetails || '-'}</td>
                <td>${formatTimestamp(item.updatedDate)}</td>
            <td>
                    <button class="btn btn-primary btn-sm" onclick="editItem('${item.category}', ${item.index})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('${item.category}', ${item.index})"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-warning btn-sm" onclick="relocateItem('${item.category}', ${item.index})"><i class="fas fa-arrows-alt"></i></button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewHistory('${item.category}', ${item.index})"><i class="fas fa-history"></i></button>
                </td>
            `;
            itemsTableBody.appendChild(row);
        });

        // Update sort indicators
        sortableHeaders.forEach(header => {
            const icon = header.querySelector('.fas');
            if (header.dataset.sort === sortColumn) {
                icon.classList.remove('fa-sort');
                icon.classList.add(sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            } else {
                icon.classList.remove('fa-sort-up', 'fa-sort-down');
                icon.classList.add('fa-sort');
            }
        });
    }

    // Function to open edit modal with item details
    window.editItem = function (category, index) {
        const item = items[category][index];
        document.getElementById('editItemCategory').value = category;
        document.getElementById('editItemIndex').value = index;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editModel').value = item.model;
        document.getElementById('editSerialNumber').value = item.serialNumber;
        document.getElementById('editUser').value = item.user;
        document.getElementById('editPrice').value = item.price || '';
        document.getElementById('editBuyDate').value = item.buyDate || '';
        document.getElementById('editExtraDetails').value = item.extraDetails || '';
        editItemModal.show();
    };

    // Function to open delete confirmation modal
    window.confirmDelete = function (category, index) {
        currentCategory = category;
        currentIndex = index;
        deleteItemModal.show();
    };

    // Function to open relocate modal
    window.relocateItem = function (category, index) {
        document.getElementById('relocateItemCategory').value = category;
        document.getElementById('relocateItemIndex').value = index;
        document.getElementById('relocateFromLocation').value = '';
        document.getElementById('relocateToLocation').value = '';
        document.getElementById('relocateBy').value = '';
        document.getElementById('relocateReason').value = '';
        relocateItemModal.show();
    };

    // Function to view relocation history
    window.viewHistory = function (category, index) {
        const item = items[category][index];
        const historyTableBody = document.getElementById('historyTableBody');
        historyTableBody.innerHTML = '';
        const history = item.relocationHistory || [];
        if (history.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No relocation history available.</td></tr>';
        } else {
            history.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${log.fromLocation}</td>
                    <td>${log.toLocation}</td>
                    <td>${log.relocatedBy}</td>
                    <td>${log.reason || '-'}</td>
                    <td>${formatTimestamp(log.timestamp)}</td>
                `;
                historyTableBody.appendChild(row);
            });
        }
        historyModal.show();
    };

    // Handle save changes in edit modal
    saveEditBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!validateEditForm()) return;

        const category = document.getElementById('editItemCategory').value;
        const index = parseInt(document.getElementById('editItemIndex').value);
        const updatedItem = {
            name: document.getElementById('editItemName').value,
            model: document.getElementById('editModel').value,
            serialNumber: document.getElementById('editSerialNumber').value,
            user: document.getElementById('editUser').value,
            price: document.getElementById('editPrice').value,
            buyDate: document.getElementById('editBuyDate').value,
            extraDetails: document.getElementById('editExtraDetails').value,
            updatedDate: getCurrentTimestamp(),
            relocationHistory: items[category][index].relocationHistory || []
        };

        try {
            // Update item in localStorage
            items[category][index] = updatedItem;
            localStorage.setItem('items', JSON.stringify(items));

            // Refresh table
            displayItems();

            // Close modal with delay to ensure DOM updates
            setTimeout(() => {
                editItemModal.hide();
                // Clear modal state
                editItemModalElement.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
            }, 100);

            // Show success toast
            showToast('Item updated successfully!');
        } catch (error) {
            showToast('Error updating item. Please try again.');
            console.error('Error updating item:', error);
        }
    });

    // Handle delete confirmation
    confirmDeleteBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (currentCategory && currentIndex !== null) {
            try {
                // Delete item from localStorage
                items[currentCategory].splice(currentIndex, 1);
                if (items[currentCategory].length === 0) {
                    delete items[currentCategory];
                }
                localStorage.setItem('items', JSON.stringify(items));

                // Refresh table
                displayItems();

                // Close modal with delay to ensure DOM updates
                setTimeout(() => {
                    deleteItemModal.hide();
                    // Clear modal state
                    deleteItemModalElement.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                }, 100);

                // Show success toast
                showToast('Item deleted successfully!');

                // Reset current category and index
                currentCategory = null;
                currentIndex = null;
            } catch (error) {
                showToast('Error deleting item. Please try again.');
                console.error('Error deleting item:', error);
            }
        }
    });

    // Handle save relocation
    saveRelocateBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!validateRelocateForm()) return;

        const category = document.getElementById('relocateItemCategory').value;
        const index = parseInt(document.getElementById('relocateItemIndex').value);
        const relocationLog = {
            fromLocation: document.getElementById('relocateFromLocation').value,
            toLocation: document.getElementById('relocateToLocation').value,
            relocatedBy: document.getElementById('relocateBy').value,
            reason: document.getElementById('relocateReason').value,
            timestamp: getCurrentTimestamp()
        };

        try {
            // Add relocation log to item
            items[category][index].relocationHistory = items[category][index].relocationHistory || [];
            items[category][index].relocationHistory.push(relocationLog);
            items[category][index].updatedDate = getCurrentTimestamp();
            localStorage.setItem('items', JSON.stringify(items));

            // Refresh table
            displayItems();

            // Close modal with delay to ensure DOM updates
            setTimeout(() => {
                relocateItemModal.hide();
                // Clear modal state
                relocateItemModalElement.classList.remove('show');
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
            }, 100);

            // Show relocation toast
            showToast('Item relocated successfully!', true);
        } catch (error) {
            showToast('Error relocating item. Please try again.');
            console.error('Error relocating item:', error);
        }
    });

    // Handle search input
    searchInput.addEventListener('input', displayItems);

    // Handle filter change
    filterType.addEventListener('change', displayItems);

    // Handle column sorting
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            displayItems();
        });
    });

    // Initial display of items
    displayItems();
});