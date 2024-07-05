import Widget from "resource:///com/github/Aylur/ags/widget.js";

import { WallpaperWidget } from "./wallpaper.widget";

export const WallpaperModuleWidget = (monitor: any) =>
  Widget.Window({
    name: `desktopbackground${monitor}`,
    // anchor: ['top', 'bottom', 'left', 'right'],
    layer: "background",
    exclusivity: "ignore",
    visible: true,
    child: WallpaperWidget(monitor),
  });
