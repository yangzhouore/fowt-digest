import { randomUUID } from "node:crypto";
import type { Locale, Preferences } from "./preferences";
import type { Grant } from "./tokens";

export type DigestKind = "news" | "research" | "company";
export type Delivery = {
  kind: DigestKind;
  key: string;
  periodEnd: string;
  itemIds: string[];
  companyIds: string[];
  skipReason?: "no_current_edition" | "no_reviewed_developments";
};
export type Subscriber = Grant & { email: string; locale: Locale; preferenceVersion: string; preferences: Preferences };
export type Query = (statement: string, params: unknown[]) => Promise<Record<string, unknown>[]>;

const subscriberColumns = "id, manage_version, preference_version, email, locale, news, research, company_ids";

function preferences(row: Record<string, unknown>): Preferences {
  return { news: row.news as boolean, research: row.research as boolean, companyIds: row.company_ids as string[] };
}

function subscriber(row: Record<string, unknown>): Subscriber {
  return {
    id: row.id as string, version: row.manage_version as string, preferenceVersion: row.preference_version as string,
    email: row.email as string, locale: row.locale as Locale, preferences: preferences(row),
  };
}

export function createStore(query: Query) {
  return {
    async reserveConfirmation(email: string, hash: string, requested: Preferences, locale: Locale, now: Date, expiry: Date) {
      const rows = await query(`
        INSERT INTO subscription_confirmations (email, token_hash, news, research, company_ids, locale, requested_at, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET token_hash = EXCLUDED.token_hash, news = EXCLUDED.news, research = EXCLUDED.research,
          company_ids = EXCLUDED.company_ids, locale = EXCLUDED.locale, requested_at = EXCLUDED.requested_at,
          expires_at = EXCLUDED.expires_at, sent_at = NULL, consumed_at = NULL
        WHERE subscription_confirmations.requested_at <= EXCLUDED.requested_at - interval '30 minutes'
        RETURNING email
      `, [email, hash, requested.news, requested.research, requested.companyIds, locale, now, expiry]);
      return rows.length === 1;
    },

    async markConfirmationSent(hash: string, now: Date) {
      const rows = await query(`
        UPDATE subscription_confirmations SET sent_at = greatest(requested_at, $2)
        WHERE token_hash = $1 AND sent_at IS NULL RETURNING token_hash
      `, [hash, now]);
      return rows.length === 1;
    },

    async confirm(hash: string, now: Date) {
      const [row] = await query(`
        WITH request AS (
          UPDATE subscription_confirmations SET consumed_at = $2
          WHERE token_hash = $1 AND sent_at IS NOT NULL AND consumed_at IS NULL AND expires_at > $2
          RETURNING email, locale, news, research, company_ids, requested_at
        )
        INSERT INTO subscribers (id, email, locale, status, confirmed_at, created_at, updated_at,
          manage_version, preference_version, news, research, company_ids)
        SELECT $3, email, locale, 'active', $2, $2, $2, $4, $4, news, research, company_ids FROM request
        ON CONFLICT (email) DO UPDATE SET locale = EXCLUDED.locale, status = 'active', confirmed_at = EXCLUDED.confirmed_at,
          updated_at = EXCLUDED.updated_at, manage_version = EXCLUDED.manage_version,
          preference_version = EXCLUDED.preference_version, news = EXCLUDED.news, research = EXCLUDED.research,
          company_ids = EXCLUDED.company_ids
        WHERE subscribers.status = 'active' OR subscribers.updated_at < (SELECT requested_at FROM request)
        RETURNING id, manage_version
      `, [hash, now, randomUUID(), randomUUID()]);
      return row ? { id: row.id as string, version: row.manage_version as string } : null;
    },

    async load(grant: Grant) {
      const [row] = await query(`
        SELECT news, research, company_ids, locale FROM subscribers
        WHERE id = $1 AND manage_version = $2 AND status = 'active'
      `, [grant.id, grant.version]);
      return row ? { preferences: preferences(row), locale: row.locale as Locale } : null;
    },

    async update(grant: Grant, requested: Preferences, locale: Locale, now: Date) {
      const rows = await query(`
        UPDATE subscribers SET news = $3, research = $4, company_ids = $5, locale = $6, updated_at = $7, preference_version = $8
        WHERE id = $1 AND manage_version = $2 AND status = 'active' RETURNING id
      `, [grant.id, grant.version, requested.news, requested.research, requested.companyIds, locale, now, randomUUID()]);
      return rows.length === 1;
    },

    async unsubscribe(grant: Grant, now: Date) {
      const rows = await query(`
        UPDATE subscribers SET status = 'unsubscribed', news = false, research = false, company_ids = '{}',
          updated_at = $3, manage_version = $4, preference_version = $4
        WHERE id = $1 AND manage_version = $2 AND status = 'active' RETURNING id
      `, [grant.id, grant.version, now, randomUUID()]);
      return rows.length === 1;
    },

    async active(after: string | null, confirmedBefore: Date) {
      const rows = await query(`
        SELECT ${subscriberColumns} FROM subscribers
        WHERE status = 'active' AND ($1::uuid IS NULL OR id > $1) AND confirmed_at < $2
        ORDER BY id LIMIT 100
      `, [after, confirmedBefore]);
      return rows.map(subscriber);
    },

    async claim(recipient: Subscriber, delivery: Delivery, now: Date, preparationFailed = false) {
      const status = delivery.skipReason ? "skipped" : preparationFailed ? "failed" : "sending";
      const detail = delivery.skipReason ?? (preparationFailed ? "local_preparation_failed" : null);
      const params = [recipient.id, delivery.kind, delivery.key, delivery.periodEnd, delivery.companyIds, delivery.itemIds,
        now, recipient.preferenceVersion, status, detail];
      const rows = await query(`
        INSERT INTO subscription_deliveries (subscriber_id, kind, digest_key, period_end, company_ids, item_ids,
          started_at, updated_at, status, detail)
        SELECT id, $2, $3, $4, $5, $6, $7, $7, $9, $10
        FROM (SELECT id FROM subscribers WHERE id = $1 AND preference_version = $8 AND status = 'active' FOR SHARE) AS eligible
        ON CONFLICT DO NOTHING RETURNING subscriber_id
      `, params);
      if (rows.length) return true;
      if (status !== "sending") return false;
      const retried = await query(`
        UPDATE subscription_deliveries AS d SET status = 'sending', started_at = $7, updated_at = $7, detail = NULL
        FROM (SELECT id FROM subscribers WHERE id = $1 AND preference_version = $8 AND status = 'active' FOR SHARE) AS eligible
        WHERE d.subscriber_id = eligible.id
          AND d.kind = $2 AND d.digest_key = $3 AND d.period_end = $4
          AND d.company_ids = $5 AND d.item_ids = $6 AND d.status = 'failed'
        RETURNING d.subscriber_id
      `, params.slice(0, 8));
      return retried.length === 1;
    },

    async finish(recipient: Subscriber, delivery: Delivery, now: Date,
      outcome: { status: "sent" | "failed" | "uncertain"; providerId?: string; detail?: string }) {
      await query(`
        UPDATE subscription_deliveries SET status = $4::text, provider_message_id = $5, updated_at = $6,
          sent_at = CASE WHEN $4 = 'sent' THEN $6::timestamptz END, detail = $7
        WHERE subscriber_id = $1 AND kind = $2 AND digest_key = $3 AND status = 'sending'
      `, [recipient.id, delivery.kind, delivery.key, outcome.status, outcome.providerId ?? null, now, outcome.detail ?? null]);
    },

    async flagAbandoned(now: Date) {
      await query(`
        UPDATE subscription_deliveries SET status = 'uncertain', updated_at = $1, detail = 'worker_interrupted'
        WHERE status = 'sending' AND started_at < $1::timestamptz - interval '15 minutes'
      `, [now]);
    },

    async unresolved(periodEnd: string) {
      const [row] = await query(`
        SELECT count(*)::integer AS count FROM subscription_deliveries
        WHERE period_end = $1 AND status IN ('sending', 'failed', 'uncertain')
      `, [periodEnd]);
      return row.count as number;
    },

    async clearExpiredConfirmations(now: Date) {
      await query("DELETE FROM subscription_confirmations WHERE expires_at <= $1", [now]);
    },
  };
}

export type SubscriptionStore = ReturnType<typeof createStore>;
