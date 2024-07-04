import Widget from "resource:///com/github/Aylur/ags/widget.js";

import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";

export const SeparatorDot = () =>
  Widget.Revealer({
    transition: "slide_left",
    revealChild: false,
    attribute: {
      count: SystemTray.items.length,
      update: (self, diff) => {
        self.attribute.count += diff;
        self.revealChild = self.attribute.count > 0;
      },
    },
    child: Widget.Box({
      vpack: "center",
      className: "separator-circle",
    }),
    setup: (self) =>
      self
        .hook(SystemTray, (self) => self.attribute.update(self, 1), "added")
        .hook(SystemTray, (self) => self.attribute.update(self, -1), "removed"),
  });
