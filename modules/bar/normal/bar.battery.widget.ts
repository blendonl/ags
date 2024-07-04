import Widget, {
  Box,
  Label,
  Overlay,
  Revealer,
  Stack,
} from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import { BarGroupWidget } from "../common/bar.group.widget";
import { AnimatedCircProg } from "modules/.commonwidgets/cairo_circularprogress";
import { MaterialIcon } from "modules/.commonwidgets/materialicon";
import { Battery } from "resource:///com/github/Aylur/ags/service/battery.js";

const BatBatteryProgress = () => {
  const _updateProgress = (circprog) => {
    // Set circular progress value
    circprog.css = `font-size: ${Math.abs(Battery.percent)}px;`;

    circprog.toggleClassName(
      "bar-batt-circprog-low",
      Battery.percent <= userOptions.battery.low,
    );
    circprog.toggleClassName("bar-batt-circprog-full", Battery.charged);
  };
  return AnimatedCircProg({
    className: "bar-batt-circprog",
    vpack: "center",
    hpack: "center",
    extraSetup: (self) => self.hook(Battery, _updateProgress),
  });
};

export const BatteryModule = () =>
  Box({
    className: "spacing-h-4",
    children: [BarGroupWidget({ child: BarBattery() })],
  });

const BarBattery = () =>
  Box({
    className: "spacing-h-4 bar-batt-txt",
    children: [
      Revealer({
        transitionDuration: userOptions.animations.durationSmall,
        revealChild: false,
        transition: "slide_right",
        child: MaterialIcon("bolt", "norm", { tooltipText: "Charging" }),
        setup: (self) =>
          self.hook(Battery, (revealer) => {
            self.revealChild = Battery.charging;
          }),
      }),
      Label({
        className: "txt-smallie",
        setup: (self) =>
          self.hook(Battery, (label) => {
            label.label = `${Number.parseFloat(Battery.percent.toFixed(1))}%`;
          }),
      }),
      Overlay({
        child: Widget.Box({
          vpack: "center",
          className: "bar-batt",
          homogeneous: true,
          children: [MaterialIcon("battery_full", "small")],
          setup: (self) =>
            self.hook(Battery, (box) => {
              box.toggleClassName(
                "bar-batt-low",
                Battery.percent <= userOptions.battery.low,
              );
              box.toggleClassName("bar-batt-full", Battery.charged);
            }),
        }),
        overlays: [BatBatteryProgress()],
      }),
    ],
  });
