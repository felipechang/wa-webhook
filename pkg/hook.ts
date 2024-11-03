import {Message} from "whatsapp-web.js";
import {logger} from "./logger.js";

/**
 * postWebhook function for posting a message to a webhook.
 * @param {string} eventCode - The event code being called.
 * @param {Webhook} webhook - The webhook information.
 * @param {Message} message - The message to post.
 * @returns {Promise<void>}
 */
export const postWebhook = async (eventCode: string, webhook: Webhook, message: Message | undefined): Promise<void> => {
    try {
        const headers: { [key: string]: string } = {"Content-Type": "application/json"};
        webhook.auth_header.split(",").map((e) => {
            const [key, value] = e.split(" ");
            if (key && value) headers[`${key}`] = value;
        });
        const response = await fetch(webhook.post_url, {
            method: "POST",
            headers,
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
            const {code, message, hint} = await response.json() as any;
            logger.error(`🌐: issue posting webhook: code=${code} message=${message} hint=${hint}`);
        }
    } catch (error: any) {
        logger.error(`🌐: error posting webhook: ${error?.message}`);
    }
};