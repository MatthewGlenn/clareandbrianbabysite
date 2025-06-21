# Webhook Data Format

When an RSVP is submitted, the data is sent to **two webhooks**:

1. **Main RSVP Webhook** - For data processing and storage
2. **Discord Webhook** - For instant notifications

## Main RSVP Webhook Format

The following JSON data will be sent to your main webhook URL:

```json
{
  "name": "John and Jane Doe",
  "email": "johndoe@example.com",
  "attending": "yes",
  "numberOfGuests": 2,
  "message": "Can't wait to celebrate with you! I'm allergic to shellfish.",
  "submittedAt": "2025-06-20T15:30:45.123Z",
  "event": "Clare & Brian's Sailor Moon Baby Shower"
}
```

## Discord Webhook Format

A beautifully formatted Discord embed is sent with the RSVP details:

```json
{
  "embeds": [{
    "title": "🌙✨ Sailor Moon Baby Shower RSVP",
    "description": "A new RSVP has been submitted!",
    "color": 16738484,
    "fields": [
      {
        "name": "👤 Guest Name",
        "value": "John and Jane Doe",
        "inline": true
      },
      {
        "name": "📧 Email", 
        "value": "johndoe@example.com",
        "inline": true
      },
      {
        "name": "🎉 Attending",
        "value": "✅ Yes",
        "inline": true
      },
      {
        "name": "👥 Number of Guests",
        "value": "2",
        "inline": true
      },
      {
        "name": "📅 Event",
        "value": "Clare & Brian's Sailor Moon Baby Shower",
        "inline": true
      },
      {
        "name": "⏰ Submitted At",
        "value": "6/20/2025, 3:30:45 PM",
        "inline": true
      },
      {
        "name": "💌 Message",
        "value": "Can't wait to celebrate with you! I'm allergic to shellfish.",
        "inline": false
      }
    ],
    "footer": {
      "text": "Powered by Sailor Moon Magic 🌙✨"
    },
    "timestamp": "2025-06-20T15:30:45.123Z"
  }]
}
```

## Field Descriptions

- **name**: Guest name(s) as entered in the form
- **email**: Contact email address
- **attending**: Response status ("yes", "no", or "maybe")
- **numberOfGuests**: Number of people attending (integer 1-10)
- **message**: Optional message from the guest (dietary restrictions, wishes, etc.)
- **submittedAt**: ISO timestamp of when the form was submitted
- **event**: Static event identifier for your records

## n8n Webhook Integration

Your webhook URL should be configured in the `.env` file:

```env
RSVP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-id/your-token
```

From your n8n workflow, you can:

- Store the data in a database
- Send email notifications
- Update spreadsheets
- Trigger other automation workflows
- Send confirmation emails to guests

## Error Handling

If the webhook fails:

- User sees an error message with clear instructions
- Console logs the error for debugging
- Configuration errors are highlighted to help with setup
