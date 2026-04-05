"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
