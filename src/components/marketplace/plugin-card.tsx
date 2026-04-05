import Link from "next/link";
import { Puzzle, FileCode, Bot, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PluginWithDetails } from "@/types";

interface PluginCardProps {
  plugin: PluginWithDetails;
  marketplaceId: string;
}

export function PluginCard({ plugin, marketplaceId }: PluginCardProps) {
  return (
    <Link
      href={`/account/marketplaces/${marketplaceId}/plugins/${plugin.id}`}
    >
      <div className="group relative flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-[0_0_15px_hsl(300_100%_50%/0.1)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Puzzle className="size-5 text-accent" />
            <h3 className="font-heading text-xs text-foreground">
              {plugin.name}
            </h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            v{plugin.version}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {plugin.description || "No description"}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {plugin.skills.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <FileCode className="mr-1 size-3" />
              {plugin.skills.length}{" "}
              {plugin.skills.length === 1 ? "skill" : "skills"}
            </Badge>
          )}
          {plugin.agents.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Bot className="mr-1 size-3" />
              {plugin.agents.length}{" "}
              {plugin.agents.length === 1 ? "agent" : "agents"}
            </Badge>
          )}
          {plugin.commands.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Terminal className="mr-1 size-3" />
              {plugin.commands.length}{" "}
              {plugin.commands.length === 1 ? "command" : "commands"}
            </Badge>
          )}
        </div>

        {plugin.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {plugin.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
