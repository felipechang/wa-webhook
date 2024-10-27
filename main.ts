/**
 * Main application code.
 */
import DbClient from "./clients/db_client.ts";
import WaClient from "./clients/wa_client.ts";
import WebClient from "./clients/web_client.ts";
import {postWebhook} from "./pkg/hook.ts";
import {Message} from "whatsapp-web.js";

const dbClient = new DbClient();
const waClient = new WaClient();

// Listen for incoming WhatsApp events and post them to the webhooks
waClient.onOutgoingListeners(async (action, message: Message) => {
    if (message.from === "status@broadcast") return;
    const webhooks = await dbClient.fetchWebhooks(action);
    webhooks.map(((webhook) => postWebhook(message, webhook.webhook)));
});

const webClient = new WebClient();

// Send incoming message to WhatsApp and return json
webClient.onIncomingMessage(waClient);

// Send incoming message to WhatsApp and return component message
webClient.onIncomingMessageComponent(waClient);

// Store new hook in database and return json
webClient.onHookAdd(dbClient);

// Store new hook in database and return component list of webhooks
webClient.onHookAddComponent(dbClient);

// Look for hooks in database and return json
webClient.onHookGet(dbClient);

// Look for hooks in database and return component list of webhooks
webClient.onHookGetComponent(dbClient);

// Remove hook from database and return json
webClient.onHookRemove(dbClient);

// Remove hook from database and return component list of webhooks
webClient.onHookRemoveComponent(dbClient);

// Send incoming message to WhatsApp and return json
webClient.onGetReadyStatus(waClient);

// Send incoming message to WhatsApp and return component
webClient.onGetReadyStatusComponent(waClient);

(async function () {
    // Boot database client
    await dbClient.boot();
    // Boot WhatsApp client
    await waClient.boot();
    // Boot web client
    webClient.boot();
})();