import { type TConfirmModal } from "@/types";
import { atom } from "jotai";

export const confirmModalAtom = atom<TConfirmModal>({
  title: "",
  isOpen: false,
  description: "",
  type: "confirm",
  resolve: () => {},
});
