# WhatsApp Webhooks

Integrate WhatsApp messaging capabilities into your applications through webhooks and
REST APIs.

> [!IMPORTANT]
> **Uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), so it's not guaranteed you won't be blocked
by using this method. WhatsApp does
not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.**

## 🚀 Features

- **WhatsApp Client**: Seamless UI connection to WhatsApp client
- **Real-time Status**: Monitor WhatsApp client connection status
- **Webhook Management**: Register and manage webhook callbacks for WhatsApp events
- **Message Handling**: Send and receive WhatsApp messages programmatically
- **Bot Integration**: API endpoints for bot implementation

## 📋 API Reference

### Contact Management

- `GET /api/contact/:id`
    - Returns contact information for a specific contact ID
    - Parameters: `id` (path parameter)

- `GET /api/contact`
    - Returns a list of all contacts

### Group Management

- `GET /api/groups`
    - Returns a list of all group chats

### Status

- `GET /api/status`
    - Returns the current status of the WhatsApp client
    - Response includes ready status and QR code (if not authenticated)

### Webhook Management

- `POST /api/webhook`
    - Creates a new webhook subscription
    - Required body parameters:
        - `eventCode`: Type of event to subscribe to
        - `postUrl`: URL where webhook notifications will be sent
    - Optional body parameters:
        - `includeChat`: Include chat information (boolean)
        - `includeContact`: Include contact information (boolean)
        - `includeGroupMentions`: Include group mentions (boolean)
        - `includeInfo`: Include additional info (boolean)
        - `includeMentions`: Include mentions (boolean)
        - `includeOrder`: Include order information (boolean)
        - `includePayment`: Include payment information (boolean)
        - `includeQuotedMessage`: Include quoted messages (boolean)
        - `includeReactions`: Include message reactions (boolean)

- `GET /api/webhook`
    - Returns a list of all registered webhooks

- `DELETE /api/webhook/:id`
    - Removes a webhook subscription
    - Parameters: `id` (path parameter)

### Messaging

- `POST /api/message`
    - Sends a WhatsApp message
    - Required body parameters:
        - `from`: Sender's contact ID
        - `message`: Message content to send

All endpoints return JSON responses and include appropriate error handling. Error responses will include a status code
and an error message in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- 200: Successful operation
- 400: Bad request (missing or invalid parameters)
- 500: Internal server error

## 🔧 Installation

- Copy .env.example to .env

- Run with node:

```bash
npm install
npm start
```

- Build and run with Docker:

```bash
docker compose -f compose.build.yaml up -d
```

- Run with Docker:

```bash
docker compose up -d
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.