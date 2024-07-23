import { SessionScreen } from "./sessionscreen.widget";
import PopupWindow from "../.widgethacks/popupwindow.js";

export const SessionModule = (id = 0) =>
  PopupWindow({
    // On-screen keyboard
    monitor: id,
    name: `session${id}`,
    visible: false,
    keymode: "on-demand",
    layer: "overlay",
    exclusivity: "ignore",
    anchor: ["top", "bottom", "left", "right"],
    child: SessionScreen({ id: id }),
  });
