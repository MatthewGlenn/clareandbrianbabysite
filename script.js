// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // RSVP Form handling
    const rsvpForm = document.getElementById('rsvpForm');
    const successMessage = document.getElementById('rsvpSuccess');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(rsvpForm);
            const rsvpData = {
                name: formData.get('guestName'),
                email: formData.get('email'),
                attending: formData.get('attending'),
                guests: formData.get('guests'),
                message: formData.get('message')
            };
                  // Validate required fields
        if (!rsvpData.name || !rsvpData.email || !rsvpData.attending || !rsvpData.guests) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate guest number
        const guestNumber = parseInt(rsvpData.guests);
        if (isNaN(guestNumber) || guestNumber < 1 || guestNumber > 10) {
            showNotification('Please enter a valid number of guests (1-10).', 'error');
            return;
        }
            
            // Simulate form submission (replace with actual form handling)
            submitRSVP(rsvpData);
        });
    }
    
    // Add animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards
    const cards = document.querySelectorAll('.detail-card, .registry-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// RSVP submission function with enhanced security
async function submitRSVP(data) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        // Security validation and sanitization
        const validatedData = securityManager.validateSubmission(data);
        
        // Send to webhook
        const response = await sendToWebhook(validatedData);
        
        if (response.success) {
            // Also send receipt to Discord
            await sendToDiscord(validatedData);
            
            // Show success message
            document.getElementById('rsvpForm').style.display = 'none';
            document.getElementById('rsvpSuccess').style.display = 'block';
            
            // Show notification
            showNotification('Thank you for your RSVP! We can\'t wait to celebrate with you! 🌙✨', 'success');
            
            // Add confetti effect
            createConfetti();
        } else {
            throw new Error(response.error || 'Failed to submit RSVP');
        }
    } catch (error) {
        console.error('RSVP submission error:', error);
        
        // Check if it's a configuration error
        if (error.message.includes('not configured')) {
            showNotification('Configuration error: Please check webhook setup.', 'error');
            return;
        }
        
        // Show user-friendly error message
        showNotification(error.message || 'Unable to submit RSVP. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Function to load webhook configuration (build-time or development)
async function getWebhookConfig() {
    // Use build-time injected configuration (production)
    if (window.WEBHOOK_CONFIG) {
        return {
            RSVP_WEBHOOK_URL: window.WEBHOOK_CONFIG.rsvpUrl,
            DISCORD_WEBHOOK_URL: window.WEBHOOK_CONFIG.discordUrl
        };
    }
    
    // Fallback for local development - try to load .env
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
            const response = await fetch('.env');
            if (response.ok) {
                const text = await response.text();
                const envVars = {};
                text.split('\n').forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        envVars[key.trim()] = value.trim();
                    }
                });
                return envVars;
            }
        } catch (error) {
            console.warn('Local .env file not found, using production config');
        }
    }
    
    throw new Error('Webhook configuration not available. Please check deployment.');
}

// Send RSVP data to webhook with enhanced security
async function sendToWebhook(data) {
    const config = await getWebhookConfig();
    const WEBHOOK_URL = config.RSVP_WEBHOOK_URL;
    
    if (!WEBHOOK_URL) {
        throw new Error('RSVP webhook URL not configured');
    }
    
    // Add request headers for better security
    const webhookData = {
        ...data,
        submittedAt: new Date().toISOString(),
        event: "Clare & Brian's Sailor Moon Baby Shower",
        source: 'website',
        userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
    };
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SailorMoonBabyShower/1.0'
            },
            body: JSON.stringify(webhookData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Try to parse response, but don't fail if it's not JSON
        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = { status: 'success', message: 'RSVP submitted successfully' };
        }
        
        console.log('Successfully sent to webhook:', result);
        
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Error sending to webhook:', error);
        return { success: false, error: error.message };
    }
}

// Send RSVP receipt to Discord with enhanced security
async function sendToDiscord(data) {
    const config = await getWebhookConfig();
    const DISCORD_URL = config.DISCORD_WEBHOOK_URL;
    
    if (!DISCORD_URL) {
        console.warn('Discord webhook not configured');
        return { success: true }; // Don't fail if Discord is optional
    }
    
    const embed = {
        title: "🌙✨ Sailor Moon Baby Shower RSVP",
        color: data.attending === 'yes' ? 0xFF69B4 : data.attending === 'no' ? 0x808080 : 0xFFD700,
        fields: [
            { name: "� Guest(s)", value: data.name, inline: true },
            { name: "📧 Email", value: data.email, inline: true },
            { name: "✅ Attending", value: data.attending.toUpperCase(), inline: true },
            { name: "🎭 Party Size", value: data.numberOfGuests.toString(), inline: true },
            { name: "📅 Event", value: "Clare & Brian's Baby Shower", inline: true },
            { name: "⏰ Submitted", value: new Date().toLocaleString(), inline: true }
        ],
        footer: { text: "Powered by Sailor Moon Magic 🌙✨" },
        timestamp: new Date().toISOString()
    };
    
    if (data.message && data.message.trim()) {
        embed.fields.push({ name: "� Message", value: data.message.trim().substring(0, 500) });
    }
    
    try {
        const response = await fetch(DISCORD_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord webhook error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        console.log('Successfully sent to Discord');
        return { success: true };
        
    } catch (error) {
        console.error('Error sending to Discord:', error);
        return { success: false, error: error.message };
    }
}

// Alternative: Send via serverless function (for production with environment variables)
async function sendViaServerlessFunction(data) {
    try {
        const response = await fetch('/api/submit-rsvp', {  // Your serverless function endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                attending: data.attending,
                numberOfGuests: parseInt(data.guests),
                message: data.message || "",
                submittedAt: new Date().toISOString(),
                event: "Clare & Brian's Sailor Moon Baby Shower"
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);        }
        
        const result = await response.json();
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Error sending via serverless function:', error);
        return { success: false, error: error.message };
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-family: 'Quicksand', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        font-size: 16px;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);

// Confetti effect
function createConfetti() {
    const colors = ['#ff69b4', '#ffd700', '#667eea', '#764ba2', '#ff6b6b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            transform: rotate(${Math.random() * 360}deg);
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            z-index: 1000;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentElement) {
                confetti.remove();
            }
        }, 5000);
    }
}

// Add confetti animation styles
const confettiStyles = document.createElement('style');
confettiStyles.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyles);

// Start the typing effect when page loads
window.addEventListener('load', function() {
    // Initialize typing effect for the quote
    const quote = document.querySelector('.sailor-quote');
    if (quote) {
        const originalText = quote.textContent;
        
        const quoteObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter(entry.target, originalText, 30);
                    quoteObserver.unobserve(entry.target);
                }
            });
        });
        
        quoteObserver.observe(quote);
    }
});

// Add sparkle effect on hover for buttons
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('registry-btn') || e.target.classList.contains('submit-btn')) {
        createSparkles(e.target);
    }
});

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const sparkleCount = 5;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + Math.random() * rect.width}px;
            top: ${rect.top + Math.random() * rect.height}px;
            animation: sparkle 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 600);
    }
}

// Add sparkle animation
const sparkleStyles = document.createElement('style');
sparkleStyles.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(sparkleStyles);

// Add typing effect for the quote
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Security Manager for static site protection
class SecurityManager {
    constructor() {
        this.rateLimiter = new Map();
        this.submissionCount = 0;
        this.maxSubmissions = 10; // Per session
        this.initSecurity();
    }
    
    initSecurity() {
        // Basic bot detection
        this.startTime = Date.now();
        this.mouseMovements = 0;
        this.keystrokes = 0;
        
        document.addEventListener('mousemove', () => this.mouseMovements++);
        document.addEventListener('keypress', () => this.keystrokes++);
    }
    
    validateSubmission(data) {
        // Rate limiting
        const now = Date.now();
        const recentSubmissions = Array.from(this.rateLimiter.values())
            .filter(time => now - time < 300000); // 5 minutes
            
        if (recentSubmissions.length >= 3) {
            throw new Error('Too many submissions. Please wait before trying again.');
        }
        
        // Session limits
        if (this.submissionCount >= this.maxSubmissions) {
            throw new Error('Maximum submissions reached for this session.');
        }
        
        // Basic bot detection
        const sessionTime = now - this.startTime;
        if (sessionTime < 10000 && this.mouseMovements < 5 && this.keystrokes < 10) {
            throw new Error('Please interact with the page before submitting.');
        }
        
        // Input validation
        this.validateInputData(data);
        
        // Record submission
        this.rateLimiter.set(now, now);
        this.submissionCount++;
        
        return this.sanitizeData(data);
    }
    
    validateInputData(data) {
        const errors = [];
        
        // Name validation
        if (!data.name || data.name.trim().length < 2 || data.name.length > 100) {
            errors.push('Name must be 2-100 characters');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email) || data.email.length > 100) {
            errors.push('Please enter a valid email address');
        }
        
        // Attendance validation
        if (!['yes', 'no', 'maybe'].includes(data.attending)) {
            errors.push('Invalid attendance selection');
        }
        
        // Guest count validation
        const guests = parseInt(data.guests);
        if (isNaN(guests) || guests < 1 || guests > 10) {
            errors.push('Guest count must be 1-10');
        }
        
        // Message validation (optional but limited)
        if (data.message && data.message.length > 500) {
            errors.push('Message must be under 500 characters');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
    
    sanitizeData(data) {
        return {
            name: this.sanitizeString(data.name, 100),
            email: data.email.trim().toLowerCase().substring(0, 100),
            attending: data.attending,
            numberOfGuests: Math.max(1, Math.min(10, parseInt(data.guests))),
            message: data.message ? this.sanitizeString(data.message, 500) : '',
        };
    }
    
    sanitizeString(str, maxLength) {
        return str.trim()
            .replace(/[<>]/g, '') // Remove potential HTML
            .substring(0, maxLength);
    }
}

const securityManager = new SecurityManager();

// Test function to manually trigger webhook (for testing purposes)
// You can call this from the browser console: testWebhook()
window.testWebhook = async function() {
    console.log('🧪 Testing webhook...');
    
    // Sample test data
    const testData = {
        name: "Test User & Partner",
        email: "test@example.com",
        attending: "yes",
        guests: "2",
        message: "This is a test RSVP submission to verify the webhook is working correctly!"
    };
    
    try {
        console.log('📤 Sending test data:', testData);
          const response = await sendToWebhook(testData);
        
        if (response.success) {
            console.log('✅ Webhook test successful!');
            console.log('📥 Response:', response.data);
            
            // Also test Discord webhook
            console.log('📤 Testing Discord webhook...');
            const discordResponse = await sendToDiscord(testData);
            
            if (discordResponse.success) {
                console.log('✅ Discord webhook test successful!');
                showNotification('🧪 Both webhook and Discord tests successful! Check console for details.', 'success');
            } else {
                console.warn('⚠️ Discord webhook test failed:', discordResponse.error);
                showNotification('🧪 Webhook test successful, but Discord test failed. Check console for details.', 'success');
            }
        } else {
            console.error('❌ Webhook test failed:', response.error);
            showNotification('❌ Webhook test failed. Check console for details.', 'error');
        }
        
        return response;
        
    } catch (error) {
        console.error('💥 Webhook test error:', error);
        showNotification('💥 Webhook test error. Check console for details.', 'error');
        return { success: false, error: error.message };
    }
};

// Quick test function with minimal data
window.quickWebhookTest = async function() {
    console.log('⚡ Quick webhook test...');
    
    const quickTestData = {
        name: "Quick Test",
        email: "quicktest@example.com", 
        attending: "yes",
        guests: "1",
        message: "Quick test message"
    };
    
    const result = await sendToWebhook(quickTestData);
    console.log(result.success ? '✅ Quick webhook test passed!' : '❌ Quick webhook test failed!', result);
    
    // Also test Discord
    const discordResult = await sendToDiscord(quickTestData);
    console.log(discordResult.success ? '✅ Quick Discord test passed!' : '❌ Quick Discord test failed!', discordResult);
    
    return { webhook: result, discord: discordResult };
};

// Function to test webhook with current configuration
window.testWebhookConfig = async function() {
    console.log('🔧 Testing webhook configuration...');
    
    try {
        const config = await getWebhookConfig();
        
        console.log('📄 Webhook Configuration Status:');
        console.log('RSVP Webhook:', config.RSVP_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');
        console.log('Discord Webhook:', config.DISCORD_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');
        
        if (window.WEBHOOK_CONFIG) {
            console.log('📦 Build-time config detected');
            console.log('Build time:', window.WEBHOOK_CONFIG.buildTime);
        } else {
            console.log('🔧 Development mode - using .env file');
        }
        
        return config;
        
    } catch (error) {
        console.error('❌ Configuration Error:', error.message);
        return null;
    }
};

// Test function specifically for Discord webhook
window.testDiscordWebhook = async function() {
    console.log('🧪 Testing Discord webhook...');
    
    // Sample test data
    const testData = {
        name: "Discord Test User",
        email: "discordtest@example.com",
        attending: "yes",
        guests: "2",
        message: "This is a test Discord notification to verify the webhook is working correctly! 🌙✨"
    };
    
    try {
        console.log('📤 Sending test Discord notification:', testData);
        
        const response = await sendToDiscord(testData);
        
        if (response.success) {
            console.log('✅ Discord webhook test successful!');
            showNotification('🧪 Discord webhook test successful! Check your Discord channel.', 'success');
        } else {
            console.error('❌ Discord webhook test failed:', response.error);
            showNotification('❌ Discord webhook test failed. Check console for details.', 'error');
        }
        
        return response;
        
    } catch (error) {
        console.error('💥 Discord webhook test error:', error);
        showNotification('💥 Discord webhook test error. Check console for details.', 'error');
        return { success: false, error: error.message };
    }
};

// Console message for easier testing
console.log('🌙✨ Sailor Moon Baby Shower Website Loaded! ✨🌙');
console.log('Available test functions:');
console.log('- testWebhook() - Test both main webhook and Discord');
console.log('- testDiscordWebhook() - Test Discord webhook only');
console.log('- quickWebhookTest() - Quick test of both webhooks');
console.log('- testWebhookConfig() - Check .env configuration');
console.log('💡 Call any of these functions in the console to test webhooks!');
