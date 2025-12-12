import type { RoleFeatureB, DTOProofRole } from "@/proofTypes";

const getFeatureLabel = (key: keyof RoleFeatureB): string => {
  switch (key) {
    case "borned":
      return "出身国";
    case "favariteFood":
      return "好きな食べ物";
    case "birthDay":
      return "誕生日";
    case "yesterday":
      return "昨日の出来事";
    default:
      return key;
  }
};

export const ProofRole = ({
  role,
  roleSetting,
}: {
  role: DTOProofRole | null;
  roleSetting: RoleFeatureB | null;
}) => {
  return (
    <div className="space-y-4">
      {role && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            {role.description || role.roleName}
          </h2>
        </div>
      )}
      {roleSetting && (
        <div className="space-y-3">
          <div className="grid gap-3">
            {(Object.keys(roleSetting) as Array<keyof RoleFeatureB>)
              .filter((key) => roleSetting[key])
              .map((key) => (
                <div
                  key={key}
                  className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {getFeatureLabel(key)}
                  </span>
                  <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {roleSetting[key]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
