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

    /**
     * Boots the web client by starting the Express.js application.
     */
    public boot() {
        this.app.listen(5000);
        logger.info("Server started on http://localhost:5000");
    }

    /**
     * Handles incoming messages from WhatsApp.
     * @param waClient The WhatsApp client.
     */
    public onIncomingMessage(waClient: WaClient) {
        this.app.post("/api/message", async (req: Request<MessageBody>, res: Response) => {
            if (!req.body || !req.body.from || !req.body.message) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            logger.info(`Received message from ${req.body.from}: ${req.body.message}`);
            const sent = await waClient.sendMessage(req.body.from, req.body.message);
            res.json({sent});
        });
    }

    /**
     * Handles incoming messages from WhatsApp (component version).
     * @param waClient The WhatsApp client.
     */
    public onIncomingMessageComponent(waClient: WaClient) {
        this.app.post("/component/message-control", async (req: Request<MessageBody>, res: Response) => {
            if (!req.body) {
                res.send(Buffer.from(this.alertComponent("alert-warning", "Request body is missing")));
                return;
            }
            if (!req.body.from) {
                res.send(Buffer.from(this.alertComponent("alert-warning", "Form field is required")));
                return;
            }
            if (!req.body.message) {
                res.send(Buffer.from(this.alertComponent("alert-warning", "Message field is required")));
                return;
            }
            logger.info(`Received message from ${req.body.from}: ${req.body.message}`);
            const sent = await waClient.sendMessage(req.body.from, req.body.message);
            res.send(Buffer.from(sent ?
                this.alertComponent("alert-success", "Message sent") :
                this.alertComponent("alert-error", "Client is not ready")
            ));
        });
    }

    /**
     * Returns the status of the WhatsApp client.
     * @param waClient The WhatsApp client.
     */
    public onGetReadyStatus(waClient: WaClient) {
        this.app.get("/api/status", (_: Request, res: Response) => {
            res.set("Content-Type", "text/html");
            const readyStatus = waClient.getReadyStatus();
            res.json(readyStatus);
        });
    }

    /**
     * Returns the status of the WhatsApp client (component version).
     * @param waClient The WhatsApp client.
     */
    public onGetReadyStatusComponent(waClient: WaClient) {
        this.app.get("/component/status-control", async (_: Request, res: Response) => {
            res.set("Content-Type", "text/html");
            const readyStatus = waClient.getReadyStatus();
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
            } catch (err) {
                console.error("Error generating QR code:", err);
                res.status(500).send("Internal Server Error");
            }
        });
    }

    /**
     * Adds a webhook to the database.
     * @param dbClient The database client.
     */
    public onHookAdd(dbClient: DbClient) {
        this.app.post("/api/webhook", async (req: Request<Webhook>, res: Response) => {
            if (!req.body) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            if (!req.body.action) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            if (!req.body.webhook) {
                res.status(400).json({error: "Invalid request body"});
                return;
            }
            logger.info(`Hook added: action=${req.body.action}, webhook=${req.body.webhook}`);
            await dbClient.insertWebhook(req.body.action, req.body.webhook);
            res.json({});
        });
    }

    /**
     * Adds a webhook to the database (component version).
     * @param dbClient The database client.
     */
    public onHookAddComponent(dbClient: DbClient) {
        this.app.post("/component/webhook-control", async (req: Request<Webhook>, res: Response) => {
            await dbClient.insertWebhook(req.body.action, req.body.webhook);
            logger.info(`Hook added: action=${req.body.action}, webhook=${req.body.webhook}`);
            res.send(Buffer.from(this.listComponent(await dbClient.fetchAllWebhooks())));
        });
    }

    /**
     * Returns all webhooks.
     * @param dbClient The database client.
     */
    public onHookGet(dbClient: DbClient) {
        this.app.get("/api/webhook", async (_: Request<Webhook>, res: Response) => {
            res.json(await dbClient.fetchAllWebhooks());
        });
    }

    /**
     * Returns all webhooks (component version).
     * @param dbClient The database client.
     */
    public onHookGetComponent(dbClient: DbClient) {
        this.app.get("/component/webhook-control", async (_: Request<Webhook>, res: Response) => {
            res.send(Buffer.from(this.listComponent(await dbClient.fetchAllWebhooks())));
        });
    }

    /**
     * Removes a webhook from the database.
     * @param dbClient The database client.
     */
    public onHookRemove(dbClient: DbClient) {
        this.app.delete("/api/webhook/:id", async (req: Request<{ id: string }>, res: Response) => {
            if (!req.params || !req.params.id) {
                res.status(400).json({error: "Parameter id is missing"});
                return;
            }
            logger.info(`Hook removed: id=${req.params.id}`);
            await dbClient.removeWebhook(req.params.id);
            res.json({});
        });
    }

    /**
     * Removes a webhook from the database (component version).
     * @param dbClient The database client.
     */
    public onHookRemoveComponent(dbClient: DbClient) {
        this.app.delete("/component/webhook-control/:id", async (req: Request<{ id: string }>, res: Response) => {
            logger.info(`Hook removed: id=${req.params.id}`);
            await dbClient.removeWebhook(req.params.id);
            res.send(Buffer.from(this.listComponent(await dbClient.fetchAllWebhooks())));

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
     * Generates a list component.
     * @param webhooks The webhooks to display.
     * @return The HTML for the list component.
     */
    private listComponent(webhooks: Webhook[]): string {
        const nodes = [
            `<div class="overflow-x-auto">`,
            `<table class="table">`,
            `<thead>`,
            `<tr>`,
            `    <th>ID</th>`,
            `    <th>Action</th>`,
            `    <th>Webhook</th>`,
            `    <th>Remove</th>`,
            `<tr>`,
            `</thead>`,
            `<tbody>`,
        ];

        for (let i = 0; i < webhooks.length; i++) {
            const webhook = webhooks[i];
            nodes.push(`
            <tr>
              <th>${webhook.id}</th>
              <td>${webhook.action}</td>
              <td>${webhook.webhook}</td>
              <td>
                <button hx-delete="/component/webhook-control/${webhook.id}" hx-target="#webhook-response">
                    <img src="/assets/trash.svg" class="w-6" alt="Remove"/>
                </button>
              </td>
            </tr>`);
        }

        nodes.push(`</tbody>`);
        nodes.push(`</table>`);
        nodes.push(`</div>`);
        return nodes.join("");
    }
}

export default WebClient;