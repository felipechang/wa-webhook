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
     * Whether the client is ready.
     * @private
     */
    private ready = false;

    /**
     * The events to listen for.
     * @private
     */
    private events = [
        "message_create"
    ];

    /**
     * Devide link QR code.
     * @private
     */
    private qr = "";

    /**
     * Constructor for the WaClient class.
     */
    constructor() {
        this.client = new wa.Client({
            authStrategy: new wa.LocalAuth(),
            puppeteer: {
                executablePath: "/usr/bin/google-chrome",
                args: ["--no-sandbox"]
            }
        });
    }

    /**
     * Boots the WhatsApp Web client.
     */
    public async boot() {
        this.client.on("qr", (qr: string) => {
            this.qr = qr;
            logger.info("QR code generated");
        });

        this.client.on("ready", () => {
            this.ready = true;
            this.qr = "";
            logger.info("WhatsApp client is ready");
        });

        await this.client.initialize();
    }

    /**
     * Listens for outgoing messages and calls the callback function.
     * @param {function} callback - The callback function to call with the outgoing message.
     */
    public onOutgoingListeners(callback: (action: string, message: wa.Message) => void) {
        this.events.map((action: string): void => {
            this.client.on(action, (message: Message) => callback(action, message));
        });
    }

    /**
     * Gets the ready status of the client.
     * @returns {ReadyStatus} The ready status of the client.
     */
    public getReadyStatus(): ReadyStatus {
        return {
            qr: this.qr,
            ready: this.ready
        };
    }

    /**
     * Sends a message to a user.
     * @param {string} from - The phone number of the user to send the message to.
     * @param {string} message - The message to send.
     * @returns {Promise<boolean>}
     */
    public async sendMessage(from: string, message: string): Promise<boolean> {
        if (!this.ready) {
            logger.info("Failed to send message. Client is not ready");
            return false;
        }
        await this.client.sendMessage(from, message);
        logger.info("Message sent");
        return true;
    }
}

export default WaClient;