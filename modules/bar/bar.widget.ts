import Widget from "resource:///com/github/Aylur/ags/widget.js";

import { currentShellMode } from "../../variables.js";
import { BarSystemResourcesWidget } from "./normal//bar.system-resources.widget";
import { BarIndicatorsWidget } from "./normal/bar.indicators.widget.js";
import { BatteryModule } from "./normal/bar.battery.widget.js";
import { BarClock } from "./normal/bar.clock.widget.js";
import { BarTemperatureWidget } from "./normal/bar.temperature.widget.js";

export const BarWidget = async (monitor = 0) => {
  const normalBarContent = Widget.CenterBox({
    className: "bar-bg",
    startWidget: Widget.Box({
      className: "spacing-h-4",
      children: [BatteryModule(), BarSystemResourcesWidget()],
    }),
    centerWidget: Widget.Box({
      className: "spacing-h-4",
      children: [BarTemperatureWidget(), BarClock()],
    }),
    endWidget: BarIndicatorsWidget(),
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
          self.shown = currentShellMode.value as "normal" | "nothing";
        }),
    }),
  });
};
