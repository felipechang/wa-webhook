/**
 * MessageBody interface.
 * @interface
 */
interface MessageBody {
    /**
     * The message content.
     * @memberof MessageBody
     * @type {string}
     */
    message: string;

    /**
     * The sender of the message.
     * @memberof MessageBody
     * @type {string}
     */
    from: string;
}

/**
 * HookBody interface.
 * @interface
 */
interface HookBody {
    /**
     * The webhook URL.
     * @memberof HookBody
     * @type {string}
     */
    webhook: string;
}

/**
 * ReadyStatus interface.
 * @interface
 */
interface ReadyStatus {
    /**
     * The QR code URL.
     * @memberof ReadyStatus
     * @type {string}
     */
    qr: string;

    /**
     * Whether the status is ready or not.
     * @memberof ReadyStatus
     * @type {boolean}
     */
    ready: boolean;
}

/**
 * Webhook interface.
 * @interface
 */
interface Webhook {
    /**
     * The ID of the webhook.
     * @memberof Webhook
     * @type {string}
     */
    id: string;

    /**
     * The action of the webhook.
     * @memberof Webhook
     * @type {string}
     */
    action: string;

    /**
     * The webhook URL.
     * @memberof Webhook
     * @type {string}
     */
    webhook: string;
}