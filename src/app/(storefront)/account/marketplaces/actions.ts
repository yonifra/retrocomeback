"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/firebase/session";
import {
  createMarketplace,
  updateMarketplace,
  deleteMarketplace,
  togglePublishMarketplace,
  getMarketplaceByName,
  createPlugin,
  updatePlugin,
  deletePlugin,
  createSkill,
  updateSkill,
  deleteSkill,
  createAgent,
  updateAgent,
  deleteAgent,
  createCommand,
  updateCommand,
  deleteCommand,
} from "@/lib/queries/marketplaces";
import {
  marketplaceSchema,
  pluginSchema,
  skillSchema,
  agentSchema,
  commandSchema,
} from "@/lib/validators/marketplace";

export type ActionResult = {
  error?: string;
};

// ─── Marketplace Actions ───

export async function createMarketplaceAction(
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    name: formData.get("name") as string,
    display_name: formData.get("display_name") as string,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    owner_email: formData.get("owner_email") as string,
  };

  const parsed = marketplaceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be logged in" };
  }

  // Check for duplicate name
  const existing = await getMarketplaceByName(user.uid, parsed.data.name);
  if (existing) {
    return { error: "A marketplace with this name already exists" };
  }

  const marketplace = await createMarketplace({
    user_id: user.uid,
    name: parsed.data.name,
    display_name: parsed.data.display_name,
    description: parsed.data.description,
    version: parsed.data.version,
    owner_email: parsed.data.owner_email || undefined,
  });

  if (!marketplace) {
    return { error: "Failed to create marketplace" };
  }

  revalidatePath("/account/marketplaces");
  redirect(`/account/marketplaces/${marketplace.id}`);
}

export async function updateMarketplaceAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const rawData = {
    name: formData.get("name") as string,
    display_name: formData.get("display_name") as string,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    owner_email: formData.get("owner_email") as string,
  };

  const parsed = marketplaceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await updateMarketplace(id, {
    name: parsed.data.name,
    display_name: parsed.data.display_name,
    description: parsed.data.description,
    version: parsed.data.version,
    owner_email: parsed.data.owner_email || null,
  });

  if (!result) {
    return { error: "Failed to update marketplace" };
  }

  revalidatePath(`/account/marketplaces/${id}`);
  return {};
}

export async function deleteMarketplaceAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;

  const success = await deleteMarketplace(id);
  if (!success) {
    return { error: "Failed to delete marketplace" };
  }

  revalidatePath("/account/marketplaces");
  redirect("/account/marketplaces");
}

export async function togglePublishAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const publish = formData.get("publish") === "true";

  const success = await togglePublishMarketplace(id, publish);
  if (!success) {
    return { error: "Failed to update publish status" };
  }

  revalidatePath(`/account/marketplaces/${id}`);
  return {};
}

// ─── Plugin Actions ───

export async function createPluginAction(
  formData: FormData
): Promise<ActionResult> {
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    author_name: formData.get("author_name") as string,
    author_email: formData.get("author_email") as string,
    homepage: formData.get("homepage") as string,
    category: formData.get("category") as string,
    tags: formData.get("tags") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = pluginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const keywords = parsed.data.keywords
    ? parsed.data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const plugin = await createPlugin({
    marketplace_id: marketplaceId,
    name: parsed.data.name,
    description: parsed.data.description,
    version: parsed.data.version,
    author_name: parsed.data.author_name,
    author_email: parsed.data.author_email || undefined,
    homepage: parsed.data.homepage || undefined,
    category: parsed.data.category || undefined,
    tags,
    keywords,
  });

  if (!plugin) {
    return { error: "Failed to create plugin" };
  }

  revalidatePath(`/account/marketplaces/${marketplaceId}`);
  redirect(
    `/account/marketplaces/${marketplaceId}/plugins/${plugin.id}`
  );
}

export async function updatePluginAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    version: formData.get("version") as string,
    author_name: formData.get("author_name") as string,
    author_email: formData.get("author_email") as string,
    homepage: formData.get("homepage") as string,
    category: formData.get("category") as string,
    tags: formData.get("tags") as string,
    keywords: formData.get("keywords") as string,
  };

  const parsed = pluginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tags = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const keywords = parsed.data.keywords
    ? parsed.data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const result = await updatePlugin(
    id,
    {
      name: parsed.data.name,
      description: parsed.data.description,
      version: parsed.data.version,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || null,
      homepage: parsed.data.homepage || null,
      category: parsed.data.category || null,
      tags,
      keywords,
    },
    marketplaceId,
  );

  if (!result) {
    return { error: "Failed to update plugin" };
  }

  revalidatePath(`/account/marketplaces/${marketplaceId}`);
  return {};
}

export async function deletePluginAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;

  const success = await deletePlugin(id, marketplaceId);
  if (!success) {
    return { error: "Failed to delete plugin" };
  }

  revalidatePath(`/account/marketplaces/${marketplaceId}`);
  redirect(`/account/marketplaces/${marketplaceId}`);
}

// ─── Skill Actions ───

export async function createSkillAction(
  formData: FormData
): Promise<ActionResult> {
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    disable_model_invocation: formData.get("disable_model_invocation") === "on",
    content: formData.get("content") as string,
  };

  const parsed = skillSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await createSkill({
    plugin_id: pluginId,
    name: parsed.data.name,
    description: parsed.data.description,
    disable_model_invocation: parsed.data.disable_model_invocation,
    content: parsed.data.content,
    marketplace_id: marketplaceId,
  });

  if (!result) {
    return { error: "Failed to create skill" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function updateSkillAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    disable_model_invocation: formData.get("disable_model_invocation") === "on",
    content: formData.get("content") as string,
  };

  const parsed = skillSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await updateSkill(
    id,
    {
      name: parsed.data.name,
      description: parsed.data.description,
      disable_model_invocation: parsed.data.disable_model_invocation,
      content: parsed.data.content,
    },
    pluginId,
    marketplaceId,
  );

  if (!result) {
    return { error: "Failed to update skill" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function deleteSkillAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;

  const success = await deleteSkill(id, pluginId, marketplaceId);
  if (!success) {
    return { error: "Failed to delete skill" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

// ─── Agent Actions ───

export async function createAgentAction(
  formData: FormData
): Promise<ActionResult> {
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    content: formData.get("content") as string,
  };

  const parsed = agentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await createAgent({
    plugin_id: pluginId,
    name: parsed.data.name,
    description: parsed.data.description,
    content: parsed.data.content,
    marketplace_id: marketplaceId,
  });

  if (!result) {
    return { error: "Failed to create agent" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function updateAgentAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    content: formData.get("content") as string,
  };

  const parsed = agentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await updateAgent(
    id,
    {
      name: parsed.data.name,
      description: parsed.data.description,
      content: parsed.data.content,
    },
    pluginId,
    marketplaceId,
  );

  if (!result) {
    return { error: "Failed to update agent" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function deleteAgentAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;

  const success = await deleteAgent(id, pluginId, marketplaceId);
  if (!success) {
    return { error: "Failed to delete agent" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

// ─── Command Actions ───

export async function createCommandAction(
  formData: FormData
): Promise<ActionResult> {
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    content: formData.get("content") as string,
  };

  const parsed = commandSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await createCommand({
    plugin_id: pluginId,
    name: parsed.data.name,
    content: parsed.data.content,
    marketplace_id: marketplaceId,
  });

  if (!result) {
    return { error: "Failed to create command" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function updateCommandAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;
  const rawData = {
    name: formData.get("name") as string,
    content: formData.get("content") as string,
  };

  const parsed = commandSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await updateCommand(
    id,
    {
      name: parsed.data.name,
      content: parsed.data.content,
    },
    pluginId,
    marketplaceId,
  );

  if (!result) {
    return { error: "Failed to update command" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}

export async function deleteCommandAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const pluginId = formData.get("plugin_id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;

  const success = await deleteCommand(id, pluginId, marketplaceId);
  if (!success) {
    return { error: "Failed to delete command" };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}
