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
    recipient: string;
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
     * The event code calling the webhook.
     * @memberof Webhook
     * @type {string}
     */
    event_code: string;

    /**
     * Comma separated list of webhook request headers (Basic c2VjcmV0Cg==,Foo Bar).
     * @memberof Webhook
     * @type {string}
     */
    auth_header: string;

    /**
     * The webhook URL.
     * @memberof Webhook
     * @type {string}
     */
    post_url: string;

    /**
     * Include information about message delivery status
     * @memberof Webhook
     * @type {boolean}
     */
    include_info: boolean;

    /**
     * Include the Chat this message was sent in
     * @memberof Webhook
     * @type {boolean}
     */
    include_chat: boolean;

    /**
     * Include the Contact this message was sent from
     * @memberof Webhook
     * @type {boolean}
     */
    include_contact: boolean;

    /**
     * Include the quoted message, if any
     * @memberof Webhook
     * @type {boolean}
     */
    include_quoted_message: boolean;

    /**
     * Include the order associated with a given message
     * @memberof Webhook
     * @type {boolean}
     */
    include_order: boolean;

    /**
     * Include groups mentioned in this message
     * @memberof Webhook
     * @type {boolean}
     */
    include_group_mentions: boolean;

    /**
     * Include the Contacts mentioned in this message
     * @memberof Webhook
     * @type {boolean}
     */
    include_mentions: boolean;

    /**
     * Include the payment details associated with a given message
     * @memberof Webhook
     * @type {boolean}
     */
    include_payment: boolean;

    /**
     * Include the reactions associated with the given message
     * @memberof Webhook
     * @type {boolean}
     */
    include_reactions: boolean;
}

/**
 * ChatGroup interface.
 * @interface
 */
interface ChatGroup {
    /**
     * Indicates if the Chat is archived.
     * @memberof ChatGroup
     * @type {boolean}
     */
    archived: boolean;

    /**
     * ID that represents the chat.
     * @memberof ChatGroup
     * @type {string}
     */
    id: string;

    /**
     * Indicates if the Chat is readonly.
     * @memberof ChatGroup
     * @type {boolean}
     */
    isReadOnly: boolean;

    /**
     * Indicates if the Chat is muted.
     * @memberof ChatGroup
     * @type {boolean}
     */
    isMuted: boolean;

    /**
     * Unix timestamp for when the mute expires.
     * @memberof ChatGroup
     * @type {number}
     */
    muteExpiration: number;

    /**
     * Title of the chat.
     * @memberof ChatGroup
     * @type {string}
     */
    name: string;

    /**
     * Unix timestamp for when the last activity occurred.
     * @memberof ChatGroup
     * @type {number}
     */
    timestamp: number;

    /**
     * Amount of messages unread.
     * @memberof ChatGroup
     * @type {number}
     */
    unreadCount: number;

    /**
     * Indicates if the Chat is pinned.
     * @memberof ChatGroup
     * @type {boolean}
     */
    pinned: boolean;
}

/**
 * ChatContact interface.
 * @interface
 */
interface ChatContact {
    /**
     * Contact's phone number.
     * @memberof ChatContact
     * @type {string}
     */
    number: string,

    /**
     * Indicates if the contact is a business contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isBusiness: boolean,

    /**
     * ID that represents the contact.
     * @memberof ChatContact
     * @type {string}
     */
    id: string,

    /**
     * Indicates if the contact is an enterprise contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isEnterprise: boolean,

    /**
     * Indicates if the contact is a group contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isGroup: boolean,

    /**
     * Indicates if the contact is the current user's contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isMe: boolean,

    /**
     * Indicates if the number is saved in the current phone's contacts.
     * @memberof ChatContact
     * @type {boolean}
     */
    isMyContact: boolean,

    /**
     * Indicates if the contact is a user contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isUser: boolean,

    /**
     * Indicates if the number is registered on WhatsApp.
     * @memberof ChatContact
     * @type {boolean}
     */
    isWAContact: boolean,

    /**
     * Indicates if you have blocked this contact.
     * @memberof ChatContact
     * @type {boolean}
     */
    isBlocked: boolean,

    /**
     * Contact labels.
     * @memberof ChatContact
     * @type {string[]}
     */
    labels?: string[],

    /**
     * The contact's name, as saved by the current user.
     * @memberof ChatContact
     * @type {string}
     */
    name?: string,

    /**
     * The name that the contact has configured to be shown publically.
     * @memberof ChatContact
     * @type {string}
     */
    pushname: string,

    /**
     * Section header for the contact.
     * @memberof ChatContact
     * @type {string}
     */
    sectionHeader: string,

    /**
     * A shortened version of name.
     * @memberof ChatContact
     * @type {string}
     */
    shortName?: string,

    /**
     * Indicates if the status from the contact is muted.
     * @memberof ChatContact
     * @type {boolean}
     */
    statusMute: boolean,

    /**
     * Type of the contact.
     * @memberof ChatContact
     * @type {string}
     */
    type: string,

    /**
     * Verification level of the contact.
     * @memberof ChatContact
     * @type {undefined}
     */
    verifiedLevel?: undefined,

    /**
     * Verified name of the contact.
     * @memberof ChatContact
     * @type {undefined}
     */
    verifiedName?: undefined,
}