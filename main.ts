/**
 * Main application code.
 */
import DbClient from "./clients/db_client.ts";
import WaClient from "./clients/wa_client.ts";
import WebClient from "./clients/web_client.ts";
import {postWebhook} from "./pkg/hook.ts";
import {Message} from "whatsapp-web.js";
import {logger} from "./pkg/logger.js";

const dbClient = new DbClient();
const waClient = new WaClient();

// Listen for incoming WhatsApp events and post them to the webhooks
waClient.onOutgoingListeners(async (eventCode, message: Message) => {
    if (message && message.from === "status@broadcast") {
        logger.info("📨: broadcast dropped", eventCode, message);
        return;
    }
    const webhooks = await dbClient.fetchWebhooks(eventCode);
    logger.info(`📨: ${eventCode} to ${webhooks.length} endpoints`);
    webhooks.map(((webhook) => postWebhook(eventCode, webhook, message)));
});

const webClient = new WebClient();

webClient.onEventOptionsComponent();
webClient.onGetContactById(waClient);
webClient.onGetContacts(waClient);
webClient.onGetContactsComponent(waClient);
webClient.onGetGroups(waClient);
webClient.onGetReadyStatus(waClient);
webClient.onGetReadyStatusComponent(waClient);
webClient.onHookAdd(dbClient);
webClient.onHookAddComponent(dbClient);
webClient.onHookGet(dbClient);
webClient.onHookGetComponent(dbClient);
webClient.onHookRemove(dbClient);
webClient.onHookRemoveComponent(dbClient);
webClient.onIncomingMessage(waClient);
webClient.onIncomingMessageComponent(waClient);

(async function () {
    // Boot database client
    await dbClient.boot();
    // Boot web client
    webClient.boot();
    // Boot WhatsApp client
    await waClient.boot();
})();