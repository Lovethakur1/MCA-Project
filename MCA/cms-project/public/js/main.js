// Main JavaScript for MCA website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('change', function() {
            navLinks.classList.toggle('active', this.checked);
        });
    }

    // Mega menu functionality
    const personalTrainingBtn = document.getElementById('personal-training-btn');
    const megaDropdown = document.getElementById('mega-dropdown');
    
    if (personalTrainingBtn && megaDropdown) {
        personalTrainingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            megaDropdown.classList.toggle('show');
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!personalTrainingBtn.contains(e.target) && !megaDropdown.contains(e.target)) {
                megaDropdown.classList.remove('show');
            }
        });
    }

    // Blog tabs functionality
    const blogTabs = document.querySelectorAll('.blgtab');
    const mainHeading = document.getElementById('blgmain-heading');
    const mainDescription = document.getElementById('blgmain-description');
    const centerImage = document.getElementById('blgcenter-image');

    blogTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            blogTabs.forEach(t => t.classList.remove('blgactive'));
            
            // Add active class to clicked tab
            this.classList.add('blgactive');

            // Update main content
            const title = this.querySelector('.blgtab-title').textContent;
            const description = this.querySelector('.blgtab-description').textContent;
            const image = this.querySelector('.blgtab-image').src;

            if (mainHeading) mainHeading.textContent = title;
            if (mainDescription) mainDescription.textContent = description;
            if (centerImage) centerImage.src = image;
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form validation
    const contactForm = document.querySelector('form[action="/contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const name = this.querySelector('input[name="name"]');
            const email = this.querySelector('input[name="email"]');
            const message = this.querySelector('textarea[name="message"]');

            let isValid = true;

            // Basic validation
            if (name && !name.value.trim()) {
                isValid = false;
                showError(name, 'Name is required');
            }

            if (email && !isValidEmail(email.value)) {
                isValid = false;
                showError(email, 'Valid email is required');
            }

            if (message && !message.value.trim()) {
                isValid = false;
                showError(message, 'Message is required');
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Testimonials star rating display
    const starRatings = document.querySelectorAll('.rating');
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (star.classList.contains('filled')) {
                star.style.color = '#ffc107';
            }
        });
    });

    // Load more functionality for blog/testimonials
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Implement load more functionality
            console.log('Load more clicked');
        });
    }
});

// Helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.focus();
}

// Admin panel functionality
if (window.location.pathname.startsWith('/admin')) {
    // Delete confirmation
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });

    // Auto-save draft functionality
    const contentForms = document.querySelectorAll('form');
    contentForms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                // Auto-save to localStorage
                const key = `draft_${form.action}_${this.name}`;
                localStorage.setItem(key, this.value);
            });
        });
    });
}
