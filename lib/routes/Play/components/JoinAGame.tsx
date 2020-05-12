import {
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  InputLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import appIcon from "../../../../images/app-icon.png";
import { useTranslate } from "../../../hooks/useTranslate/useTranslate";

let playerNameSingleton = "";

export const JoinAGame: React.FC<{
  onSubmit(playerName: string): void;
  connecting: boolean;
  error: any;
}> = (props) => {
  const { t } = useTranslate();
  const [playerName, setPlayerName] = useState(playerNameSingleton);

  useEffect(() => {
    playerNameSingleton = playerName;
  }, [playerName]);

  return (
    <Fade in>
      <Box>
        <Container maxWidth="xs">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              props.onSubmit(playerName);
            }}
          >
            <Box pb="2rem" textAlign="center">
              <img width="150px" src={appIcon} />
            </Box>
            <Box pb="2rem" textAlign="center">
              <Typography variant="h4">
                {t("play-route.connect-to-game")}
              </Typography>
            </Box>
            <Box pb="2rem">
              <InputLabel shrink>{t("play-route.character-name")}</InputLabel>
              <TextField
                placeholder="Magnus Burnsides"
                value={playerName}
                onChange={(event) => {
                  setPlayerName(event.target.value);
                }}
                inputProps={{
                  maxLength: "50",
                }}
                fullWidth
                autoFocus
                required
              ></TextField>
            </Box>
            <Box pb="2rem">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                {t("play-route.play")}
              </Button>
            </Box>
            {props.connecting && (
              <Box pb="1rem">
                <Box pb="3rem" display="flex" justifyContent="center">
                  <Typography>{t("play-route.awesome-name")}</Typography>
                </Box>
                <Box display="flex" justifyContent="center">
                  <CircularProgress />
                </Box>
              </Box>
            )}
            {props.error && (
              <Box pb="1rem" textAlign="center">
                <Typography color="error">
                  {t("play-route.join-error")}
                </Typography>
              </Box>
            )}
          </form>
        </Container>
      </Box>
    </Fade>
  );
};

JoinAGame.displayName = "JoinAGame";
