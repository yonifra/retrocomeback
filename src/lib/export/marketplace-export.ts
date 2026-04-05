import JSZip from "jszip";
import type { MarketplaceWithPlugins, PluginWithDetails } from "@/types";

/**
 * Generate a SKILL.md file with frontmatter
 */
function generateSkillMd(skill: {
  name: string;
  description: string;
  disable_model_invocation: boolean;
  content: string;
}): string {
  const lines = [
    "---",
    `name: ${skill.name}`,
    `description: ${skill.description}`,
    `disable_model_invocation: ${skill.disable_model_invocation}`,
    "---",
    "",
    skill.content,
  ];
  return lines.join("\n");
}

/**
 * Generate marketplace.json following the Claude Code spec
 */
function generateMarketplaceJson(marketplace: MarketplaceWithPlugins): string {
  return JSON.stringify(
    {
      name: marketplace.name,
      version: marketplace.version,
      description: marketplace.description,
      owner: {
        name: marketplace.display_name,
        email: marketplace.owner_email || undefined,
      },
      plugins: marketplace.plugins.map((p) => ({
        name: p.name,
        version: p.version,
        description: p.description,
      })),
    },
    null,
    2
  );
}

/**
 * Generate plugin.json following the Claude Code spec
 */
function generatePluginJson(plugin: PluginWithDetails): string {
  return JSON.stringify(
    {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: {
        name: plugin.author_name,
        email: plugin.author_email || undefined,
      },
      homepage: plugin.homepage || undefined,
      category: plugin.category || undefined,
      tags: plugin.tags.length > 0 ? plugin.tags : undefined,
      keywords: plugin.keywords.length > 0 ? plugin.keywords : undefined,
    },
    null,
    2
  );
}

/**
 * Export a marketplace as a ZIP file following the Claude Code marketplace spec.
 *
 * Structure:
 * marketplace-name/
 * ├── .claude-plugin/
 * │   └── marketplace.json
 * └── plugins/
 *     └── plugin-name/
 *         ├── .claude-plugin/
 *         │   └── plugin.json
 *         ├── skills/
 *         │   └── skill-name/
 *         │       └── SKILL.md
 *         ├── agents/
 *         │   └── agent-name.md
 *         └── commands/
 *             └── command-name.md
 */
export async function exportMarketplaceAsZip(
  marketplace: MarketplaceWithPlugins
): Promise<Blob> {
  const zip = new JSZip();
  const root = marketplace.name;

  // marketplace.json
  zip.file(
    `${root}/.claude-plugin/marketplace.json`,
    generateMarketplaceJson(marketplace)
  );

  // Each plugin
  for (const plugin of marketplace.plugins) {
    const pluginDir = `${root}/plugins/${plugin.name}`;

    // plugin.json
    zip.file(
      `${pluginDir}/.claude-plugin/plugin.json`,
      generatePluginJson(plugin)
    );

    // Skills
    for (const skill of plugin.skills) {
      zip.file(
        `${pluginDir}/skills/${skill.name}/SKILL.md`,
        generateSkillMd(skill)
      );
    }

    // Agents
    for (const agent of plugin.agents) {
      const agentContent = [
        "---",
        `name: ${agent.name}`,
        `description: ${agent.description}`,
        "---",
        "",
        agent.content,
      ].join("\n");
      zip.file(`${pluginDir}/agents/${agent.name}.md`, agentContent);
    }

    // Commands
    for (const command of plugin.commands) {
      zip.file(`${pluginDir}/commands/${command.name}.md`, command.content);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Trigger a browser download for a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get the file tree structure for preview
 */
export function getFileTree(marketplace: MarketplaceWithPlugins): string[] {
  const files: string[] = [];
  const root = marketplace.name;

  files.push(`${root}/`);
  files.push(`${root}/.claude-plugin/`);
  files.push(`${root}/.claude-plugin/marketplace.json`);
  files.push(`${root}/plugins/`);

  for (const plugin of marketplace.plugins) {
    const pluginDir = `${root}/plugins/${plugin.name}`;
    files.push(`${pluginDir}/`);
    files.push(`${pluginDir}/.claude-plugin/`);
    files.push(`${pluginDir}/.claude-plugin/plugin.json`);

    if (plugin.skills.length > 0) {
      files.push(`${pluginDir}/skills/`);
      for (const skill of plugin.skills) {
        files.push(`${pluginDir}/skills/${skill.name}/`);
        files.push(`${pluginDir}/skills/${skill.name}/SKILL.md`);
      }
    }

    if (plugin.agents.length > 0) {
      files.push(`${pluginDir}/agents/`);
      for (const agent of plugin.agents) {
        files.push(`${pluginDir}/agents/${agent.name}.md`);
      }
    }

    if (plugin.commands.length > 0) {
      files.push(`${pluginDir}/commands/`);
      for (const command of plugin.commands) {
        files.push(`${pluginDir}/commands/${command.name}.md`);
      }
    }
  }

  return files;
}

/**
 * Get the marketplace.json content for preview
 */
export function getMarketplaceJsonPreview(
  marketplace: MarketplaceWithPlugins
): string {
  return generateMarketplaceJson(marketplace);
}
