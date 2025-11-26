import { useEffect } from "react";
import { healthCheck } from "./api/apiClient";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

function App() {
  useEffect(() => {
    healthCheck().then((res) => {
      console.log(res);
    });
  }, []);
  // const env = import.meta.env.PROD;
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
