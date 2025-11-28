import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import type { DTORoom } from "@/types";

type RoomCardProps = {
  data: DTORoom;
  onDetailClick?: () => void;
  onDeleteClick?: () => void;
};

const getStatusLabel = (status: number) => {
  switch (status) {
    case 0:
      return "Waiting";
    case 1:
      return "In game";
    case 2:
      return "Finished";
    default:
      return "Unknown";
  }
};

const getStatusVariant = (
  status: number
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 0:
      return "secondary";
    case 1:
      return "default";
    case 2:
      return "outline";
    default:
      return "destructive";
  }
};

const RoomCard = ({
  data: room,
  onDetailClick,
  onDeleteClick,
}: RoomCardProps) => {
  const memberCount = room.members.length;

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">
            Room <span className="font-mono">{room.roomCode}</span>
          </CardTitle>
          <Badge variant={getStatusVariant(room.status)}>
            {getStatusLabel(room.status)}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Created at {room.createdAt}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Players</span>
          <span className="font-medium">{memberCount}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 gap-2">
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={onDeleteClick}>
            Delete
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onDetailClick}>
            Detail
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
