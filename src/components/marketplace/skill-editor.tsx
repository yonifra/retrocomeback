"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, X } from "lucide-react";
import type { PluginSkill } from "@/types";
import type { ActionResult } from "@/app/(storefront)/account/marketplaces/actions";

const TEMPLATES: Record<string, { description: string; content: string }> = {
  blank: {
    description: "",
    content: "",
  },
  "code-review": {
    description:
      "Use when reviewing code for quality, bugs, and best practices",
    content: `## Code Review

Review the provided code for:
- **Bugs**: Logic errors, edge cases, null/undefined issues
- **Performance**: Unnecessary computations, memory leaks
- **Security**: Input validation, injection vulnerabilities
- **Best Practices**: Naming, structure, patterns
- **Readability**: Clear intent, proper comments

Provide specific, actionable feedback with code examples where helpful.`,
  },
  "code-intelligence": {
    description: "Use for understanding and navigating codebases",
    content: `## Code Intelligence

When asked about code:
1. Search for relevant files using available tools
2. Analyze the code structure and patterns
3. Explain relationships between components
4. Identify potential issues or improvements

Focus on providing clear, concise explanations.`,
  },
  "dev-workflow": {
    description: "Use for development workflow automation",
    content: `## Development Workflow

Help with common development tasks:
- Setting up project structure
- Creating boilerplate code
- Writing tests
- Generating documentation
- Managing dependencies

Follow the project's existing patterns and conventions.`,
  },
};

interface SkillEditorProps {
  action: (formData: FormData) => Promise<ActionResult>;
  pluginId: string;
  marketplaceId: string;
  skill?: PluginSkill;
  onCancel: () => void;
}

export function SkillEditor({
  action,
  pluginId,
  marketplaceId,
  skill,
  onCancel,
}: SkillEditorProps) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    {}
  );
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [content, setContent] = useState(skill?.content ?? "");
  const [disableModelInvocation, setDisableModelInvocation] = useState(
    skill?.disable_model_invocation ?? true
  );

  const applyTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (template) {
      setDescription(template.description);
      setContent(template.content);
    }
  };

  // Generate frontmatter preview
  const frontmatterPreview = [
    "---",
    `name: ${name || "skill-name"}`,
    `description: ${description || "Skill description"}`,
    `disable_model_invocation: ${disableModelInvocation}`,
    "---",
  ].join("\n");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="plugin_id" value={pluginId} />
      <input type="hidden" name="marketplace_id" value={marketplaceId} />
      {skill && <input type="hidden" name="id" value={skill.id} />}

      {state.error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Template Buttons */}
      {!skill && (
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Start from template</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TEMPLATES).map((key) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(key)}
              >
                {key
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Skill Name</Label>
          <Input
            className="bg-secondary font-mono text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="code-review"
          />
          <input type="hidden" name="name" value={name} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Description</Label>
          <Input
            name="description"
            className="bg-secondary text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Use when reviewing code..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="disable_model_invocation"
          name="disable_model_invocation"
          checked={disableModelInvocation}
          onCheckedChange={(checked) =>
            setDisableModelInvocation(checked === true)
          }
        />
        <Label
          htmlFor="disable_model_invocation"
          className="text-sm text-foreground"
        >
          Disable model invocation (skill runs without AI calls)
        </Label>
      </div>

      {/* Split pane: Editor + Preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Content (Markdown)</Label>
          <Textarea
            name="content"
            className="min-h-[300px] bg-secondary font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your skill markdown content here..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-foreground">SKILL.md Preview</Label>
          <div className="min-h-[300px] overflow-auto rounded-md border border-border bg-background p-4 font-mono text-sm">
            <pre className="text-muted-foreground">{frontmatterPreview}</pre>
            <div className="mt-2 whitespace-pre-wrap text-foreground">
              {content || "No content yet..."}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="font-heading text-xs transition-shadow hover:neon-glow"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              {skill ? "Update Skill" : "Add Skill"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 size-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
