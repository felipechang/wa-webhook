/**
 * WaClient class for interacting with WhatsApp Web.
 */
import wa, {Message} from "whatsapp-web.js";
import {logger} from "../pkg/logger.ts";

class WaClient {
    /**
     * The WhatsApp Web client instance.
     * @private
     */
    private client: wa.Client;

    /**
     * The events to listen for.
     * @private
     */
    private events: string[] = (process.env.WA_WEBHOOK_EVENTS || "").split(",");

    /**
     * Device link QR code.
     * @private
     */
    private qr: string = "";

    /**
     * Client is ready.
     * @private
     */
    private ready: boolean = false;

    /**
     * Constructor for the WaClient class.
     */
    constructor() {
        this.client = new wa.Client({
            authStrategy: new wa.LocalAuth({
                dataPath: './sessions',
                clientId: 'wa-default'
            }),
            puppeteer: process.env.NODE_ENV === "development" ? {} : {
                executablePath: '/usr/bin/google-chrome',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });
    }

    /**
     * Boots the WhatsApp Web client.
     */
    public async boot() {

        this.client.on("qr", async (qr: string): Promise<void> => {
            this.qr = qr;
            logger.info("📱: QR code generated");
        });

        this.client.on("ready", async (): Promise<void> => {
            this.qr = "";
            this.ready = true;
            const state = await this.client.getState();
            logger.info(`📱: client ${state === "CONNECTED" ? 'is ready' : 'failed to start'}`);
        });

        await this.client.initialize();
    }

    /**
     * Retrieves a contact by its ID.
     *
     * @param {string} contactId The ID of the contact to retrieve.
     * @returns {Promise<ChatContact>} A promise that resolves to the contact with the given ID.
     */
    public async getContactById(contactId: string): Promise<ChatContact> {
        if (!this.ready) throw new Error("client is not ready");
        try {
            const contact = await this.client.getContactById(contactId);
            logger.info(`📱: contact with id=${contactId} fetched`);
            return {
                id: contact.id._serialized,
                isBlocked: contact.isBlocked,
                isBusiness: contact.isBusiness,
                isEnterprise: contact.isEnterprise,
                isGroup: contact.isGroup,
                isMe: contact.isMe,
                isMyContact: contact.isMyContact,
                isUser: contact.isUser,
                isWAContact: contact.isWAContact,
                labels: contact.labels,
                name: contact.name,
                number: contact.number,
                pushname: contact.pushname,
                sectionHeader: contact.sectionHeader,
                shortName: contact.shortName,
                statusMute: contact.statusMute,
                type: contact.type,
                verifiedLevel: contact.verifiedLevel,
                verifiedName: contact.verifiedName
            }
        } catch (error) {
            throw new Error(`📱: error fetching contact with id=${contactId}: ${error}`);
        }
    }


    public async getContacts(): Promise<ChatContact[]> {
        if (!this.ready) throw new Error("client is not ready");
        try {
            const chats = await this.client.getContacts();
            logger.info(`📱: contacts fetched`);
            return chats
                .filter((contact) => {
                    // See https://github.com/pedroslopez/whatsapp-web.js/issues/2330
                    return contact.id.server !== "lid"
                })
                .map(contact => {
                    return {
                        id: contact.id._serialized,
                        isBlocked: contact.isBlocked,
                        isBusiness: contact.isBusiness,
                        isEnterprise: contact.isEnterprise,
                        isGroup: contact.isGroup,
                        isMe: contact.isMe,
                        isMyContact: contact.isMyContact,
                        isUser: contact.isUser,
                        isWAContact: contact.isWAContact,
                        labels: contact.labels,
                        name: contact.name,
                        number: contact.number,
                        pushname: contact.pushname,
                        sectionHeader: contact.sectionHeader,
                        shortName: contact.shortName,
                        statusMute: contact.statusMute,
                        type: contact.type,
                        verifiedLevel: contact.verifiedLevel,
                        verifiedName: contact.verifiedName
                    }
                });
        } catch (error) {
            throw new Error(`📱: error fetching contacts: ${error}`);
        }
    }

    /**
     * Retrieves a list of chat groups.
     *
     * @returns {Promise<ChatGroup[]>} A promise that resolves to an array of chat groups.
     */
    public async getGroups(): Promise<ChatGroup[]> {
        if (!this.ready) throw new Error("client is not ready");
        try {
            const chats = await this.client.getChats();
            logger.info(`📱: groups fetched`);
            return chats
                .filter(chat => chat.isGroup)
                .map(chat => {
                    return {
                        id: chat.id._serialized,
                        name: chat.name,
                        archived: chat.archived,
                        isReadOnly: chat.isReadOnly,
                        isMuted: chat.isMuted,
                        muteExpiration: chat.muteExpiration,
                        timestamp: chat.timestamp,
                        unreadCount: chat.unreadCount,
                        pinned: chat.pinned
                    } as ChatGroup
                });
        } catch (error) {
            throw new Error(`📱: error fetching contacts: ${error}`);
        }
    }

    /**
     * Gets the ready status of the client.
     * @returns {ReadyStatus} The ready status of the client.
     */
    public async getReadyStatus(): Promise<ReadyStatus> {
        return {
            qr: this.qr,
            ready: this.ready
        };
    }

    /**
     * Listens for outgoing messages and calls the callback function.
     * @param {function} callback - The callback function to call with the outgoing message.
     */
    public onOutgoingListeners(callback: (eventCode: string, message: wa.Message) => void): void {
        this.events.map((eventCode: string): void => {
            this.client.on(eventCode, (message: Message) => callback(eventCode, message));
        });
    }

    /**
     * Sends a message to a user.
     * @param {string} recipient - The phone number of the user to send the message to.
     * @param {string} message - The message to send.
     * @returns {Promise<boolean>}
     */
    public async sendMessage(recipient: string, message: string): Promise<void> {
        if (!this.ready) throw new Error("client is not ready");
        try {
            await this.client.sendMessage(recipient, message);
        } catch (error) {
            throw new Error(`📱: error sending message ${error}`);
        } finally {
            logger.info(`📱: message sent to ${recipient}`);
        }
    }
}

export default WaClient;