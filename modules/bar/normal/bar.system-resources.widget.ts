const { GLib } = imports.gi;
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { Box, Button, Label, Overlay } = Widget;
const { execAsync, exec } = Utils;
import { AnimatedCircProg } from "../../.commonwidgets/cairo_circularprogress.js";
import { MaterialIcon } from "../../.commonwidgets/materialicon.js";
import { BarGroupWidget } from "../common/bar.group.widget";

const CUSTOM_MODULE_CONTENT_INTERVAL_FILE = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-interval.txt`;
const CUSTOM_MODULE_CONTENT_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-poll.sh`;
const CUSTOM_MODULE_LEFTCLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-leftclick.sh`;
const CUSTOM_MODULE_RIGHTCLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-rightclick.sh`;
const CUSTOM_MODULE_MIDDLECLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-middleclick.sh`;
const CUSTOM_MODULE_SCROLLUP_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-scrollup.sh`;
const CUSTOM_MODULE_SCROLLDOWN_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-scrolldown.sh`;

export const BarResourceWidget = (
  name: string,
  icon: string,
  command: string,
  circprogClassName = "bar-batt-circprog",
  textClassName = "txt-onSurfaceVariant",
  iconClassName = "bar-batt",
) => {
  const resourceCircProg = AnimatedCircProg({
    className: `${circprogClassName}`,
    vpack: "center",
    hpack: "center",
  });
  const resourceProgress = Box({
    homogeneous: true,
    children: [
      Overlay({
        child: Box({
          vpack: "center",
          className: `${iconClassName}`,
          homogeneous: true,
          children: [MaterialIcon(icon, "small")],
        }),
        overlays: [resourceCircProg],
      }),
    ],
  });
  const resourceLabel = Label({
    className: `txt-smallie ${textClassName}`,
  });

  return Button({
    onClicked: () =>
      Utils.execAsync(["bash", "-c", `${userOptions.apps.taskManager}`]).catch(
        print,
      ),
    child: Box({
      className: `spacing-h-4 ${textClassName}`,
      children: [resourceProgress, resourceLabel],
      setup: (self) =>
        self.poll(5000, () =>
          execAsync(["bash", "-c", command])
            .then((output) => {
              resourceCircProg.css = `font-size: ${Number(output)}px;`;
              resourceLabel.label = `${Math.round(Number(output))}%`;
              widget.tooltipText = `${name}: ${Math.round(Number(output))}%`;
            })
            .catch(print),
        ),
    }),
  });
};

export const BarSystemResourcesWidget = () => {
  // Check if $XDG_CACHE_HOME/ags/user/scripts/custom-module-poll.sh exists
  if (GLib.file_test(CUSTOM_MODULE_CONTENT_SCRIPT, GLib.FileTest.EXISTS)) {
    const interval =
      Number(Utils.readFile(CUSTOM_MODULE_CONTENT_INTERVAL_FILE)) || 5000;
    return BarGroupWidget({
      child: Button({
        child: Label({
          className: "txt-smallie txt-onSurfaceVariant",
          useMarkup: true,
          setup: (self) =>
            Utils.timeout(1, () => {
              self.label = exec(CUSTOM_MODULE_CONTENT_SCRIPT);
              self.poll(interval, (self) => {
                const content = exec(CUSTOM_MODULE_CONTENT_SCRIPT);
                self.label = content;
              });
            }),
        }),
        onPrimaryClickRelease: () =>
          execAsync(CUSTOM_MODULE_LEFTCLICK_SCRIPT).catch(print),
        onSecondaryClickRelease: () =>
          execAsync(CUSTOM_MODULE_RIGHTCLICK_SCRIPT).catch(print),
        onMiddleClickRelease: () =>
          execAsync(CUSTOM_MODULE_MIDDLECLICK_SCRIPT).catch(print),
        onScrollUp: () => execAsync(CUSTOM_MODULE_SCROLLUP_SCRIPT).catch(print),
        onScrollDown: () =>
          execAsync(CUSTOM_MODULE_SCROLLDOWN_SCRIPT).catch(print),
      }),
    });
  } else
    return BarGroupWidget({
      child: Box({
        children: [
          BarResourceWidget(
            "RAM Usage",
            "memory",
            `LANG=C free | awk '/^Mem/ {printf("%.2f\\n", ($3/$2) * 100)}'`,
            "bar-ram-circprog",
            "bar-ram-txt",
            "bar-ram-icon",
          ),
          BarResourceWidget(
            "Swap Usage",
            "swap_horiz",
            `LANG=C free | awk '/^Swap/ {if ($2 > 0) printf("%.2f\\n", ($3/$2) * 100); else print "0";}'`,
            "bar-swap-circprog",
            "bar-swap-txt",
            "bar-swap-icon",
          ),
          BarResourceWidget(
            "CPU Usage",
            "settings_motion_mode",
            `LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'`,
            "bar-cpu-circprog",
            "bar-cpu-txt",
            "bar-cpu-icon",
          ),
        ],
      }),
    });
};
