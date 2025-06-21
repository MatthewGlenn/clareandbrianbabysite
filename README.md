# Clare & Brian's Sailor Moon Baby Shower Website 🌙✨

A magical static website for Clare and Brian's baby shower with a beautiful Sailor Moon theme.

## 🚀 Quick Start

1. **Clone/Download**: Get the website files
2. **Configure Webhooks**: Copy `.env.example` to `.env` and add your webhook URLs
3. **Test Setup**: Open `webhook-test.html` to verify configuration
4. **View Website**: Open `index.html` in your web browser
5. **Deploy**: Upload files to any static hosting service

## 📁 Project Structure

- `index.html` - Main website structure and content
- `styles.css` - Complete styling and Sailor Moon themed design
- `script.js` - Interactive functionality and RSVP form handling
- `.env.example` - Template for webhook configuration
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

### For Production (GitHub Pages)

The site uses **build-time environment variable injection**:

1. **Set GitHub Secrets**:
   - Repository → Settings → Secrets and variables → Actions
   - Add: `RSVP_WEBHOOK_URL` and `DISCORD_WEBHOOK_URL`

2. **Deploy**:
   - Push to main branch
   - Webhook URLs are securely injected during build
   - No sensitive data in deployed files

### For Local Development

**Step 1**: Copy the example file:

```bash
cp .env.example .env
```

**Step 2**: Edit `.env` with your webhook URLs:

```env
# Main webhook for RSVP data processing (n8n, Zapier, etc.)
RSVP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Discord webhook for instant notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-id/your-token
```

### RSVP Data Flow

1. **User submits RSVP** → Form validation
2. **Main webhook** → Sends structured data to your n8n/automation system
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

**Note**: In production, configuration is automatically injected during build. For local development, ensure your `.env` file is properly configured.

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
