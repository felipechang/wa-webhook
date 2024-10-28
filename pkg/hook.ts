import {Message} from "whatsapp-web.js";

/**
 * postWebhook function for posting a message to a webhook.
 * @param {string} eventCode - The event code being called.
 * @param {Webhook} webhook - The webhook information.
 * @param {Message} message - The message to post.
 * @returns {Promise<void>}
 */
export const postWebhook = async (eventCode: string, webhook: Webhook, message: Message | undefined): Promise<void> => {
    try {
        const response = await fetch(webhook.post_url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(message ? {
                eventCode,
                message: message.rawData,
                media: message.hasMedia ? await message.downloadMedia() : null,
                info: webhook.include_info ? await message.getInfo() : null,
                chat: webhook.include_chat ? await message.getChat() : null,
                contact: webhook.include_contact ? await message.getContact() : null,
                quotedMessage: webhook.include_quoted_message ? await message.getQuotedMessage() : null,
                order: webhook.include_order ? await message.getOrder() : null,
                groupMentions: webhook.include_group_mentions ? await message.getGroupMentions() : null,
                mentions: webhook.include_mentions ? await message.getMentions() : null,
                payment: webhook.include_payment ? await message.getPayment() : null,
                reactions: webhook.include_reactions ? await message.getReactions() : null
            } : {
                eventCode,
            })
        });
        if (!response.ok) {
            console.error(`Error posting to webhook: ${webhook}`);
        }
    } catch (error) {
        console.error(`Error posting to webhook: ${error}`);
    }
};