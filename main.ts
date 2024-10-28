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
waClient.onOutgoingListeners(async (eventCode, message: Message) => {
    if (message.from === "status@broadcast") return;
    const webhooks = await dbClient.fetchWebhooks(eventCode);
    webhooks.map(((webhook) => postWebhook(message, webhook)));
});

const webClient = new WebClient();

webClient.onEventOptionsComponent();
webClient.onGetContactById(waClient);
webClient.onGetContacts(waClient);
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
    // Boot WhatsApp client
    await waClient.boot();
    // Boot web client
    webClient.boot();
})();