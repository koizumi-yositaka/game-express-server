import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export const DialogWrapper = ({
  isOpen,
  onOpenChange,
  buttonText,
  children,
  title,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  buttonText: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">{buttonText}</Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-none max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};
