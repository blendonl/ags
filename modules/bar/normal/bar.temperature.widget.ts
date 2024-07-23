// This is for the right pills of the bar.
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { Box, Label } = Widget;
const { execAsync } = Utils;
const { GLib } = imports.gi;
import { MaterialIcon } from "../../.commonwidgets/materialicon.js";
import { WWO_CODE, WEATHER_SYMBOL } from "../../.commondata/weather.js";

const WEATHER_CACHE_FOLDER = `${GLib.get_user_cache_dir()}/ags/weather`;
Utils.exec(`mkdir -p ${WEATHER_CACHE_FOLDER}`);

export const BarTemperatureWidget = () =>
  Box({
    hexpand: true,
    hpack: "center",
    className: "spacing-h-4 txt-onSurfaceVariant",
    children: [
      MaterialIcon("device_thermostat", "small"),
      Label({
        label: "Weather",
      }),
    ],
    setup: (self) =>
      self.poll(500000, async (self) => {
        const WEATHER_CACHE_PATH = WEATHER_CACHE_FOLDER + "/wttr.in.txt";
        const updateWeatherForCity = (city) =>
          execAsync(
            `curl https://wttr.in/${city.replace(/ /g, "%20")}?format=j1`,
          )
            .then((output) => {
              const weather = JSON.parse(output);
              Utils.writeFile(
                JSON.stringify(weather),
                WEATHER_CACHE_PATH,
              ).catch(print);
              const weatherCode = weather.current_condition[0].weatherCode;
              const weatherDesc =
                weather.current_condition[0].weatherDesc[0].value;
              const temperature =
                weather.current_condition[0][
                  `temp_${userOptions.weather.preferredUnit}`
                ];
              const feelsLike =
                weather.current_condition[0][
                  `FeelsLike${userOptions.weather.preferredUnit}`
                ];
              const weatherSymbol = WEATHER_SYMBOL[WWO_CODE[weatherCode]];
              self.children[0].label = weatherSymbol;
              self.children[1].label = `${temperature}°${userOptions.weather.preferredUnit} • Feels like ${feelsLike}°${userOptions.weather.preferredUnit}`;
              self.tooltip_text = weatherDesc;
            })
            .catch((err) => {
              try {
                // Read from cache
                const weather = JSON.parse(Utils.readFile(WEATHER_CACHE_PATH));
                const weatherCode = weather.current_condition[0].weatherCode;
                const weatherDesc =
                  weather.current_condition[0].weatherDesc[0].value;
                const temperature =
                  weather.current_condition[0][
                    `temp_${userOptions.weather.preferredUnit}`
                  ];
                const feelsLike =
                  weather.current_condition[0][
                    `FeelsLike${userOptions.weather.preferredUnit}`
                  ];
                const weatherSymbol = WEATHER_SYMBOL[WWO_CODE[weatherCode]];
                self.children[0].label = weatherSymbol;
                self.children[1].label = `${temperature}°${userOptions.weather.preferredUnit} • Feels like ${feelsLike}°${userOptions.weather.preferredUnit}`;
                self.tooltip_text = weatherDesc;
              } catch (err) {
                print(err);
              }
            });
        if (
          userOptions.weather.city != "" &&
          userOptions.weather.city != null
        ) {
          updateWeatherForCity(userOptions.weather.city.replace(/ /g, "%20"));
        } else {
          Utils.execAsync("curl ipinfo.io")
            .then((output) => {
              return JSON.parse(output)["city"].toLowerCase();
            })
            .then(updateWeatherForCity)
            .catch(print);
        }
      }),
  });
