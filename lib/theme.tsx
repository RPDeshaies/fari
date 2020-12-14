import { createMuiTheme, ThemeOptions } from "@material-ui/core/styles";
import { lighten } from "@material-ui/core/styles/colorManipulator";

const systemFonts = [
  "-apple-system",
  "system-ui",
  "BlinkMacSystemFont",
  "'Segoe UI'",
  "Roboto",
  "'Helvetica Neue'",
  "Ubuntu",
  "Arial",
  "sans-serif",
];

export const defaultThemeConfiguration: ThemeOptions = {
  typography: {
    // default 300
    fontWeightLight: 300,
    // default 400
    fontWeightRegular: 400,
    // default 500
    fontWeightMedium: 500,
    // default 700
    fontWeightBold: 700,
    fontFamily: [
      "Inter",
      "HelveticaNeue",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: "7px",
      },
      contained: {
        fontWeight: 700,
      },
      outlined: {
        fontWeight: 700,
      },
    },
    MuiButtonGroup: {
      root: {
        borderRadius: "20px",
      },
    },
  },
};

export const AppLightTheme = createMuiTheme({
  ...defaultThemeConfiguration,
  palette: {
    primary: { main: "#415f9c" },
    secondary: { main: "#7a8cb4" },
  },
});

export const AppDarkTheme = createMuiTheme({
  ...defaultThemeConfiguration,
  palette: {
    type: "dark",
    primary: {
      main: lighten(AppLightTheme.palette.primary.main, 0.5),
    },
    secondary: {
      main: lighten(AppLightTheme.palette.secondary.main, 0.2),
    },
  },
});
