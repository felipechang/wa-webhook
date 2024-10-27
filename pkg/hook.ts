import {Message} from "whatsapp-web.js";

/**
 * postWebhook function for posting a message to a webhook.
 * @param {Message} message - The message to post.
 * @param {string} webhook - The webhook URL.
 * @returns {Promise<void>}
 */
export const postWebhook = async (message: Message, webhook: string): Promise<void> => {
    try {
        const media = message.hasMedia ? await message.downloadMedia() : null;
        const response = await fetch(webhook, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                from: message.from,
                to: message.to,
                body: message.body,
                author: message.author,
                fromMe: message.fromMe,
                type: message.type,
                deviceType: message.deviceType,
                hasMedia: message.hasMedia,
                media,
            }),
        });
        if (!response.ok) {
            console.error(`Error posting to webhook: ${webhook}`);
        }
    } catch (error) {
        console.error(`Error posting to webhook: ${error}`);
    }
};