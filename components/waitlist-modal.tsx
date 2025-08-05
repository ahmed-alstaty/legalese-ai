"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaitlistForm } from "./waitlist-form";
import { Button } from "@/components/ui/button";

interface WaitlistModalProps {
  trigger?: React.ReactNode;
  source?: string;
}

export function WaitlistModal({ trigger, source = "modal" }: WaitlistModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be among the first to access Legalese AI when we launch. We'll notify you as soon as we're ready!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <WaitlistForm 
            source={source}
            buttonText="Get Early Access"
            placeholder="your@email.com"
            onSuccess={() => setTimeout(() => setOpen(false), 2000)}
          />
        </div>
        <div className="text-sm text-muted-foreground text-center mt-4">
          No spam, ever. Unsubscribe anytime.
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WaitlistButton({ 
  children, 
  className, 
  variant = "default",
  size = "default",
  source = "button"
}: { 
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  source?: string;
}) {
  return (
    <WaitlistModal
      source={source}
      trigger={
        <Button variant={variant} size={size} className={className}>
          {children}
        </Button>
      }
    />
  );
}