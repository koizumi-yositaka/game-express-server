import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const SessionFinished = ({
  roomSessionId,
}: {
  roomSessionId: number;
}) => {
  const [time, setTime] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time - 1);
    }, 1000);
    if (time === 0) {
      clearInterval(interval);
      navigate(`/session/${roomSessionId}/complete`);
    }
    return () => clearInterval(interval);
  }, [time]);
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">ゲームが完了しました</h1>
        <p className="text-sm text-gray-500">{time}秒後に遷移します</p>
      </div>
    </div>
  );
};
