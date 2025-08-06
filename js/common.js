// // Common JavaScript Functions - common.js

// // Utility Functions
// const Utils = {
//     // Generate unique ID
//     generateId: function() {
//         return Date.now().toString(36) + Math.random().toString(36).substr(2);
//     },

//     // Format date
//     formatDate: function(date) {
//         if (!date) return 'N/A';
//         const options = { year: 'numeric', month: 'short', day: 'numeric' };
//         return new Date(date).toLocaleDateString('en-US', options);
//     },

//     // Format currency
//     formatCurrency: function(amount) {
//         if (!amount) return '₹0';
//         return new Intl.NumberFormat('en-IN', {
//             style: 'currency',
//             currency: 'INR'
//         }).format(amount);
//     },

//     // Get time ago
//     getTimeAgo: function(date) {
//         if (!date) return 'Unknown';
        
//         const now = new Date();
//         const itemDate = new Date(date);
//         const diffTime = Math.abs(now - itemDate);
        