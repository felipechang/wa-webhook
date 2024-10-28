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
     * @param {Webhook} webhook - The webhook to insert.
     */
    public async insertWebhook(webhook: Webhook): Promise<void> {
        const client = await this.NewClient();
        try {
            await client.query(`
              INSERT INTO webhooks (
                event_code,
                post_url,
                include_info,
                include_chat,
                include_contact,
                include_quoted_message,
                include_order,
                include_group_mentions,
                include_mentions,
                include_payment,
                include_reactions
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
              )`,
                [
                    webhook.event_code,
                    webhook.post_url,
                    webhook.include_info,
                    webhook.include_chat,
                    webhook.include_contact,
                    webhook.include_quoted_message,
                    webhook.include_order,
                    webhook.include_group_mentions,
                    webhook.include_mentions,
                    webhook.include_payment,
                    webhook.include_reactions,
                ]);
        } catch (err) {
            throw new Error(`💾: error inserting webhook: ${err}`);
        } finally {
            logger.info("💾: webhook inserted");
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
            throw new Error(`💾: error removing webhook: ${err}`);
        } finally {
            logger.info("💾: webhook removed");
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
                webhooks.push(row);
            });
        } catch (err) {
            throw new Error(`💾: error fetching webhooks: ${err}`);
        } finally {
            logger.info("💾: webhooks fetched");
        }
        await client.end();
        return webhooks;
    }

    /**
     * Fetches webhooks from the database filtered by event code.
     * @param {string} eventCode - The event code to filter webhooks by.
     */
    public async fetchWebhooks(eventCode: string): Promise<Webhook[]> {
        const webhooks: Webhook[] = [];
        const client = await this.NewClient();
        try {
            const res = await client.query(`SELECT * FROM webhooks WHERE event_code = $1`, [eventCode]);
            res.rows.forEach((row: Webhook) => {
                webhooks.push(row);
            });
        } catch (err) {
            throw new Error(`💾: error fetching webhooks: ${err}`);
        } finally {
            logger.info(`💾: fetching ${eventCode} webhooks`);
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
            await client.query(`
            CREATE TABLE IF NOT EXISTS webhooks (
                id SERIAL PRIMARY KEY,
                event_code TEXT,
                post_url TEXT,
                include_info BOOLEAN DEFAULT FALSE,
                include_chat BOOLEAN DEFAULT FALSE,
                include_contact BOOLEAN DEFAULT FALSE,
                include_quoted_message BOOLEAN DEFAULT FALSE,
                include_order BOOLEAN DEFAULT FALSE,
                include_group_mentions BOOLEAN DEFAULT FALSE,
                include_mentions BOOLEAN DEFAULT FALSE,
                include_payment BOOLEAN DEFAULT FALSE,
                include_reactions BOOLEAN DEFAULT FALSE
            );
        `);
        } catch (err) {
            throw new Error(`💾: error recreating webhooks table: ${err}`);
        } finally {
            logger.info("💾: webhooks table recreated");
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