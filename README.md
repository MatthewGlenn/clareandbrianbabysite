# Clare & Brian's Sailor Moon Baby Shower Website 🌙✨

A magical static website for Clare and Brian's baby shower with a beautiful Sailor Moon theme.

## 🚀 Quick Start

1. **Clone/Download**: Get the website files
2. **View Website**: Open `index.html` in your web browser
3. **Test Setup**: Open `webhook-test.html` to verify webhook functionality
4. **Deploy**: Upload files to any static hosting service

## 📁 Project Structure

- `index.html` - Main website structure and content
- `styles.css` - Complete styling and Sailor Moon themed design
- `script.js` - Interactive functionality and RSVP form handling (includes webhook configuration)
- `webhook-test.html` - Test interface for webhook validation

## ✨ Features

- **📅 Event Details**: Date, time, and location with map integration
- **🎁 Gift Registries**: Links to baby registries
- **📝 RSVP System**: Complete form with webhook integration
- **💬 Discord Notifications**: Instant RSVP receipts sent to Discord
- **🌙 Sailor Moon Theme**: Beautiful design with moon animation
- **📱 Responsive**: Works perfectly on all devices
- **🔄 Dual Webhooks**: Data sent to both main webhook and Discord

## 🔧 Configuration

### Webhook URLs

Webhook URLs are configured directly in `script.js` in the `WEBHOOK_CONFIG` object:

```javascript
const WEBHOOK_CONFIG = {
    RSVP_WEBHOOK_URL: 'https://your-webhook-url.com/endpoint',
    DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/your-webhook-id/your-token'
};
```

To update the webhooks, simply edit these URLs in the `script.js` file.

### RSVP Data Flow

1. **User submits RSVP** → Form validation
2. **Main webhook** → Sends structured data to your automation system
3. **Discord webhook** → Sends beautiful embed notification to Discord channel
4. **User feedback** → Shows success/error messages

## 🧪 Testing Webhooks

### Browser Console

Open developer tools and run:

```javascript
testWebhook()           // Test both webhooks
testDiscordWebhook()    // Test Discord only
quickWebhookTest()      // Quick test both
testWebhookConfig()     // Check configuration status
```

### Test Interface

Open `webhook-test.html` for a visual testing interface.

**Note**: Webhook URLs are now included directly in the code. No additional configuration needed.

## 📄 Webhook Data Formats

See `WEBHOOK_FORMAT.md` for detailed information about:

- Main webhook JSON payload structure
- Discord embed format
- Field descriptions and examples

## 🔧 Customization

### Update Event Details

Edit the "Party Details" section in `index.html`:

- Change date and time
- Update location address
- Modify map link

### Update Registry Links

Replace the `href="#"` attributes in the registry section with actual registry URLs.

### Modify Colors

Edit CSS variables in `styles.css` to change the color scheme.

## 🌐 Deployment Options

### GitHub Pages (Recommended)

This repository includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

**Setup Steps:**

1. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Source: "GitHub Actions"

2. **Add Webhook Secrets**:
   - Go to repository → Settings → Secrets and variables → Actions
   - Add repository secrets:
     - `RSVP_WEBHOOK_URL`: Your main webhook URL
     - `DISCORD_WEBHOOK_URL`: Your Discord webhook URL

3. **Deploy**:
   - Push to `main` branch or manually trigger workflow
   - Your site will be available at: `https://yourusername.github.io/repository-name`

**Workflow Features:**

- Automatic deployment on push to main
- Build-time environment variable injection
- Build verification and error checking

### Alternative Hosting

- **Firebase Hosting**: Google's reliable hosting platform

### Form Handling

- Using Webhooks connected to n8n and Notion for RSVP management

---

*"In the name of the Moon, we celebrate new life!"* 🌙💕
