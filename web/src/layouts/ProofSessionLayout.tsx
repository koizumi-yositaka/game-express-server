import { Outlet } from "react-router-dom";

const ProofSessionLayout = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ProofSessionLayout;
