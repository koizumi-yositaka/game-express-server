import type { DTOProof } from "@/proofTypes";

export const ShowProof = ({ proof }: { proof: DTOProof }) => {
  return (
    <div>
      ShowProof {proof.title} {proof.description}
    </div>
  );
};
