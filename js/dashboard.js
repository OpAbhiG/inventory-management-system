document.addEventListener('DOMContentLoaded', function () {
    const itemList = document.getElementById('itemList');
    const noItems = document.getElementById('noItems');
    
    // Simulated data (replace with actual data in future DB integration)
    const items = JSON.parse(localStorage.getItem('items')) || {
        'Monitor': [],
        'Keyboard': []
    };

    // Count items
    let totalItems = 0;
    for (const category in items) {
        totalItems += items[category].length;
    }

    if (totalItems === 0) {
        noItems.style.display = 'block';
        itemList.style.display = 'none';
    } else {
        noItems.style.display = 'none';
        itemList.style.display = 'flex';
        for (const category in items) {
            if (items[category].length > 0) {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-3';
              card.innerHTML = `
    <a href="view-all-stored-items.html?category=${encodeURIComponent(category)}" class="text-decoration-none text-body">
        <div class="card shadow-sm">
            <div class="card-body text-center">
                <h4 class="card-title">${category}</h4>
                <p class="card-text">Total Items ${items[category].length}</p>
            </div>
        </div>
    </a>
`;
                card.style.cursor = 'pointer';


                
                itemList.appendChild(card);
            }
        }
    }

        const totalItemsCount = document.getElementById('totalItemsCount');

    // Function to update total item count
    function updateItemCount() {
        const items = JSON.parse(localStorage.getItem('items')) || {};
        let total = 0;
        for (let category in items) {
            total += items[category].length;
        }
        totalItemsCount.textContent = total;
    }

    // Initial update
    updateItemCount();

    // Optional: Listen for storage changes to update count in real-time
    window.addEventListener('storage', updateItemCount);
    
});

