/**
 * DbClient class for interacting with a SQLite database.
 */
import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import {logger} from "../pkg/logger.ts";
import "dotenv/config";

class DbClient {
    private db: Database | null = null;

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
        const db = await this.getConnection();
        try {
            await db.run(`
              INSERT INTO webhooks (
                event_code,
                sender,
                post_url,
                auth_header,
                include_info,
                include_chat,
                include_contact,
                include_quoted_message,
                include_order,
                include_group_mentions,
                include_mentions,
                include_payment,
                include_reactions
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    webhook.event_code,
                    webhook.sender || "",
                    webhook.post_url,
                    webhook.auth_header,
                    webhook.include_info ? 1 : 0,
                    webhook.include_chat ? 1 : 0,
                    webhook.include_contact ? 1 : 0,
                    webhook.include_quoted_message ? 1 : 0,
                    webhook.include_order ? 1 : 0,
                    webhook.include_group_mentions ? 1 : 0,
                    webhook.include_mentions ? 1 : 0,
                    webhook.include_payment ? 1 : 0,
                    webhook.include_reactions ? 1 : 0,
                ]);
            logger.info(`💾: webhook with event_code=${webhook.event_code}, post_url=${webhook.post_url.trim()} inserted into database`);
        } catch (err) {
            throw new Error(`💾: error inserting webhook: ${err}`);
        }
    }

    /**
     * Removes a webhook from the database.
     * @param {string} id - The ID of the webhook to remove.
     */
    public async removeWebhook(id: string): Promise<void> {
        const db = await this.getConnection();
        try {
            await db.run(`DELETE FROM webhooks WHERE id = ?`, [id]);
            logger.info(`💾: webhook with id=${id} removed from database`);
        } catch (err) {
            throw new Error(`💾: error removing webhook: ${err}`);
        }
    }

    /**
     * Fetches all webhooks from the database.
     */
    public async fetchAllWebhooks(): Promise<Webhook[]> {
        const db = await this.getConnection();
        try {
            const webhooks = await db.all(`SELECT * FROM webhooks`);
            logger.info(`💾: webhooks fetched from database`);
            return webhooks.map(this.convertBooleans);
        } catch (err) {
            throw new Error(`💾: error fetching webhooks: ${err}`);
        }
    }

    /**
     * Fetches webhooks from the database filtered by event code.
     * @param {string} eventCode - The event code to filter webhooks by.
     */
    public async fetchWebhooks(eventCode: string): Promise<Webhook[]> {
        const db = await this.getConnection();
        try {
            const webhooks = await db.all(`SELECT * FROM webhooks WHERE event_code = ?`, [eventCode]);
            logger.info(`💾: webhooks with event_code=${eventCode} fetched from database`);
            return webhooks.map(this.convertBooleans);
        } catch (err) {
            throw new Error(`💾: error fetching webhooks: ${err}`);
        }
    }

    /**
     * Creates a new database connection.
     * @private
     */
    private async getConnection(): Promise<Database> {
        if (!this.db) {
            this.db = await open({
                filename: './storage/database.sqlite',
                driver: sqlite3.Database
            });
        }
        return this.db;
    }

    /**
     * Creates the webhook table in the database if it doesn't exist.
     * @private
     */
    private async createWebhookTable() {
        const db = await this.getConnection();
        try {
            await db.exec(`
            CREATE TABLE IF NOT EXISTS webhooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_code TEXT,
                sender TEXT,
                post_url TEXT,
                auth_header TEXT,
                include_info INTEGER DEFAULT 0,
                include_chat INTEGER DEFAULT 0,
                include_contact INTEGER DEFAULT 0,
                include_quoted_message INTEGER DEFAULT 0,
                include_order INTEGER DEFAULT 0,
                include_group_mentions INTEGER DEFAULT 0,
                include_mentions INTEGER DEFAULT 0,
                include_payment INTEGER DEFAULT 0,
                include_reactions INTEGER DEFAULT 0
            );
        `);
            logger.info("💾: webhooks table recreated");
        } catch (err) {
            throw new Error(`💾: error recreating webhooks table: ${err}`);
        }
    }

    /**
     * Converts INTEGER (0/1) values to booleans for webhook objects
     * @private
     */
    private convertBooleans(webhook: any): Webhook {
        return {
            ...webhook,
            include_info: !!webhook.include_info,
            include_chat: !!webhook.include_chat,
            include_contact: !!webhook.include_contact,
            include_quoted_message: !!webhook.include_quoted_message,
            include_order: !!webhook.include_order,
            include_group_mentions: !!webhook.include_group_mentions,
            include_mentions: !!webhook.include_mentions,
            include_payment: !!webhook.include_payment,
            include_reactions: !!webhook.include_reactions,
        };
    }
}

export default DbClient;