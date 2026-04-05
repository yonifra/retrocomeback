import { z } from "zod";

const kebabCase = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be 50 characters or less")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Must be kebab-case (e.g. 'my-marketplace')"
  );

const semver = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Must be valid semver (e.g. '1.0.0')");

export const marketplaceSchema = z.object({
  name: kebabCase,
  display_name: z.string().min(1, "Display name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  version: semver,
  owner_email: z.string().email().optional().or(z.literal("")),
});

export const pluginSchema = z.object({
  name: kebabCase,
  description: z.string().min(1, "Description is required").max(500),
  version: semver,
  author_name: z.string().min(1, "Author name is required").max(100),
  author_email: z.string().email().optional().or(z.literal("")),
  homepage: z.string().url().optional().or(z.literal("")),
  category: z.string().max(50).optional().or(z.literal("")),
  tags: z.string().max(200).optional(), // comma-separated, parsed to array
  keywords: z.string().max(200).optional(),
});

export const skillSchema = z.object({
  name: kebabCase,
  description: z.string().min(1, "Description is required").max(300),
  disable_model_invocation: z.boolean().default(true),
  content: z.string().min(1, "Skill content is required"),
});

export const agentSchema = z.object({
  name: kebabCase,
  description: z.string().min(1, "Description is required").max(300),
  content: z.string().min(1, "Agent content is required"),
});

export const commandSchema = z.object({
  name: kebabCase,
  content: z.string().min(1, "Command content is required"),
});

// Re-export form types
export type MarketplaceFormData = z.infer<typeof marketplaceSchema>;
export type PluginFormData = z.infer<typeof pluginSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
export type AgentFormData = z.infer<typeof agentSchema>;
export type CommandFormData = z.infer<typeof commandSchema>;
