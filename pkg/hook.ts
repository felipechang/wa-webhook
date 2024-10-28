import {Message} from "whatsapp-web.js";

/**
 * postWebhook function for posting a message to a webhook.
 * @param {Message} message - The message to post.
 * @param {Webhook} webhook - The webhook information.
 * @returns {Promise<void>}
 */
export const postWebhook = async (message: Message, webhook: Webhook): Promise<void> => {
    try {
        const response = await fetch(webhook.postUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // TODO check response sent
            body: JSON.stringify({
                // from: message.from,
                // to: message.to,
                // body: message.body,
                // author: message.author,
                // fromMe: message.fromMe,
                // type: message.type,
                // deviceType: message.deviceType,
                // hasMedia: message.hasMedia,
                media: message.hasMedia ? await message.downloadMedia() : null,
                info: webhook.includeInfo ? await message.getInfo() : null,
                chat: webhook.includeChat ? await message.getChat() : null,
                contact: webhook.includeContact ? await message.getContact() : null,
                quotedMessage: webhook.includeQuotedMessage ? await message.getQuotedMessage() : null,
                order: webhook.includeOrder ? await message.getOrder() : null,
                groupMentions: webhook.includeGroupMentions ? await message.getGroupMentions() : null,
                mentions: webhook.includeMentions ? await message.getMentions() : null,
                payment: webhook.includePayment ? await message.getPayment() : null,
                reactions: webhook.includeReactions ? await message.getReactions() : null,
                ...message.rawData
            }),
        });
        if (!response.ok) {
            console.error(`Error posting to webhook: ${webhook}`);
        }
    } catch (error) {
        console.error(`Error posting to webhook: ${error}`);
    }
};