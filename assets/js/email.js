/**
 * Rofane Website - EmailJS Integration
 * Public Key: vrPfxZMgyjrWE_X91
 * Service ID: service_5kreiu7
 * Template ID: Rofane_email
 */

(function() {
    // 1. Initialize EmailJS with your Public Key
    emailjs.init("vrPfxZMgyjrWE_X91");
})();

/**
 * showSuccessModal
 * Manages the Bootstrap 5 Modal instance to ensure 
 * it displays correctly above the glassmorphism UI.
 */
function showSuccessModal() {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
        // Get existing instance or create a new one to prevent memory leaks
        let bsModal = bootstrap.Modal.getInstance(modalElement);
        if (!bsModal) {
            bsModal = new bootstrap.Modal(modalElement);
        }
        bsModal.show();
    }
}

/**
 * Form Submission Logic
 */
window.onload = function() {
    const contactForm = document.querySelector('.php-email-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // 2. Visual feedback: Disable button and show "Transmitting" state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'TRANSMITTING...';
            submitBtn.disabled = true;

            // 3. Map form fields to the EmailJS Template Variables
            const templateParams = {
                user_name: this.querySelector('input[name="name"]').value,
                user_email: this.querySelector('input[name="email"]').value,
                subject: this.querySelector('input[name="subject"]').value,
                message: this.querySelector('textarea[name="message"]').value
            };

            // 4. Send the email using Service ID and Template ID
            emailjs.send('service_5kreiu7', 'Rofane_email', templateParams)
                .then(function() {
                    // SUCCESS: Trigger the high-z-index success modal
                    showSuccessModal(); 
                    contactForm.reset(); 
                }, function(error) {
                    // ERROR: Log the detailed error to console and alert the user
                    console.error('EMAILJS ERROR:', error);
                    alert('Transmission Failed. Error: ' + (error.text || 'Please check your connection and try again.'));
                })
                .finally(() => {
                    // 5. Restore the button state regardless of success or failure
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
};