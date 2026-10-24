import { Navigate, useParams } from "react-router-dom";
import { useActiveJourney, roomStatus, HAT_ORDER, type HatId } from "@/store/game";
import WhiteRoom from "./rooms/WhiteRoom";
import RedRoom from "./rooms/RedRoom";
import BlackRoom from "./rooms/BlackRoom";
import YellowRoom from "./rooms/YellowRoom";
import GreenRoom from "./rooms/GreenRoom";
import BlueRoom from "./rooms/BlueRoom";

const ROOMS: Record<HatId, () => JSX.Element> = {
  white: WhiteRoom, red: RedRoom, black: BlackRoom, yellow: YellowRoom, green: GreenRoom, blue: BlueRoom,
};

export default function Room() {
  const { hat } = useParams();
  const j = useActiveJourney();
  if (!j) return <Navigate to="/start" replace />;
  if (!hat || !HAT_ORDER.includes(hat as HatId)) return <Navigate to="/map" replace />;
  if (roomStatus(j.rooms, hat as HatId) === "locked") return <Navigate to="/map" replace />;
  const C = ROOMS[hat as HatId];
  return <C />;
}
