import Layout from "@/layouts/Layout";
import { Route, Routes } from "react-router-dom";
import Root from "@/pages/Root";
import RoomDetail from "@/pages/room/RoomDetail";
import Rooms from "@/pages/room/Rooms";
import CreatedRoom from "@/pages/room/CreatedRoom";
import RoomsLayout from "@/layouts/RoomsLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Root />} />
        <Route path="rooms" element={<RoomsLayout />}>
          <Route index element={<Rooms />} />
          <Route path="new" element={<CreatedRoom />} />
          <Route path=":roomCode" element={<RoomDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}
