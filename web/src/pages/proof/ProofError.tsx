import { useLocation } from "react-router-dom";

export const ProofError = () => {
  const { state } = useLocation();
  const message = state?.message as string;
  return <div>ProofError {message}</div>;
};
