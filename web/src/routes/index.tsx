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
import { SessionComplete } from "@/pages/session/SessionComplete";
import { SessionGameResult } from "@/pages/session/SessionGameResult";
import { ProofLayout } from "@/layouts/ProofLayout";
import { ProofSession } from "@/pages/proof/ProofSession";
import { RevealResult } from "@/components/features/proof/RevealResult";
import { NotFount } from "@/pages/NotFount";
import { ProofError } from "@/pages/proof/ProofError";
import { ProofRequestReveal } from "@/pages/proof/ProofRequestReveal";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/public">
            <Route path="sessions/:roomSessionId" element={<SessionPublic />} />

            <Route path="proof" element={<ProofLayout />}>
              <Route path="" element={<NotFount />} />
              <Route path=":roomSessionId" element={<ProofSession />} />
              <Route
                path=":roomSessionId/reveal/request"
                element={<ProofRequestReveal />}
              />
              <Route path="reveal/result" element={<RevealResult />} />
              <Route path="error" element={<ProofError />} />
            </Route>
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
            <Route
              path=":roomSessionId/complete"
              element={<SessionComplete />}
            />
            <Route path="result" element={<SessionGameResult />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFount />} />
      </Routes>
    </AuthProvider>
  );
}
