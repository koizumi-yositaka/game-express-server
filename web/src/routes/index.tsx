import Layout from "@/layouts/Layout";
import { Route, Routes } from "react-router-dom";
import Root from "@/pages/Root";
import RoomPrepare from "@/pages/room/RoomPrepare";
import Rooms from "@/pages/room/Rooms";
import RoomNew from "@/pages/room/RoomNew";
import SessionDetail from "@/pages/session/SessionDetail";
import RoomsLayout from "@/layouts/RoomsLayout";
import SessionLayout from "@/layouts/SessionLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequiredAuth } from "@/layouts/RequiredAuth";
import { LoginPage } from "@/pages/LoginPage";
import { SessionPublic } from "@/pages/session/SessionPublic";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/public">
            <Route path=":roomSessionId" element={<SessionPublic />} />
          </Route>
          <Route
            path="rooms"
            element={
              <RequiredAuth>
                <RoomsLayout />
              </RequiredAuth>
            }
          >
            <Route index element={<Rooms />} />
            <Route path=":roomCode/new" element={<RoomNew />} />
            <Route path=":roomCode/prepare" element={<RoomPrepare />} />
            {/* <Route path=":roomCode/detail" element={<RoomDetail />} /> */}
          </Route>
          <Route
            path="session"
            element={
              <RequiredAuth>
                <SessionLayout />
              </RequiredAuth>
            }
          >
            <Route path=":roomSessionId" element={<SessionDetail />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
