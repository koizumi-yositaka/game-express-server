import { useEffect } from "react";
import { healthCheck } from "./api/apiClient";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import ConfirmDialog from "./components/common/ConfirmModal";
import { LoadingProvider } from "./contexts/LoadingContext";

function App() {
  useEffect(() => {
    healthCheck().then((res) => {
      console.log(res);
    });
  }, []);
  // const env = import.meta.env.PROD;
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AppRoutes />
        <ConfirmDialog />
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App;
