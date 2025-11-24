import { useEffect } from "react";
import { healthCheck } from "./api/apiClient";

function App() {
  useEffect(() => {
    healthCheck().then((res) => {
      console.log(res);
    });
  }, []);
  const env = import.meta.env.PROD;
  return <>ENV:{env ? "本番" : "開発"}</>;
}

export default App;
