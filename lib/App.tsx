import CssBaseline from "@material-ui/core/CssBaseline";
import { StylesProvider, ThemeProvider } from "@material-ui/core/styles";
import * as Sentry from "@sentry/react";
import React, { useContext } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./components/AppRouter/AppRouter";
import { CharactersManager } from "./components/CharactersManager/CharactersManager";
import { ErrorReport } from "./components/ErrorBoundary/ErrorReport";
import { History } from "./components/History/History";
import { ScenesManager } from "./components/ScenesManager/ScenesManager";
import { env } from "./constants/env";
import {
  CharactersContext,
  useCharacters,
} from "./contexts/CharactersContext/CharactersContext";
import {
  DarkModeContext,
  useDarkMode,
} from "./contexts/DarkModeContext/DarkModeContext";
import { DiceContext, useDice } from "./contexts/DiceContext/DiceContext";
import {
  ScenesContext,
  useScenes,
} from "./contexts/SceneContext/ScenesContext";
import { AppDarkTheme, AppLightTheme } from "./theme";

export const App: React.FC<{}> = () => {
  const darkModeManager = useDarkMode();
  const charactersManager = useCharacters();
  const scenesManager = useScenes();
  const diceManager = useDice();
  return (
    <DarkModeContext.Provider value={darkModeManager}>
      <CharactersContext.Provider value={charactersManager}>
        <ScenesContext.Provider value={scenesManager}>
          <DiceContext.Provider value={diceManager}>
            <AppProvider />
          </DiceContext.Provider>
        </ScenesContext.Provider>
      </CharactersContext.Provider>
    </DarkModeContext.Provider>
  );
};
App.displayName = "App";

export const AppProvider: React.FC<{}> = (props) => {
  const store = useContext(DarkModeContext);

  return (
    <ThemeProvider theme={store.state.darkMode ? AppDarkTheme : AppLightTheme}>
      <StylesProvider injectFirst>
        <CssBaseline />
        <Sentry.ErrorBoundary fallback={ErrorReport} showDialog>
          <HelmetProvider>
            <BrowserRouter>
              <Helmet
                htmlAttributes={{
                  "client-build-number": env.buildNumber,
                  "client-hash": env.hash,
                  "client-context": env.context,
                }}
              />
              <History />
              <ScenesManager />
              <CharactersManager />
              <AppRouter />
            </BrowserRouter>
          </HelmetProvider>
        </Sentry.ErrorBoundary>
      </StylesProvider>
    </ThemeProvider>
  );
};
AppProvider.displayName = "AppProvider";
