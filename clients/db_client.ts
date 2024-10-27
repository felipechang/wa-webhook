/**
 * DbClient class for interacting with a PostgreSQL database.
 */
import pg from 'pg';
import {logger} from "../pkg/logger.ts";
import "dotenv/config";

/**
 * The database instance.
 * @private
 */
class DbClient {

    /**
     * Boots the database by creating the webhook table if it doesn't exist.
     */
    public async boot() {
        await this.createWebhookTable();
    }

    /**
     * Inserts a webhook into the database.
     * @param {string} action - The action of the webhook.
     * @param {string} webhook - The webhook URL.
     */
    public async insertWebhook(action: string, webhook: string): Promise<void> {
        const client = await this.NewClient();
        try {
            await client.query(`INSERT INTO webhooks (action, webhook) VALUES ($1, $2)`, [action, webhook]);
        } catch (err) {
            logger.error("Error inserting webhook:", err);
        } finally {
            logger.info("Webhook inserted");
        }
        await client.end();
    }

    /**
     * Removes a webhook from the database.
     * @param {string} id - The ID of the webhook to remove.
     */
    public async removeWebhook(id: string): Promise<void> {
        const client = await this.NewClient();
        try {
            await client.query(`DELETE FROM webhooks WHERE id = $1`, [id]);
        } catch (err) {
            logger.error("Error removing webhook:", err);
        } finally {
            logger.info("Webhook removed");
        }
        await client.end();
    }

    /**
     * Fetches webhooks from the database.
     */
    public async fetchAllWebhooks(): Promise<Webhook[]> {
        const webhooks: Webhook[] = [];
        const client = await this.NewClient();
        try {
            const res = await client.query(`SELECT * FROM webhooks`);
            res.rows.forEach((row: Webhook) => {
                webhooks.push({
                    id: row.id,
                    action: row.action,
                    webhook: row.webhook
                });
            });
        } catch (err) {
            logger.error("Error fetching webhooks:", err);
        } finally {
            logger.info("All webhooks fetched");
        }
        await client.end();
        return webhooks;
    }

    /**
     * Fetches webhooks from the database filtered by action.
     * @param {string} action - The action to filter webhooks by.
     */
    public async fetchWebhooks(action: string): Promise<Webhook[]> {
        const webhooks: Webhook[] = [];
        const client = await this.NewClient();
        try {
            const res = await client.query(`SELECT * FROM webhooks WHERE action = $1`, [action]);
            res.rows.forEach((row: Webhook) => {
                webhooks.push({
                    id: row.id,
                    action: row.action,
                    webhook: row.webhook
                });
            });
        } catch (err) {
            logger.error("Error fetching webhooks:", err);
        } finally {
            logger.info(`Webhooks fetched for ${action}`);
        }
        await client.end();
        return webhooks;
    }

    /**
     * Creates the webhook table in the database if it doesn't exist.
     * @private
     */
    private async createWebhookTable() {
        const client = await this.NewClient();
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS webhooks (id SERIAL PRIMARY KEY, action TEXT, webhook TEXT)`);
        } catch (err) {
            logger.error("Error recreating webhook table:", err);
        } finally {
            logger.info("Webhook table recreated");
        }
        await client.end();
    }

    private async NewClient() {
        const {Client} = pg
        const client = new Client({
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            port: 5432,
        })
        await client.connect();
        return client;
    }
}

export default DbClient;