const { Gtk } = imports.gi;
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";

import Indicators from "./normal/spaceright.js";
import System from "./normal/system.js";
import { enableClickthrough } from "../.widgetutils/clickthrough.js";
import { RoundedCorner } from "../.commonwidgets/cairo_roundedcorner.js";
import { currentShellMode } from "../../variables.js";

export const Bar = async (monitor = 0) => {
  const SideModule = (children) =>
    Widget.Box({
      className: "bar-sidemodule",
      children: children,
    });
  const normalBarContent = Widget.CenterBox({
    className: "bar-bg",
    setup: (self) => {
      const styleContext = self.get_style_context();
      const minHeight = styleContext.get_property(
        "min-height",
        Gtk.StateFlags.NORMAL,
      );
      // execAsync(['bash', '-c', `hyprctl keyword monitor ,addreserved,${minHeight},0,0,0`]).catch(print);
    },
    startWidget: Widget.Box({
      className: "spacing-h-4",
      children: [],
    }),
    centerWidget: Widget.Box({
      className: "spacing-h-4",
      children: [
        SideModule([]),
        Widget.Box({
          homogeneous: true,
          children: [],
        }),
        SideModule([System()]),
      ],
    }),
    endWidget: Indicators(),
  });
  const nothingContent = Widget.Box({
    className: "bar-bg-nothing",
  });
  return Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    visible: true,
    child: Widget.Stack({
      homogeneous: false,
      transition: "slide_up_down",
      transitionDuration: userOptions.animations.durationLarge,
      children: {
        normal: normalBarContent,
        nothing: nothingContent,
      },
      setup: (self) =>
        self.hook(currentShellMode, (self) => {
          self.shown = currentShellMode.value;
        }),
    }),
  });
};

export const BarCornerTopleft = (monitor = 0) =>
  Widget.Window({
    monitor,
    name: `barcornertl${monitor}`,
    layer: "top",
    anchor: ["top", "left"],
    exclusivity: "normal",
    visible: true,
    child: RoundedCorner("topleft", { className: "corner" }),
    setup: enableClickthrough,
  });
export const BarCornerTopright = (monitor = 0) =>
  Widget.Window({
    monitor,
    name: `barcornertr${monitor}`,
    layer: "top",
    anchor: ["top", "right"],
    exclusivity: "normal",
    visible: true,
    child: RoundedCorner("topright", { className: "corner" }),
    setup: enableClickthrough,
  });
