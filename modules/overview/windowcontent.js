const { Gdk } = imports.gi;
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

import Applications from "resource:///com/github/Aylur/ags/service/applications.js";
const { exec } = Utils;
import { hasUnterminatedBackslash, couldBeMath, ls } from "./miscfunctions.js";
import {
  CalculationResultButton,
  CustomCommandButton,
  DirectoryButton,
  DesktopEntryButton,
  ExecuteCommandButton,
  SearchButton,
  AiButton,
  NoResultButton,
} from "./searchbuttons.js";
import { checkKeybind } from "../.widgetutils/keybind.js";

const MAX_RESULTS = 10;

export const SearchAndWindows = () => {
  var _appSearchResults = [];

  const resultsBox = Widget.Box({
    className: "overview-search-results",
    vertical: true,
  });
  const resultsRevealer = Widget.Revealer({
    transitionDuration: userOptions.animations.durationLarge,
    revealChild: false,
    transition: "slide_down",
    // duration: 200,
    hpack: "center",
    child: resultsBox,
  });
  const entryPromptRevealer = Widget.Revealer({
    transition: "crossfade",
    transitionDuration: userOptions.animations.durationLarge,
    revealChild: true,
    hpack: "center",
    child: Widget.Label({
      className: "overview-search-prompt txt-small txt",
      label: "Type to search",
    }),
  });

  const entryIconRevealer = Widget.Revealer({
    transition: "crossfade",
    transitionDuration: userOptions.animations.durationLarge,
    revealChild: false,
    hpack: "end",
    child: Widget.Label({
      className: "txt txt-large icon-material overview-search-icon",
      label: "search",
    }),
  });

  const entryIcon = Widget.Box({
    className: "overview-search-prompt-box",
    setup: (box) => box.pack_start(entryIconRevealer, true, true, 0),
  });

  const entry = Widget.Entry({
    className: "overview-search-box txt-small txt",
    hpack: "center",
    onAccept: (self) => {
      // This is when you hit Enter
      resultsBox.children[0].onClicked();
    },
    onChange: (entry) => {
      // this is when you type
      const isAction = entry.text[0] == ">";
      const isDir = ["/", "~"].includes(entry.text[0]);
      resultsBox.get_children().forEach((ch) => ch.destroy());

      // check empty if so then dont do stuff
      if (entry.text == "") {
        resultsRevealer.reveal_child = false;
        entryPromptRevealer.reveal_child = true;
        entryIconRevealer.reveal_child = false;
        entry.toggleClassName("overview-search-box-extended", false);
        return;
      }
      const text = entry.text;
      resultsRevealer.reveal_child = true;
      entryPromptRevealer.reveal_child = false;
      entryIconRevealer.reveal_child = true;
      entry.toggleClassName("overview-search-box-extended", true);
      _appSearchResults = Applications.query(text ?? "");

      // Calculate
      if (userOptions.search.enableFeatures.mathResults && couldBeMath(text)) {
        // Eval on typing is dangerous; this is a small workaround.
        try {
          const fullResult = eval(text?.replace(/\^/g, "**") ?? "");
          resultsBox.add(
            CalculationResultButton({ result: fullResult, text: text }),
          );
        } catch (e) {
          // console.log(e);
        }
      }
      if (userOptions.search.enableFeatures.directorySearch && isDir) {
        var contents = [];
        contents = ls({ path: text ?? "", silent: true });
        contents.forEach((item) => {
          resultsBox.add(DirectoryButton(item));
        });
      }
      if (userOptions.search.enableFeatures.actions && isAction) {
        // Eval on typing is dangerous, this is a workaround.
        resultsBox.add(CustomCommandButton({ text: entry.text ?? "" }));
      }
      // Add application entries
      let appsToAdd = MAX_RESULTS;
      _appSearchResults.forEach((app) => {
        if (appsToAdd == 0) return;
        resultsBox.add(DesktopEntryButton(app));
        appsToAdd--;
      });

      // Fallbacks
      // if the first word is an actual command
      if (
        userOptions.search.enableFeatures.commands &&
        !isAction &&
        !hasUnterminatedBackslash(text) &&
        exec(`bash -c "command -v ${text?.split(" ")[0] ?? ""}"`) != ""
      ) {
        resultsBox.add(
          ExecuteCommandButton({
            command: entry.text,
            terminal: entry.text?.startsWith("sudo") ?? false,
          }),
        );
      }

      // Add fallback: search
      if (userOptions.search.enableFeatures.aiSearch)
        resultsBox.add(AiButton({ text: entry.text }));
      if (userOptions.search.enableFeatures.webSearch)
        resultsBox.add(SearchButton({ text: entry?.text ?? "" }));
      if (resultsBox.children.length == 0) resultsBox.add(NoResultButton());
      resultsBox.show_all();
    },
  });
  return Widget.Box({
    vertical: true,
    children: [
      Widget.Box({
        hpack: "center",
        children: [
          entry,
          Widget.Box({
            className: "overview-search-icon-box",
            setup: (box) => {
              box.pack_start(entryPromptRevealer, true, true, 0);
            },
          }),
          entryIcon,
        ],
      }),
      resultsRevealer,
    ],
    setup: (self) =>
      self
        .hook(App, (_b, name, visible) => {
          if (name == "overview" && !visible) {
            resultsBox.children = [];
            entry.set_text("");
          }
        })
        .on("key-press-event", (widget, event) => {
          // Typing
          const keyval = event.get_keyval()[1];
          const modstate = event.get_state()[1];
          if (checkKeybind(event, userOptions.keybinds.overview.altMoveLeft))
            entry.set_position(Math.max(entry.get_position() - 1, 0));
          else if (
            checkKeybind(event, userOptions.keybinds.overview.altMoveRight)
          )
            entry.set_position(
              Math.min(entry.get_position() + 1, entry.get_text()?.length ?? 0),
            );
          else if (
            checkKeybind(event, userOptions.keybinds.overview.deleteToEnd)
          ) {
            const text = entry.get_text();
            const pos = entry.get_position();
            const newText = text?.slice(0, pos) ?? null;
            entry.set_text(newText);
            entry.set_position(newText?.length ?? 0);
          } else if (!(modstate & Gdk.ModifierType.CONTROL_MASK)) {
            // Ctrl not held
            if (keyval >= 32 && keyval <= 126 && widget != entry) {
              Utils.timeout(1, () => entry.grab_focus());
              entry.set_text(entry.text + String.fromCharCode(keyval));
              entry.set_position(-1);
            }
          }
        }),
  });
};
