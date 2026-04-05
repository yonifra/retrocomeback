import { createClient } from "@/lib/supabase/server";
import type {
  Marketplace,
  MarketplaceWithPlugins,
  MarketplacePlugin,
  PluginWithDetails,
  PluginSkill,
  PluginAgent,
  PluginCommand,
} from "@/types";

/** Try to create a Supabase client; returns null if env vars are missing. */
async function getSupabase() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

// ─── Marketplace CRUD ───

/** Fetch all marketplaces for a user with plugin count */
export async function getUserMarketplaces(
  userId: string
): Promise<(Marketplace & { plugin_count: number })[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("marketplaces")
    .select(
      `
      *,
      marketplace_plugins(id)
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    display_name: row.display_name,
    description: row.description,
    version: row.version,
    owner_email: row.owner_email,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    plugin_count: row.marketplace_plugins?.length ?? 0,
  }));
}

/** Fetch a single marketplace with all plugins (deep join: skills, agents, commands) */
export async function getMarketplaceById(
  id: string
): Promise<MarketplaceWithPlugins | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplaces")
    .select(
      `
      *,
      marketplace_plugins(
        *,
        plugin_skills(*),
        plugin_agents(*),
        plugin_commands(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    display_name: row.display_name,
    description: row.description,
    version: row.version,
    owner_email: row.owner_email,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    plugins: (row.marketplace_plugins ?? [])
      .sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      )
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any): PluginWithDetails => ({
          id: p.id,
          marketplace_id: p.marketplace_id,
          name: p.name,
          description: p.description,
          version: p.version,
          author_name: p.author_name,
          author_email: p.author_email,
          homepage: p.homepage,
          category: p.category,
          tags: p.tags ?? [],
          keywords: p.keywords ?? [],
          sort_order: p.sort_order,
          created_at: p.created_at,
          updated_at: p.updated_at,
          skills: (p.plugin_skills ?? []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) =>
              a.sort_order - b.sort_order
          ),
          agents: (p.plugin_agents ?? []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) =>
              a.sort_order - b.sort_order
          ),
          commands: (p.plugin_commands ?? []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) =>
              a.sort_order - b.sort_order
          ),
        })
      ),
  };
}

/** Check marketplace name uniqueness for a user */
export async function getMarketplaceByName(
  userId: string,
  name: string
): Promise<Marketplace | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplaces")
    .select("*")
    .eq("user_id", userId)
    .eq("name", name)
    .single();

  if (error || !data) return null;
  return data as Marketplace;
}

/** Create a new marketplace */
export async function createMarketplace(data: {
  user_id: string;
  name: string;
  display_name: string;
  description: string;
  version: string;
  owner_email?: string;
}): Promise<Marketplace | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("marketplaces")
    .insert(data)
    .select()
    .single();

  if (error || !result) return null;
  return result as Marketplace;
}

/** Update marketplace metadata */
export async function updateMarketplace(
  id: string,
  data: Partial<{
    name: string;
    display_name: string;
    description: string;
    version: string;
    owner_email: string | null;
  }>
): Promise<Marketplace | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("marketplaces")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !result) return null;
  return result as Marketplace;
}

/** Delete a marketplace (cascades to plugins/skills) */
export async function deleteMarketplace(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("marketplaces").delete().eq("id", id);
  return !error;
}

/** Toggle published status */
export async function togglePublishMarketplace(
  id: string,
  publish: boolean
): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("marketplaces")
    .update({ is_published: publish })
    .eq("id", id);

  return !error;
}

/** Fetch all published marketplaces (for public browse page) */
export async function getPublishedMarketplaces(): Promise<
  (Marketplace & { plugin_count: number })[]
> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("marketplaces")
    .select(
      `
      *,
      marketplace_plugins(id)
    `
    )
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    display_name: row.display_name,
    description: row.description,
    version: row.version,
    owner_email: row.owner_email,
    is_published: row.is_published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    plugin_count: row.marketplace_plugins?.length ?? 0,
  }));
}

// ─── Plugin CRUD ───

/** Fetch a single plugin with skills, agents, commands */
export async function getPluginById(
  id: string
): Promise<PluginWithDetails | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("marketplace_plugins")
    .select(
      `
      *,
      plugin_skills(*),
      plugin_agents(*),
      plugin_commands(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return {
    id: row.id,
    marketplace_id: row.marketplace_id,
    name: row.name,
    description: row.description,
    version: row.version,
    author_name: row.author_name,
    author_email: row.author_email,
    homepage: row.homepage,
    category: row.category,
    tags: row.tags ?? [],
    keywords: row.keywords ?? [],
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    skills: (row.plugin_skills ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    ),
    agents: (row.plugin_agents ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    ),
    commands: (row.plugin_commands ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    ),
  };
}

/** Create a new plugin */
export async function createPlugin(data: {
  marketplace_id: string;
  name: string;
  description: string;
  version: string;
  author_name: string;
  author_email?: string;
  homepage?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
}): Promise<MarketplacePlugin | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("marketplace_plugins")
    .insert(data)
    .select()
    .single();

  if (error || !result) return null;
  return result as MarketplacePlugin;
}

/** Update plugin metadata */
export async function updatePlugin(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    version: string;
    author_name: string;
    author_email: string | null;
    homepage: string | null;
    category: string | null;
    tags: string[];
    keywords: string[];
  }>
): Promise<MarketplacePlugin | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("marketplace_plugins")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !result) return null;
  return result as MarketplacePlugin;
}

/** Delete a plugin (cascades) */
export async function deletePlugin(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("marketplace_plugins")
    .delete()
    .eq("id", id);
  return !error;
}

// ─── Skill CRUD ───

export async function createSkill(data: {
  plugin_id: string;
  name: string;
  description: string;
  disable_model_invocation?: boolean;
  content: string;
}): Promise<PluginSkill | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_skills")
    .insert(data)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginSkill;
}

export async function updateSkill(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    disable_model_invocation: boolean;
    content: string;
  }>
): Promise<PluginSkill | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_skills")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginSkill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("plugin_skills")
    .delete()
    .eq("id", id);
  return !error;
}

// ─── Agent CRUD ───

export async function createAgent(data: {
  plugin_id: string;
  name: string;
  description: string;
  content: string;
}): Promise<PluginAgent | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_agents")
    .insert(data)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginAgent;
}

export async function updateAgent(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    content: string;
  }>
): Promise<PluginAgent | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_agents")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginAgent;
}

export async function deleteAgent(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("plugin_agents")
    .delete()
    .eq("id", id);
  return !error;
}

// ─── Command CRUD ───

export async function createCommand(data: {
  plugin_id: string;
  name: string;
  content: string;
}): Promise<PluginCommand | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_commands")
    .insert(data)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginCommand;
}

export async function updateCommand(
  id: string,
  data: Partial<{
    name: string;
    content: string;
  }>
): Promise<PluginCommand | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: result, error } = await supabase
    .from("plugin_commands")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error || !result) return null;
  return result as PluginCommand;
}

export async function deleteCommand(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("plugin_commands")
    .delete()
    .eq("id", id);
  return !error;
}
