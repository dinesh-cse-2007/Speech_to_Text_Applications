/*
# Create transcriptions table (single-tenant, no auth)

1. New Tables
- `transcriptions`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short label for the transcription session
  - `content` (text, not null) — the full transcribed text
  - `language` (text, default 'en-US') — language code used during recording
  - `duration_seconds` (integer, default 0) — length of the recording in seconds
  - `word_count` (integer, default 0) — number of words transcribed
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `transcriptions`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'en-US',
  duration_seconds integer NOT NULL DEFAULT 0,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transcriptions" ON transcriptions;
CREATE POLICY "anon_select_transcriptions" ON transcriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transcriptions" ON transcriptions;
CREATE POLICY "anon_insert_transcriptions" ON transcriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transcriptions" ON transcriptions;
CREATE POLICY "anon_update_transcriptions" ON transcriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transcriptions" ON transcriptions;
CREATE POLICY "anon_delete_transcriptions" ON transcriptions FOR DELETE
  TO anon, authenticated USING (true);
