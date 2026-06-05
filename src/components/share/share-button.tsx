"use client";

import { useState, type ReactNode } from "react";
import { Share2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { StorySpec } from "@/lib/share/story-canvas";
import { ShareDialog } from "./share-dialog";

interface ShareButtonProps {
  spec: StorySpec;
  caption: string;
  filename?: string;
  children?: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export function ShareButton({
  spec,
  caption,
  filename,
  children,
  variant = "outline",
  size = "md",
  className,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {children ?? (
          <>
            <Share2 className="h-4 w-4" /> Share
          </>
        )}
      </Button>
      {open ? (
        <ShareDialog spec={spec} caption={caption} filename={filename} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
