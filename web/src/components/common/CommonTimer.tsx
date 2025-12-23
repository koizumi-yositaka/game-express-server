import { useEffect, useState } from "react";
import { Button } from "../ui/button";
export const CommonTimer = ({
  initialTime,
  nextAction,
}: {
  initialTime: number;
  nextAction: () => Promise<void>;
}) => {
  const [time, setTime] = useState(initialTime);
  const [showFinished, setShowFinished] = useState(false);

  useEffect(() => {
    if (time <= 0) {
      setShowFinished(true);
      const timer = setTimeout(() => {
        nextAction();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time, nextAction]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      {showFinished ? (
        <div className="text-4xl font-bold text-red-600 animate-pulse">
          終わりです
        </div>
      ) : (
        <div className="text-6xl font-bold text-blue-600 font-mono tabular-nums transition-all duration-300 flex-col items-center justify-center">
          <div>{time}</div>
          <Button onClick={nextAction}>完了</Button>
        </div>
      )}
    </div>
  );
};
