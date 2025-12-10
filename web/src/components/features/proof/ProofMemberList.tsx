import type { DTOProofRoomMember } from "@/proofTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ProofMemberList = ({
  roomMenbers,
  focusOn,
}: {
  roomMenbers: DTOProofRoomMember[];
  focusOn: number;
}) => {
  return (
    <div className="space-y-4">
      {focusOn && (
        <div className="text-sm text-muted-foreground">
          現在:{" "}
          {
            roomMenbers.find((member) => member.id === focusOn)?.user
              ?.displayName
          }{" "}
          の番です
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {roomMenbers
          .sort((a, b) => a.sort - b.sort)
          .map((member) => (
            <Card
              key={member.id}
              className={cn(
                "transition-all",
                focusOn === member.id && "bg-primary/10 border-primary border-2"
              )}
            >
              <CardHeader>
                <CardTitle className="text-base">
                  {member.user?.displayName || "Unknown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.sort}
                {/* {member.role && (
                <div className="text-sm text-muted-foreground">
                  {member.role.roleName}
                </div>
              )} */}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};
