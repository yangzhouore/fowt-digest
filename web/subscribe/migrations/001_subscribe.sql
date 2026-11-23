BEGIN;

CREATE TABLE subscribers (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(email) AND length(email) <= 254),
  locale text NOT NULL CHECK (locale IN ('en', 'zh')),
  status text NOT NULL CHECK (status IN ('active', 'unsubscribed')),
  confirmed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  manage_version uuid NOT NULL,
  preference_version uuid NOT NULL,
  news boolean NOT NULL,
  research boolean NOT NULL,
  company_ids text[] NOT NULL,
  CHECK ((status = 'active') = (news OR research OR cardinality(company_ids) > 0))
);

CREATE TABLE subscription_confirmations (
  email text PRIMARY KEY CHECK (email = lower(email) AND length(email) <= 254),
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  locale text NOT NULL CHECK (locale IN ('en', 'zh')),
  news boolean NOT NULL,
  research boolean NOT NULL,
  company_ids text[] NOT NULL,
  requested_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at > requested_at),
  sent_at timestamptz CHECK (sent_at >= requested_at),
  consumed_at timestamptz,
  CHECK (consumed_at IS NULL OR sent_at IS NOT NULL),
  CHECK (news OR research OR cardinality(company_ids) > 0)
);

CREATE TABLE subscription_deliveries (
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('news', 'research', 'company')),
  digest_key text NOT NULL,
  period_end date NOT NULL,
  company_ids text[] NOT NULL,
  item_ids text[] NOT NULL,
  status text NOT NULL CHECK (status IN ('sending', 'sent', 'failed', 'uncertain', 'skipped')),
  provider_message_id text,
  started_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  sent_at timestamptz,
  detail text,
  PRIMARY KEY (subscriber_id, kind, digest_key),
  UNIQUE (subscriber_id, kind, period_end),
  CHECK ((status = 'sent' AND provider_message_id IS NOT NULL AND length(btrim(provider_message_id)) > 0 AND sent_at IS NOT NULL)
    OR (status <> 'sent' AND provider_message_id IS NULL AND sent_at IS NULL))
);

CREATE INDEX subscription_active_subscribers ON subscribers (id) WHERE status = 'active';
CREATE INDEX subscription_confirmation_expiry ON subscription_confirmations (expires_at);
CREATE INDEX subscription_sending_started ON subscription_deliveries (started_at) WHERE status = 'sending';
CREATE INDEX subscription_delivery_attention ON subscription_deliveries (period_end)
  WHERE status IN ('sending', 'failed', 'uncertain');

COMMIT;
