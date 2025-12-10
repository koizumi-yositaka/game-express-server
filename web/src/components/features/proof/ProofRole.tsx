import type { PROOF_ROLE_NAME_MAP } from "@/proofTypes";

export const ProofRole = ({
  roleName,
}: {
  roleName: keyof typeof PROOF_ROLE_NAME_MAP;
}) => {
  return <div>{roleName}</div>;
};
