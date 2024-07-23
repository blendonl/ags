const { Box } = Widget;
export const BarGroupWidget = (data: { child: any; cssClass?: string }) =>
  Box({
    className: "bar-group-margin bar-sides",
    children: [
      Box({
        className: `bar-group bar-group-standalone bar-group-pad-system ${data.cssClass ?? ""}`,
        children: [data.child],
      }),
    ],
  });
