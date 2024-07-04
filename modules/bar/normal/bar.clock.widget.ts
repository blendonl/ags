import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { GLib } = imports.gi;

export const BarClock = () =>
  Widget.Box({
    vpack: "center",
    className: "spacing-h-4 bar-clock-box",
    children: [
      Widget.Label({
        className: "bar-time",
        label: GLib.DateTime.new_now_local().format(userOptions.time.format),
        setup: (self) =>
          self.poll(
            userOptions.time.interval,
            (label: { label: string | null }) => {
              label.label = GLib.DateTime.new_now_local().format(
                userOptions.time.format,
              );
            },
          ),
      }),
      Widget.Label({
        className: "txt-norm txt-onLayer1",
        label: "•",
      }),
      Widget.Label({
        className: "txt-smallie bar-date",
        label: GLib.DateTime.new_now_local().format(
          userOptions.time.dateFormatLong,
        ),
        setup: (self) =>
          self.poll(
            userOptions.time.dateInterval,
            (label: { label: string | null }) => {
              label.label = GLib.DateTime.new_now_local().format(
                userOptions.time.dateFormatLong,
              );
            },
          ),
      }),
    ],
  });
