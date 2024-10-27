# WhatsApp Webhooks

Integrate WhatsApp messaging capabilities into your applications through webhooks and
REST APIs.

> [!IMPORTANT]
> **Uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), so it's not guaranteed you won't be blocked by using this method. WhatsApp does
not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.**

## 🚀 Features

- **WhatsApp Client**: Seamless UI connection to WhatsApp client
- **Real-time Status**: Monitor WhatsApp client connection status
- **Webhook Management**: Register and manage webhook callbacks for WhatsApp events
- **Message Handling**: Send and receive WhatsApp messages programmatically
- **Bot Integration**: API endpoints for bot implementation

## 📋 API Reference

### Message Operations

#### Send Message

```http
POST /api/message
```

Send WhatsApp messages to specified recipients.

**Request Body:**

```json
{
  "from": "recipient_number",
  "message": "message_content"
}
```

### Status Management

#### Client Status

```http
GET /api/status
```

Check current WhatsApp client connection status.

### Webhook Management

#### Register Webhook

```http
POST /api/webhook
```

Register new webhook endpoints for specific events.

**Request Body:**

```json
{
  "action": "event_type",
  "webhook": "callback_url"
}
```

#### List Webhooks

```http
GET /api/webhook
```

Retrieve all registered webhooks.

#### Remove Webhook

```http
DELETE /api/webhook/:id
```

Remove a specific webhook by ID.

## 🔧 Installation

- Copy .env.example to .env

- Run with node:

```bash
npm install
npm start
```

- Run with Docker:

```bash
docker compose up -d
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.