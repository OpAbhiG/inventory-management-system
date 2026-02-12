document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const hospital = document.getElementById('hospital').value;

        const validUsername = 'a@123';
        const validPassword = 'A@123';

        // Remove any existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        if (username === validUsername && password === validPassword && hospital) {
            showAlert('Login successful! Redirecting...', 'success');
            
            // Save login info + selected hospital
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', new Date().toISOString());
            localStorage.setItem('selectedHospital', hospital);  // ← This saves the hospital

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            let errorMsg = 'Invalid credentials.';
            if (!hospital) errorMsg = 'Please select a hospital/center.';
            showAlert(errorMsg + ' Please try again.', 'danger');
        }
    });

    // Show alert function (unchanged)
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentNode) alert.parentNode.removeChild(alert);
        }, 3000);
    }
});