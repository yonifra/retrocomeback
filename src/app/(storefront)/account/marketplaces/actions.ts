"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("marketplaces")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      display_name: parsed.data.display_name,
      description: parsed.data.description,
      version: parsed.data.version,
      owner_email: parsed.data.owner_email || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A marketplace with this name already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/account/marketplaces");
  redirect(`/account/marketplaces/${data.id}`);
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplaces")
    .update({
      name: parsed.data.name,
      display_name: parsed.data.display_name,
      description: parsed.data.description,
      version: parsed.data.version,
      owner_email: parsed.data.owner_email || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A marketplace with this name already exists" };
    }
    return { error: error.message };
  }

  revalidatePath(`/account/marketplaces/${id}`);
  return {};
}

export async function deleteMarketplaceAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;

  const supabase = await createClient();
  const { error } = await supabase.from("marketplaces").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/account/marketplaces");
  redirect("/account/marketplaces");
}

export async function togglePublishAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const publish = formData.get("publish") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplaces")
    .update({ is_published: publish })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_plugins")
    .insert({
      marketplace_id: marketplaceId,
      name: parsed.data.name,
      description: parsed.data.description,
      version: parsed.data.version,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || null,
      homepage: parsed.data.homepage || null,
      category: parsed.data.category || null,
      tags,
      keywords,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A plugin with this name already exists in this marketplace" };
    }
    return { error: error.message };
  }

  revalidatePath(`/account/marketplaces/${marketplaceId}`);
  redirect(
    `/account/marketplaces/${marketplaceId}/plugins/${data.id}`
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplace_plugins")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      version: parsed.data.version,
      author_name: parsed.data.author_name,
      author_email: parsed.data.author_email || null,
      homepage: parsed.data.homepage || null,
      category: parsed.data.category || null,
      tags,
      keywords,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A plugin with this name already exists in this marketplace" };
    }
    return { error: error.message };
  }

  revalidatePath(`/account/marketplaces/${marketplaceId}`);
  return {};
}

export async function deletePluginAction(
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get("id") as string;
  const marketplaceId = formData.get("marketplace_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplace_plugins")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase.from("plugin_skills").insert({
    plugin_id: pluginId,
    name: parsed.data.name,
    description: parsed.data.description,
    disable_model_invocation: parsed.data.disable_model_invocation,
    content: parsed.data.content,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A skill with this name already exists in this plugin" };
    }
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_skills")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      disable_model_invocation: parsed.data.disable_model_invocation,
      content: parsed.data.content,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_skills")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase.from("plugin_agents").insert({
    plugin_id: pluginId,
    name: parsed.data.name,
    description: parsed.data.description,
    content: parsed.data.content,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "An agent with this name already exists in this plugin" };
    }
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_agents")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      content: parsed.data.content,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_agents")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase.from("plugin_commands").insert({
    plugin_id: pluginId,
    name: parsed.data.name,
    content: parsed.data.content,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "A command with this name already exists in this plugin",
      };
    }
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_commands")
    .update({
      name: parsed.data.name,
      content: parsed.data.content,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("plugin_commands")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(
    `/account/marketplaces/${marketplaceId}/plugins/${pluginId}`
  );
  return {};
}
