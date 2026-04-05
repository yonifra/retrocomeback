import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type {
  Marketplace,
  MarketplaceWithPlugins,
  MarketplacePlugin,
  PluginWithDetails,
  PluginSkill,
  PluginAgent,
  PluginCommand,
} from "@/types";

function isConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID
  );
}

function now(): string {
  return new Date().toISOString();
}

// ─── Marketplace CRUD ───

/** Fetch all marketplaces for a user with plugin count */
export async function getUserMarketplaces(
  userId: string,
): Promise<(Marketplace & { plugin_count: number })[]> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("marketplaces")
      .where("user_id", "==", userId)
      .orderBy("updated_at", "desc")
      .get();

    const results: (Marketplace & { plugin_count: number })[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const pluginsSnap = await doc.ref.collection("plugins").count().get();
      results.push({
        id: doc.id,
        ...data,
        plugin_count: pluginsSnap.data().count,
      } as Marketplace & { plugin_count: number });
    }
    return results;
  } catch (error) {
    console.error("Error fetching user marketplaces:", error);
    return [];
  }
}

/** Fetch a single marketplace with all plugins (deep: skills, agents, commands) */
export async function getMarketplaceById(
  id: string,
): Promise<MarketplaceWithPlugins | null> {
  if (!isConfigured()) return null;

  try {
    const doc = await adminDb.collection("marketplaces").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    const pluginsSnap = await doc.ref
      .collection("plugins")
      .orderBy("sort_order")
      .get();

    const plugins: PluginWithDetails[] = [];
    for (const pDoc of pluginsSnap.docs) {
      const pData = pDoc.data();

      const [skillsSnap, agentsSnap, commandsSnap] = await Promise.all([
        pDoc.ref.collection("skills").orderBy("sort_order").get(),
        pDoc.ref.collection("agents").orderBy("sort_order").get(),
        pDoc.ref.collection("commands").orderBy("sort_order").get(),
      ]);

      plugins.push({
        id: pDoc.id,
        marketplace_id: id,
        ...pData,
        tags: pData.tags ?? [],
        keywords: pData.keywords ?? [],
        skills: skillsSnap.docs.map((d) => ({ id: d.id, plugin_id: pDoc.id, ...d.data() })) as PluginSkill[],
        agents: agentsSnap.docs.map((d) => ({ id: d.id, plugin_id: pDoc.id, ...d.data() })) as PluginAgent[],
        commands: commandsSnap.docs.map((d) => ({ id: d.id, plugin_id: pDoc.id, ...d.data() })) as PluginCommand[],
      } as PluginWithDetails);
    }

    return {
      id: doc.id,
      ...data,
      plugins,
    } as MarketplaceWithPlugins;
  } catch (error) {
    console.error("Error fetching marketplace by ID:", error);
    return null;
  }
}

/** Check marketplace name uniqueness for a user */
export async function getMarketplaceByName(
  userId: string,
  name: string,
): Promise<Marketplace | null> {
  if (!isConfigured()) return null;

  try {
    const snap = await adminDb
      .collection("marketplaces")
      .where("user_id", "==", userId)
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Marketplace;
  } catch {
    return null;
  }
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
  if (!isConfigured()) return null;

  try {
    const ts = now();
    const docRef = await adminDb.collection("marketplaces").add({
      ...data,
      owner_email: data.owner_email ?? null,
      is_published: false,
      created_at: ts,
      updated_at: ts,
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Marketplace;
  } catch (error) {
    console.error("Error creating marketplace:", error);
    return null;
  }
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
  }>,
): Promise<Marketplace | null> {
  if (!isConfigured()) return null;

  try {
    const ref = adminDb.collection("marketplaces").doc(id);
    await ref.update({ ...data, updated_at: now() });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Marketplace;
  } catch (error) {
    console.error("Error updating marketplace:", error);
    return null;
  }
}

/** Delete a marketplace (manually cascades to plugins subcollection) */
export async function deleteMarketplace(id: string): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const ref = adminDb.collection("marketplaces").doc(id);

    // Delete all plugins and their subcollections
    const pluginsSnap = await ref.collection("plugins").get();
    for (const pDoc of pluginsSnap.docs) {
      await deletePluginSubcollections(pDoc.ref);
      await pDoc.ref.delete();
    }

    await ref.delete();
    return true;
  } catch (error) {
    console.error("Error deleting marketplace:", error);
    return false;
  }
}

/** Toggle published status */
export async function togglePublishMarketplace(
  id: string,
  publish: boolean,
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    await adminDb
      .collection("marketplaces")
      .doc(id)
      .update({ is_published: publish, updated_at: now() });
    return true;
  } catch {
    return false;
  }
}

/** Fetch all published marketplaces */
export async function getPublishedMarketplaces(): Promise<
  (Marketplace & { plugin_count: number })[]
> {
  if (!isConfigured()) return [];

  try {
    const snap = await adminDb
      .collection("marketplaces")
      .where("is_published", "==", true)
      .orderBy("updated_at", "desc")
      .get();

    const results: (Marketplace & { plugin_count: number })[] = [];
    for (const doc of snap.docs) {
      const data = doc.data();
      const pluginsSnap = await doc.ref.collection("plugins").count().get();
      results.push({
        id: doc.id,
        ...data,
        plugin_count: pluginsSnap.data().count,
      } as Marketplace & { plugin_count: number });
    }
    return results;
  } catch {
    return [];
  }
}

// ─── Plugin CRUD ───

/** Fetch a single plugin with skills, agents, commands */
export async function getPluginById(
  id: string,
  marketplaceId?: string,
): Promise<PluginWithDetails | null> {
  if (!isConfigured()) return null;

  try {
    // If we know the marketplace, access directly
    if (marketplaceId) {
      const ref = adminDb
        .collection("marketplaces")
        .doc(marketplaceId)
        .collection("plugins")
        .doc(id);

      const doc = await ref.get();
      if (!doc.exists) return null;

      return await buildPluginWithDetails(doc, marketplaceId);
    }

    // Otherwise, search all marketplaces (less efficient)
    const marketplacesSnap = await adminDb.collection("marketplaces").get();
    for (const mDoc of marketplacesSnap.docs) {
      const pluginDoc = await mDoc.ref.collection("plugins").doc(id).get();
      if (pluginDoc.exists) {
        return await buildPluginWithDetails(pluginDoc, mDoc.id);
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching plugin by ID:", error);
    return null;
  }
}

async function buildPluginWithDetails(
  doc: FirebaseFirestore.DocumentSnapshot,
  marketplaceId: string,
): Promise<PluginWithDetails> {
  const data = doc.data()!;

  const [skillsSnap, agentsSnap, commandsSnap] = await Promise.all([
    doc.ref.collection("skills").orderBy("sort_order").get(),
    doc.ref.collection("agents").orderBy("sort_order").get(),
    doc.ref.collection("commands").orderBy("sort_order").get(),
  ]);

  return {
    id: doc.id,
    marketplace_id: marketplaceId,
    ...data,
    tags: data.tags ?? [],
    keywords: data.keywords ?? [],
    skills: skillsSnap.docs.map((d) => ({ id: d.id, plugin_id: doc.id, ...d.data() })) as PluginSkill[],
    agents: agentsSnap.docs.map((d) => ({ id: d.id, plugin_id: doc.id, ...d.data() })) as PluginAgent[],
    commands: commandsSnap.docs.map((d) => ({ id: d.id, plugin_id: doc.id, ...d.data() })) as PluginCommand[],
  } as PluginWithDetails;
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
  if (!isConfigured()) return null;

  try {
    const ts = now();
    const { marketplace_id, ...rest } = data;
    const ref = adminDb
      .collection("marketplaces")
      .doc(marketplace_id)
      .collection("plugins");

    const docRef = await ref.add({
      ...rest,
      tags: rest.tags ?? [],
      keywords: rest.keywords ?? [],
      sort_order: 0,
      created_at: ts,
      updated_at: ts,
    });

    const doc = await docRef.get();
    return { id: doc.id, marketplace_id, ...doc.data() } as MarketplacePlugin;
  } catch (error) {
    console.error("Error creating plugin:", error);
    return null;
  }
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
  }>,
  marketplaceId?: string,
): Promise<MarketplacePlugin | null> {
  if (!isConfigured()) return null;

  try {
    const plugin = await getPluginById(id, marketplaceId);
    if (!plugin) return null;

    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(id);

    await ref.update({ ...data, updated_at: now() });
    const doc = await ref.get();
    return { id: doc.id, marketplace_id: plugin.marketplace_id, ...doc.data() } as MarketplacePlugin;
  } catch (error) {
    console.error("Error updating plugin:", error);
    return null;
  }
}

/** Delete a plugin (cascades subcollections) */
export async function deletePlugin(
  id: string,
  marketplaceId?: string,
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const plugin = await getPluginById(id, marketplaceId);
    if (!plugin) return false;

    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(id);

    await deletePluginSubcollections(ref);
    await ref.delete();
    return true;
  } catch {
    return false;
  }
}

async function deletePluginSubcollections(
  ref: FirebaseFirestore.DocumentReference,
): Promise<void> {
  const collections = ["skills", "agents", "commands"];
  for (const col of collections) {
    const snap = await ref.collection(col).get();
    for (const doc of snap.docs) {
      await doc.ref.delete();
    }
  }
}

// ─── Skill CRUD ───

export async function createSkill(data: {
  plugin_id: string;
  name: string;
  description: string;
  disable_model_invocation?: boolean;
  content: string;
  marketplace_id?: string;
}): Promise<PluginSkill | null> {
  if (!isConfigured()) return null;

  try {
    const { plugin_id, marketplace_id, ...rest } = data;
    const plugin = await getPluginById(plugin_id, marketplace_id);
    if (!plugin) return null;

    const ts = now();
    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(plugin_id)
      .collection("skills");

    const docRef = await ref.add({
      ...rest,
      disable_model_invocation: rest.disable_model_invocation ?? true,
      sort_order: 0,
      created_at: ts,
      updated_at: ts,
    });
    const doc = await docRef.get();
    return { id: doc.id, plugin_id, ...doc.data() } as PluginSkill;
  } catch (error) {
    console.error("Error creating skill:", error);
    return null;
  }
}

export async function updateSkill(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    disable_model_invocation: boolean;
    content: string;
  }>,
  pluginId?: string,
  marketplaceId?: string,
): Promise<PluginSkill | null> {
  if (!isConfigured()) return null;

  try {
    // Find the skill's parent path
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return null;

    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("skills")
      .doc(id);

    await ref.update({ ...data, updated_at: now() });
    const doc = await ref.get();
    return { id: doc.id, plugin_id: pluginId, ...doc.data() } as PluginSkill;
  } catch (error) {
    console.error("Error updating skill:", error);
    return null;
  }
}

export async function deleteSkill(
  id: string,
  pluginId?: string,
  marketplaceId?: string,
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return false;

    await adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("skills")
      .doc(id)
      .delete();
    return true;
  } catch {
    return false;
  }
}

// ─── Agent CRUD ───

export async function createAgent(data: {
  plugin_id: string;
  name: string;
  description: string;
  content: string;
  marketplace_id?: string;
}): Promise<PluginAgent | null> {
  if (!isConfigured()) return null;

  try {
    const { plugin_id, marketplace_id, ...rest } = data;
    const plugin = await getPluginById(plugin_id, marketplace_id);
    if (!plugin) return null;

    const ts = now();
    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(plugin_id)
      .collection("agents");

    const docRef = await ref.add({ ...rest, sort_order: 0, created_at: ts, updated_at: ts });
    const doc = await docRef.get();
    return { id: doc.id, plugin_id, ...doc.data() } as PluginAgent;
  } catch (error) {
    console.error("Error creating agent:", error);
    return null;
  }
}

export async function updateAgent(
  id: string,
  data: Partial<{ name: string; description: string; content: string }>,
  pluginId?: string,
  marketplaceId?: string,
): Promise<PluginAgent | null> {
  if (!isConfigured()) return null;

  try {
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return null;

    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("agents")
      .doc(id);

    await ref.update({ ...data, updated_at: now() });
    const doc = await ref.get();
    return { id: doc.id, plugin_id: pluginId, ...doc.data() } as PluginAgent;
  } catch (error) {
    console.error("Error updating agent:", error);
    return null;
  }
}

export async function deleteAgent(
  id: string,
  pluginId?: string,
  marketplaceId?: string,
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return false;

    await adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("agents")
      .doc(id)
      .delete();
    return true;
  } catch {
    return false;
  }
}

// ─── Command CRUD ───

export async function createCommand(data: {
  plugin_id: string;
  name: string;
  content: string;
  marketplace_id?: string;
}): Promise<PluginCommand | null> {
  if (!isConfigured()) return null;

  try {
    const { plugin_id, marketplace_id, ...rest } = data;
    const plugin = await getPluginById(plugin_id, marketplace_id);
    if (!plugin) return null;

    const ts = now();
    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(plugin_id)
      .collection("commands");

    const docRef = await ref.add({ ...rest, sort_order: 0, created_at: ts, updated_at: ts });
    const doc = await docRef.get();
    return { id: doc.id, plugin_id, ...doc.data() } as PluginCommand;
  } catch (error) {
    console.error("Error creating command:", error);
    return null;
  }
}

export async function updateCommand(
  id: string,
  data: Partial<{ name: string; content: string }>,
  pluginId?: string,
  marketplaceId?: string,
): Promise<PluginCommand | null> {
  if (!isConfigured()) return null;

  try {
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return null;

    const ref = adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("commands")
      .doc(id);

    await ref.update({ ...data, updated_at: now() });
    const doc = await ref.get();
    return { id: doc.id, plugin_id: pluginId, ...doc.data() } as PluginCommand;
  } catch (error) {
    console.error("Error updating command:", error);
    return null;
  }
}

export async function deleteCommand(
  id: string,
  pluginId?: string,
  marketplaceId?: string,
): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const plugin = pluginId ? await getPluginById(pluginId, marketplaceId) : null;
    if (!plugin || !pluginId) return false;

    await adminDb
      .collection("marketplaces")
      .doc(plugin.marketplace_id)
      .collection("plugins")
      .doc(pluginId)
      .collection("commands")
      .doc(id)
      .delete();
    return true;
  } catch {
    return false;
  }
}
