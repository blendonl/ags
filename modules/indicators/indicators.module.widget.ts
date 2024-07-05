import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Indicator from "../../services/indicator.js";
import { ColorSchemeWidget } from "./colorscheme.widget";
import { VolumeBrightnessIndicatorWidget } from "./volume-brightness.indicator.widget";
import { MusicControlsModuleWidget } from "./musiccontrols.widget.js";
import { NotificationPopupWidget } from "./notificationpopups.widget.js";

export const IndicatorsModuleWidget = (monitor = 0) =>
  Widget.Window({
    name: `indicator${monitor}`,
    monitor,
    className: "indicator",
    layer: "overlay",
    // exclusivity: 'ignore',
    visible: true,
    anchor: ["top"],
    child: Widget.EventBox({
      onHover: () => {
        //make the widget hide when hovering
        Indicator.popup(-1);
      },
      child: Widget.Box({
        vertical: true,
        className: "osd-window",
        css: "min-height: 2px;",
        children: [
          VolumeBrightnessIndicatorWidget(monitor),
          MusicControlsModuleWidget(),
          NotificationPopupWidget(),
          ColorSchemeWidget(),
        ],
      }),
    }),
  });
