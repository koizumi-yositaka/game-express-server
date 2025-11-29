import { confirmModalAtom } from "@/atoms/confirmModalAtom";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export function callMyConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    store.set(confirmModalAtom, {
      title: "Confirm",
      type: "confirm",
      description: message,
      isOpen: true,
      resolve,
    });
  });
}

export function showInfoDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    store.set(confirmModalAtom, {
      title: "Info",
      type: "info",
      description: message,
      isOpen: true,
      resolve,
      isOnlyYes: true,
    });
  });
}

export function showErrorDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    store.set(confirmModalAtom, {
      title: "Error",
      description: message,
      isOpen: true,
      resolve,
      isOnlyYes: true,
      type: "error",
    });
  });
}
