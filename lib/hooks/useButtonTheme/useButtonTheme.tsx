import { createMuiTheme, PaletteColorOptions } from "@material-ui/core";
import produce from "immer";
import { useMemo } from "react";
import { defaultThemeConfiguration } from "../../theme";

export function useButtonTheme(color: string) {
  const buttonTheme = useMemo(() => {
    const options = produce(defaultThemeConfiguration, (draft) => {
      draft.palette.primary = { main: color } as PaletteColorOptions;
    });
    return createMuiTheme(options);
  }, [color]);

  return buttonTheme;
}
