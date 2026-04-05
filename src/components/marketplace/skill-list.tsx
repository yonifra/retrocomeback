"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCode, Plus, Edit, Trash2 } from "lucide-react";
import { SkillEditor } from "./skill-editor";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { PluginSkill } from "@/types";
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "@/app/(storefront)/account/marketplaces/actions";

interface SkillListProps {
  skills: PluginSkill[];
  pluginId: string;
  marketplaceId: string;
}

export function SkillList({ skills, pluginId, marketplaceId }: SkillListProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingSkill, setEditingSkill] = useState<PluginSkill | undefined>();

  const handleEdit = (skill: PluginSkill) => {
    setEditingSkill(skill);
    setShowEditor(true);
  };

  const handleAdd = () => {
    setEditingSkill(undefined);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingSkill(undefined);
  };

  const handleDelete = (skillId: string) => {
    const formData = new FormData();
    formData.set("id", skillId);
    formData.set("plugin_id", pluginId);
    formData.set("marketplace_id", marketplaceId);
    deleteSkillAction(formData);
  };

  if (showEditor) {
    return (
      <SkillEditor
        action={editingSkill ? updateSkillAction : createSkillAction}
        pluginId={pluginId}
        marketplaceId={marketplaceId}
        skill={editingSkill}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs text-primary">
          SKILLS ({skills.length})
        </h3>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-1 size-3" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center">
          <FileCode className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No skills yet. Add your first skill to get started.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAdd}
          >
            <Plus className="mr-1 size-3" />
            Add Skill
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <FileCode className="size-4 text-primary" />
                <div>
                  <p className="font-mono text-sm text-foreground">
                    {skill.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {skill.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEdit(skill)}
                >
                  <Edit className="size-3" />
                </Button>
                <DeleteConfirmDialog
                  title="Delete Skill"
                  description={`Are you sure you want to delete "${skill.name}"? This action cannot be undone.`}
                  onConfirm={() => handleDelete(skill.id)}
                  trigger={
                    <Button variant="ghost" size="icon-sm">
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
