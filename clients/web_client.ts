/**
 * The WebClient class to create a web client using Express.js.
 */
import express, {Express, Request, Response} from "express";
import {logger} from "../pkg/logger.ts";
import WaClient from "./wa_client.ts";
import DbClient from "./db_client.ts";
import {Buffer} from "node:buffer";
import QRCode from "qrcode";
import bodyParser from "body-parser";

/**
 * The WebClient class.
 */
class WebClient {

    /**
     * The Express.js application.
     */
    private app: Express;

    /**
     * Constructor for the WebClient class.
     */
    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(express.static("static"))
    }

    private static makeHook(hook: any): Webhook {
        return {
            id: hook.id || "",
            event_code: hook.event_code || "",
            sender: hook.sender || "",
            auth_header: hook.auth_header || "",
            post_url: hook.post_url || "",
            include_chat: hook.include_chat === "on",
            include_contact: hook.include_contact === "on",
            include_group_mentions: hook.include_group_mentions === "on",
            include_info: hook.include_info === "on",
            include_mentions: hook.include_mentions === "on",
            include_order: hook.include_order === "on",
            include_payment: hook.include_payment === "on",
            include_quoted_message: hook.include_quoted_message === "on",
            include_reactions: hook.include_reactions === "on"
        }
    }

    /**
     * Boots the web client by starting the Express.js application.
     */
    public boot(): void {
        this.app.listen(5000);
        logger.info("🌐: server started http://localhost:5000");
    }

    /**
     * Returns a list of event options for the WhatsApp Webhook.
     */
    public onEventOptionsComponent(): void {
        this.app.get("/component/event-options", async (_: Request, res: Response) => {
            try {
                const events = (process.env.WA_WEBHOOK_EVENTS || "").split(",");
                const selectOptions = [
                    `<select class="select select-bordered w-full max-w-xs" id="event_code" name="event_code">`
                ];
                for (let i = 0; i < events.length; i++) {
                    switch (events[i]) {
                        case "change_battery":
                            selectOptions.push(`<option value="change_battery">Change Battery</option>`);
                            break;
                        case "change_state":
                            selectOptions.push(`<option value="change_state">Change State</option>`);
                            break;
                        case "disconnected":
                            selectOptions.push(`<option value="disconnected">Disconnected</option>`);
                            break;
                        case "group_join":
                            selectOptions.push(`<option value="group_join">Group Join</option>`);
                            break;
                        case "group_leave":
                            selectOptions.push(`<option value="group_leave">Group Leave</option>`);
                            break;
                        case "group_admin_changed":
                            selectOptions.push(`<option value="group_admin_changed">Group Admin Changed</option>`);
                            break;
                        case "group_membership_request":
                            selectOptions.push(`<option value="group_membership_request">Group Membership Request</option>`);
                            break;
                        case "group_update":
                            selectOptions.push(`<option value="group_update">Group Update</option>`);
                            break;
                        case "contact_changed":
                            selectOptions.push(`<option value="contact_changed">Contact Changed</option>`);
                            break;
                        case "media_uploaded":
                            selectOptions.push(`<option value="media_uploaded">Media Uploaded</option>`);
                            break;
                        case "message":
                            selectOptions.push(`<option value="message">Message Received</option>`);
                            break;
                        case "message_ack":
                            selectOptions.push(`<option value="message_ack">Message Ack</option>`);
                            break;
                        case "message_edit":
                            selectOptions.push(`<option value="message_edit">Message Edited</option>`);
                            break;
                        case "unread_count":
                            selectOptions.push(`<option value="unread_count">Unread Count Changed</option>`);
                            break;
                        case "message_create":
                            selectOptions.push(`<option value="message_create">Message Created</option>`);
                            break;
                        case "message_ciphertext":
                            selectOptions.push(`<option value="message_ciphertext">Message Ciphertext Received</option>`);
                            break;
                        case "message_revoke_everyone":
                            selectOptions.push(`<option value="message_revoke_everyone">Message Revoked for Everyone</option>`);
                            break;
                        case "message_revoke_me":
                            selectOptions.push(`<option value="message_revoke_me">Message Revoked by Me</option>`);
                            break;
                        case "message_reeventCode":
                            selectOptions.push(`<option value="message_reeventCode">Message ReeventCode</option>`);
                            break;
                        case "chat_removed":
                            selectOptions.push(`<option value="chat_removed">Chat Removed</option>`);
                            break;
                        case "chat_archived":
                            selectOptions.push(`<option value="chat_archived">Chat Archived/Unarchived</option>`);
                            break;
                        case "call":
                            selectOptions.push(`<option value="call">Call Received</option>`);
                            break;
                        case "remote_session_saved":
                            selectOptions.push(`<option value="remote_session_saved">Remote Session Saved</option>`);
                            break;
                        case "vote_update":
                            selectOptions.push(`<option value="vote_update">Vote Update</option>`);
                            break;
                    }
                }
                selectOptions.push(`</select>`)
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(selectOptions.join("")));
            } catch (error: any) {
                logger.error(`🌐: error fetching options component: ${error}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: event options component fetch successful`);
            }
        });
    }

    /**
     * Returns a contact by ID.
     *
     * @param waClient The WhatsApp client.
     */
    public onGetContactById(waClient: WaClient): void {
        this.app.get("/api/contact/:id", async (req: Request, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            if (!req.params || !req.params.id) {
                res.status(400).json({error: "Parameter id is missing"});
                return;
            }
            try {
                const contact = await waClient.getContactById(req.params.id);
                res.json(contact);
            } catch (error: any) {
                logger.error(`🌐: error fetching contact by id: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: contact by id fetch successful`);
            }
        });
    }

    /**
     * Returns a list of contacts.
     *
     * @param waClient The WhatsApp client.
     */
    public onGetContacts(waClient: WaClient): void {
        this.app.get("/api/contact", async (req: Request, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            try {
                const contacts = await waClient.getContacts();
                res.json(contacts);
            } catch (error: any) {
                logger.error(`🌐: error fetching contacts: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: contact fetch successful`);
            }
        });
    }

    /**
     * Returns a list of contacts (component version).
     *
     * @param waClient The WhatsApp client.
     */
    public onGetContactsComponent(waClient: WaClient): void {
        this.app.get("/component/contact/:type", async (req: Request, res: Response) => {
            if (!req.params || !req.params.type) {
                res.status(400).json({error: "Parameter type is missing"});
                return;
            }
            try {
                const contacts = await waClient.getContacts();
                const contactOptions = contacts.map((c) => {
                    return {
                        name: c.verifiedName || c.name || c.pushname,
                        value: c.id,
                        selected: c.isMe
                    }
                }).sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                const selectOptions = [
                    `<select class="select select-bordered w-full max-w-xs" id="${req.params.type}" name="${req.params.type}" required>`
                ];
                for (let i = 0; i < contactOptions.length; i++) {
                    selectOptions.push(`<option value="${contactOptions[i].value}" ${contactOptions[i].selected ? "selected" : ""}>${contactOptions[i].name}</option>`);
                }
                selectOptions.push(`</select>`)
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(selectOptions.join("")));
            } catch (error: any) {
                logger.error(`🌐: error fetching contact list component: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: contact list component fetch successful`);
            }
        });
    }

    /**
     * Returns a list of group chats.
     *
     * @param waClient The WhatsApp client.
     */
    public onGetGroups(waClient: WaClient): void {
        this.app.get("/api/groups", async (req: Request, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            try {
                const chatGroups = await waClient.getGroups();
                res.json(chatGroups);
            } catch (error: any) {
                logger.error(`🌐: error fetching group list: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: group fetch successful`);
            }
        });
    }

    /**
     * Returns the status of the WhatsApp client.
     * @param waClient The WhatsApp client.
     */
    public onGetReadyStatus(waClient: WaClient): void {
        this.app.get("/api/status", async (req: Request, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            try {
                const readyStatus = await waClient.getReadyStatus();
                res.json(readyStatus);
            } catch (error: any) {
                logger.error(`🌐: error fetching on-ready-status: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: on-ready-status fetch successful`);
            }
        });
    }

    /**
     * Returns the status of the WhatsApp client (component version).
     * @param waClient The WhatsApp client.
     */
    public onGetReadyStatusComponent(waClient: WaClient) {
        this.app.get("/component/status-control", async (_: Request, res: Response) => {
            const readyStatus = await waClient.getReadyStatus();
            res.set("Content-Type", "text/html");
            if (readyStatus.ready) {
                res.send(Buffer.from(`
                    <h2>WhatsApp Client is Ready</div>
                `));
                return;
            }
            if (!readyStatus.qr) {
                res.send(Buffer.from(`
                    <h2>Waiting for QR...</h2>
                `));
                return;
            }
            try {
                const qrCodeImage = await QRCode.toDataURL(readyStatus.qr);
                res.send(Buffer.from(`
                    <h2 class="mb-4">Use your phone to pair:</h2>
                    <img src="${qrCodeImage}" alt="QR Code"/>
                `));
            } catch (error: any) {
                logger.error(`🌐: error generating QR code: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: on-ready-status component fetch successful`);
            }
        });
    }

    /**
     * Adds a webhook to the database.
     * @param dbClient The database client.
     */
    public onHookAdd(dbClient: DbClient): void {
        this.app.post("/api/webhook", async (req: Request<Partial<Webhook>>, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            if (!req.body) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            const webhook = WebClient.makeHook(req.body);
            if (!webhook.event_code) {
                res.status(400).json({error: "event_code is a required parameter"});
                return;
            }
            if (!webhook.post_url) {
                res.status(400).json({error: "post_url is a required parameter"});
                return;
            }
            try {
                await dbClient.insertWebhook(webhook);
                res.json({});
            } catch (error: any) {
                logger.error(`🌐: error adding webhook: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: webhook add successful`);
            }
        });
    }

    /**
     * Adds a webhook to the database (component version).
     * @param dbClient The database client.
     */
    public onHookAddComponent(dbClient: DbClient): void {
        this.app.post("/component/webhook-control", async (req: Request<Webhook>, res: Response) => {
            const webhook = WebClient.makeHook(req.body);
            try {
                await dbClient.insertWebhook(webhook);
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(this.listWebhooksComponent(await dbClient.fetchAllWebhooks())));
            } catch (error: any) {
                logger.error(`🌐: error adding webhook component: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: webhook add component successful`);
            }
        });
    }

    /**
     * Returns all webhooks.
     * @param dbClient The database client.
     */
    public onHookGet(dbClient: DbClient): void {
        this.app.get("/api/webhook", async (req: Request<Webhook>, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            try {
                res.json(await dbClient.fetchAllWebhooks());
            } catch (error: any) {
                logger.error(`🌐: error fetching webhook list: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: webhook list fetch successful`);
            }
        });
    }

    /**
     * Returns all webhooks (component version).
     * @param dbClient The database client.
     */
    public onHookGetComponent(dbClient: DbClient): void {
        this.app.get("/component/webhook-control", async (_: Request<Webhook>, res: Response) => {
            try {
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(this.listWebhooksComponent(await dbClient.fetchAllWebhooks())));
            } catch (error: any) {
                logger.error(`🌐: error fetching webhook list component: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: webhook list fetch component successful`);
            }
        });
    }

    /**
     * Removes a webhook from the database.
     * @param dbClient The database client.
     */
    public onHookRemove(dbClient: DbClient): void {
        this.app.delete("/api/webhook/:id", async (req: Request<{ id: string }>, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            if (!req.params || !req.params.id) {
                res.status(400).json({error: "Parameter id is missing"});
                return;
            }
            try {
                await dbClient.removeWebhook(req.params.id);
                res.json({});
            } catch (error: any) {
                logger.error(`🌐: error removing webhook: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: webhook removal successful`);
            }
        });
    }

    /**
     * Removes a webhook from the database (component version).
     * @param dbClient The database client.
     */
    public onHookRemoveComponent(dbClient: DbClient): void {
        this.app.delete("/component/webhook-control/:id", async (req: Request<{ id: string }>, res: Response) => {
            try {
                await dbClient.removeWebhook(req.params.id);
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(this.listWebhooksComponent(await dbClient.fetchAllWebhooks())));
            } catch (error: any) {
                logger.error(`🌐: error removing webhook component: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: webhook removal component successful`);
            }
        });
    }

    /**
     * Handles incoming messages from WhatsApp.
     * @param waClient The WhatsApp client.
     */
    public onIncomingMessage(waClient: WaClient): void {
        this.app.post("/api/message", async (req: Request<MessageBody>, res: Response) => {
            const error = this.validateHeaderKey(req);
            if (error) {
                res.status(401).json({error});
                return;
            }
            if (!req.body) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            if (!req.body.recipient) {
                res.status(400).json({error: "recipient is a required parameter"});
                return;
            }
            if (!req.body.message) {
                res.status(400).json({error: "message is a required parameter"});
                return;
            }
            if (req.body.message.indexOf(process.env.WA_WEBHOOK_BREAK_CHAR) === 0) {
                res.status(400).json({error: "break character found"});
                return;
            }

            try {
                await waClient.sendMessage(req.body.recipient, `${process.env.WA_WEBHOOK_BREAK_CHAR} ${req.body.message}`);
                res.json({});
            } catch (error: any) {
                logger.error(`🌐: error relaying message: ${error?.message}`);
                res.status(500).json({error: "Internal Server Error"});
            } finally {
                logger.info(`🌐: message relay successful`);
            }
        });
    }

    /**
     * Handles incoming messages from WhatsApp (component version).
     * @param waClient The WhatsApp client.
     */
    public onIncomingMessageComponent(waClient: WaClient): void {
        this.app.post("/component/message-control", async (req: Request<MessageBody>, res: Response) => {
            try {
                await waClient.sendMessage(req.body.recipient, req.body.message);
                res.set("Content-Type", "text/html");
                res.send(Buffer.from(this.alertComponent("alert-success", "Message sent")));
            } catch (error: any) {
                logger.error(`🌐: error relaying message component: ${error?.message}`);
                res.status(500).send(Buffer.from(this.alertComponent("alert-error", "Internal Server Error")));
            } finally {
                logger.info(`🌐: message relay component successful`);
            }
        });
    }

    /**
     * Generates an alert component.
     * @param type The type of alert.
     * @param message The message to display.
     * @return The HTML for the alert component.
     */
    private alertComponent(type: string, message: string): string {
        return `
            <div role="alert" class="alert ${type}">
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        class="h-6 w-6 shrink-0 stroke-current">
                    <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>${message}</span>
            </div>`
    }

    /**
     * Generates a component list of webhooks.
     * @param webhooks The webhooks to display.
     * @return The HTML for the list component.
     */
    private listWebhooksComponent(webhooks: Webhook[]): string {
        const nodes = [
            `<div class="overflow-x-auto">`,
            `<table class="table table-sm">`,
            `<thead>`,
            `<tr>`,
            `    <th></th>`,
            `    <th>Event</th>`,
            `    <th>Sender</th>`,
            `    <th>URL</th>`,
            `    <th>Header</th>`,
            `    <th>➕ Info</th>`,
            `    <th>➕ Chat</th>`,
            `    <th>➕ Contact</th>`,
            `    <th>➕ QM</th>`,
            `    <th>➕ Order</th>`,
            `    <th>➕ GM</th>`,
            `    <th>➕ Mentions</th>`,
            `    <th>➕ Payment</th>`,
            `    <th>➕ Reactions</th>`,
            `<tr>`,
            `</thead>`,
            `<tbody>`,
        ];

        for (let i = 0; i < webhooks.length; i++) {
            const webhook = webhooks[i];
            nodes.push(`
        <tr>
            <td>
            <button hx-delete="/component/webhook-control/${webhook.id}" hx-target="#webhook-response">
               💀
            </button>
          </td>
          <td>${webhook.event_code}</td>
          <td>${webhook.sender}</td>
          <td>${webhook.post_url}</td>
          <td>${webhook.auth_header}</td>
          <td>${webhook.include_info ? "✅" : "🚫"}</td>
          <td>${webhook.include_chat ? "✅" : "🚫"}</td>
          <td>${webhook.include_contact ? "✅" : "🚫"}</td>
          <td>${webhook.include_quoted_message ? "✅" : "🚫"}</td>
          <td>${webhook.include_order ? "✅" : "🚫"}</td>
          <td>${webhook.include_group_mentions ? "✅" : "🚫"}</td>
          <td>${webhook.include_mentions ? "✅" : "🚫"}</td>
          <td>${webhook.include_payment ? "✅" : "🚫"}</td>
          <td>${webhook.include_reactions ? "✅" : "🚫"}</td>
        </tr>`);
        }

        nodes.push(`</tbody>`);
        nodes.push(`</table>`);
        nodes.push(`</div>`);
        return nodes.join("");
    }

    /**
     * Validates the API key in the request header.
     *
     * @param {Request<any>} req The HTTP request object.
     * @returns {string} An error message if the API key is invalid or missing, otherwise an empty string.
     * @private
     */
    private validateHeaderKey(req: Request<any>): string {
        const sysKey = process.env.WA_WEBHOOK_API_AUTH;
        if (!req.headers || !req.headers['x-api-key']) {
            return "Missing API key header";
        }
        const headerKey = req.headers['x-api-key'];
        const apiKey = typeof headerKey === "string" ? headerKey : headerKey[0];
        if (!apiKey) {
            return "Missing API key";
        }
        if (apiKey !== sysKey) {
            return "Invalid API key";
        }
        return "";
    }
}

export default WebClient;