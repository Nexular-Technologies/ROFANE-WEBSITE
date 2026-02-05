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

// Modal control functions
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('active');
}

window.onload = function() {
    const contactForm = document.querySelector('.php-email-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // 2. Visual feedback: Disable button during transmission
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

            // 4. Send the email
            emailjs.send('service_5kreiu7', 'Rofane_email', templateParams)
                .then(function() {
                    // SUCCESS: Trigger custom modal
                    showSuccessModal(); 
                    contactForm.reset(); 
                }, function(error) {
                    // ERROR: Log the detailed error
                    console.log('EMAILJS ERROR:', error);
                    alert('Transmission Failed. Error: ' + (error.text || 'Check connection'));
                })
                .finally(() => {
                    // 5. Restore the button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
};