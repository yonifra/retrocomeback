-- Marketplace feature tables
-- User-created AI plugin marketplaces for Claude Code

-- User-created marketplaces
CREATE TABLE marketplaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,             -- kebab-case slug (e.g. "my-dev-tools")
  display_name  TEXT NOT NULL,             -- Human-readable name
  description   TEXT NOT NULL DEFAULT '',
  version       TEXT NOT NULL DEFAULT '1.0.0',
  owner_email   TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,  -- public visibility toggle
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Plugins within a marketplace
CREATE TABLE marketplace_plugins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_id  UUID NOT NULL REFERENCES marketplaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,           -- kebab-case (e.g. "code-reviewer")
  description     TEXT NOT NULL DEFAULT '',
  version         TEXT NOT NULL DEFAULT '1.0.0',
  author_name     TEXT NOT NULL DEFAULT '',
  author_email    TEXT,
  homepage        TEXT,
  category        TEXT,
  tags            TEXT[] DEFAULT '{}',
  keywords        TEXT[] DEFAULT '{}',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(marketplace_id, name)
);

-- Skills within a plugin (SKILL.md files)
CREATE TABLE plugin_skills (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id                 UUID NOT NULL REFERENCES marketplace_plugins(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,           -- kebab-case, used as directory name
  description               TEXT NOT NULL DEFAULT '',
  disable_model_invocation  BOOLEAN NOT NULL DEFAULT TRUE,
  content                   TEXT NOT NULL DEFAULT '', -- The markdown body (after frontmatter)
  sort_order                INT NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, name)
);

-- Agents within a plugin (optional .md files)
CREATE TABLE plugin_agents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id   UUID NOT NULL REFERENCES marketplace_plugins(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, name)
);

-- Commands within a plugin (optional .md files)
CREATE TABLE plugin_commands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id   UUID NOT NULL REFERENCES marketplace_plugins(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, name)
);

-- ─── Row Level Security ───

ALTER TABLE marketplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_commands ENABLE ROW LEVEL SECURITY;

-- Marketplace: owner-only access + public read for published
CREATE POLICY "Users can manage own marketplaces" ON marketplaces
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published marketplaces" ON marketplaces
  FOR SELECT USING (is_published = TRUE);

-- Plugins: accessible if user owns the parent marketplace
CREATE POLICY "Users can manage own plugins" ON marketplace_plugins
  FOR ALL USING (
    marketplace_id IN (SELECT id FROM marketplaces WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can view plugins of published marketplaces" ON marketplace_plugins
  FOR SELECT USING (
    marketplace_id IN (SELECT id FROM marketplaces WHERE is_published = TRUE)
  );

-- Skills: accessible if user owns the parent marketplace (via plugin)
CREATE POLICY "Users can manage own skills" ON plugin_skills
  FOR ALL USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view skills of published marketplaces" ON plugin_skills
  FOR SELECT USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.is_published = TRUE
    )
  );

-- Agents: accessible if user owns the parent marketplace (via plugin)
CREATE POLICY "Users can manage own agents" ON plugin_agents
  FOR ALL USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view agents of published marketplaces" ON plugin_agents
  FOR SELECT USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.is_published = TRUE
    )
  );

-- Commands: accessible if user owns the parent marketplace (via plugin)
CREATE POLICY "Users can manage own commands" ON plugin_commands
  FOR ALL USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view commands of published marketplaces" ON plugin_commands
  FOR SELECT USING (
    plugin_id IN (
      SELECT mp.id FROM marketplace_plugins mp
      JOIN marketplaces m ON mp.marketplace_id = m.id
      WHERE m.is_published = TRUE
    )
  );

-- ─── Auto-update triggers ───

CREATE TRIGGER marketplaces_updated_at
  BEFORE UPDATE ON marketplaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER marketplace_plugins_updated_at
  BEFORE UPDATE ON marketplace_plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER plugin_skills_updated_at
  BEFORE UPDATE ON plugin_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER plugin_agents_updated_at
  BEFORE UPDATE ON plugin_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER plugin_commands_updated_at
  BEFORE UPDATE ON plugin_commands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
