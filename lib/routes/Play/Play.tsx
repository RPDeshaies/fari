import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import { css } from "emotion";
import React, { useEffect } from "react";
import { ContentEditable } from "../../components/ContentEditable/ContentEditable";
import { DevTool } from "../../components/DevTool/DevTool";
import { IndexCard } from "../../components/IndexCard/IndexCard";
import { Page } from "../../components/Page/Page";
import { Dice } from "../../domains/dice/Dice";
import { Font } from "../../domains/font/Font";
import { usePeerConnections } from "../../hooks/usePeerJS/usePeerConnections";
import { usePeerHost } from "../../hooks/usePeerJS/usePeerHost";
import { usePeerJS } from "../../hooks/usePeerJS/usePeerJS";
import { useTextColors } from "../../hooks/useTextColors/useTextColors";
import { JoinAGame } from "./JoinAGame";
import { PlayerRow } from "./PlayerRow";
import { useScene } from "./useScene/useScene";

const debug = false;

export const Play: React.FC<{
  match: {
    params: { id: string };
  };
}> = (props) => {
  const idFromProps = props.match.params.id;
  const theme = useTheme();
  const textColors = useTextColors(theme.palette.primary.main);
  const sceneManager = useScene();
  const peerManager = usePeerJS({
    debug: debug,
  });
  const hostManager = usePeerHost({
    peer: peerManager.state.peer,
    onConnectionDataReceive(id: string, roll: number) {
      sceneManager.actions.updatePlayerRoll(id, roll);
    },
    debug: debug,
  });
  const connectionsManager = usePeerConnections({
    peer: peerManager.state.peer,
    onHostDataReceive(newScene) {
      sceneManager.actions.setScene(newScene);
    },
    debug: debug,
  });

  useEffect(() => {
    hostManager.actions.sendToConnections(sceneManager.state.scene);
  }, [sceneManager.state.scene]);

  useEffect(() => {
    if (isGM) {
      sceneManager.actions.updatePlayers(hostManager.state.connections);
    }
  }, [hostManager.state.connections]);

  const isGM = !idFromProps;
  const shareLink = `${location.origin}/play/${peerManager.state.hostId}`;
  const everyone = [
    sceneManager.state.scene.gm,
    ...sceneManager.state.scene.players,
  ];
  return (
    <Page appBarActions={<Box></Box>}>
      {peerManager.state.error ? renderPageError() : renderPage()}
      <DevTool
        data={{
          hostId: peerManager.state.hostId,
          href: shareLink,
          numberOfConnections: hostManager.state.numberOfConnections,
          isConnectedToHost: connectionsManager.state.isConnectedToHost,
          error: peerManager.state.error,
          scene: sceneManager.state.scene,
        }}
      ></DevTool>
    </Page>
  );

  function renderPage() {
    if (!peerManager.state.hostId) {
      return renderIsLoading();
    }
    return renderPageContent();
  }

  function renderIsLoading() {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress></CircularProgress>
      </Box>
    );
  }

  function renderPageContent() {
    if (!isGM && !connectionsManager.state.isConnectedToHost) {
      return (
        <JoinAGame
          connecting={connectionsManager.state.connectingToHost}
          error={connectionsManager.state.connectingToHostError}
          onSubmit={(playerName) => {
            connectionsManager.actions.connect(idFromProps, {
              playerName: playerName,
            });
          }}
        ></JoinAGame>
      );
    }
    return (
      <Box>
        {renderHeader()}
        <Grid container>
          <Grid item xs={3}>
            {renderSidePanel()}
          </Grid>
          <Grid item xs={9}>
            {renderMainContent()}
          </Grid>
        </Grid>
      </Box>
    );
  }

  function renderSidePanel() {
    return (
      <Box display="flex" flexDirection="column" height="100%">
        <Box
          className={css({
            backgroundColor: theme.palette.primary.main,
            color: textColors.primary,
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
            minHeight: "4rem",
            padding: ".5rem",
          })}
        >
          <Grid
            container
            spacing={2}
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography
                variant="overline"
                className={css({
                  fontSize: ".8rem",
                  lineHeight: Font.lineHeight(0.8),
                  fontWeight: "bold",
                })}
              >
                Players:
              </Typography>
              <Box>
                <Typography
                  variant="overline"
                  className={css({
                    fontSize: "1.2rem",
                    lineHeight: Font.lineHeight(1.2),
                  })}
                >
                  {sceneManager.state.scene.players.length + 1}
                </Typography>
                <Typography
                  variant="caption"
                  className={css({
                    fontSize: ".8rem",
                    lineHeight: Font.lineHeight(0.8),
                  })}
                >
                  {" "}
                  connected
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (isGM) {
                    sceneManager.actions.updateGMRoll();
                  } else {
                    connectionsManager.actions.sendToHost(Dice.runFudgeDice());
                  }
                }}
              >
                Roll 4DF
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Paper>
          <Box bgcolor="#fff" minHeight="10rem" flex="1 0 auto">
            {everyone.map((player) => {
              return <PlayerRow key={player.id} player={player}></PlayerRow>;
            })}
          </Box>
        </Paper>
      </Box>
    );
  }

  function renderMainContent() {
    const aspectIds = Object.keys(sceneManager.state.scene.aspects);
    return (
      <Box pl="1rem">
        <Box display="flex" justifyContent="flex-end"></Box>

        <Box pb="2rem">
          <Grid container spacing={2}>
            {aspectIds.length === 0 && (
              <Grid item xs={12}>
                <Box pt="6rem" textAlign="center">
                  <Typography variant="h6">
                    Click on the
                    <Button
                      variant="outlined"
                      color="secondary"
                      className={css({
                        margin: "0 .5rem",
                      })}
                      onClick={() => {
                        sceneManager.actions.addAspect();
                      }}
                    >
                      Add Aspect
                    </Button>
                    button to add a new Aspect to the Scene
                  </Typography>
                </Box>
              </Grid>
            )}
            {aspectIds.map((aspectId) => {
              return (
                <Grid item xs={4} key={aspectId}>
                  <IndexCard
                    title={sceneManager.state.scene.aspects[aspectId].title}
                    content={sceneManager.state.scene.aspects[aspectId].content}
                    checkboxes={
                      sceneManager.state.scene.aspects[aspectId].checkboxes
                    }
                    consequences={
                      sceneManager.state.scene.aspects[aspectId].consequences
                    }
                    disabled={!isGM}
                    onRemove={() => {
                      sceneManager.actions.removeAspect(aspectId);
                    }}
                    onReset={() => {
                      sceneManager.actions.resetAspect(aspectId);
                    }}
                    onTitleChange={(value) => {
                      sceneManager.actions.updateAspectTitle(aspectId, value);
                    }}
                    onContentChange={(value) => {
                      sceneManager.actions.updateAspectContent(aspectId, value);
                    }}
                    onCheckboxChange={(index, value) => {
                      sceneManager.actions.updateAspectCheckbox(
                        aspectId,
                        index,
                        value
                      );
                    }}
                    onConsequenceChange={(index, value) => {
                      sceneManager.actions.updateAspectConsequence(
                        aspectId,
                        index,
                        value
                      );
                    }}
                    onAddCheckbox={(amount) => {
                      sceneManager.actions.addAspectCheckbox(aspectId);
                    }}
                    onAddConsequence={(amount) => {
                      sceneManager.actions.addAspectConsequence(aspectId);
                    }}
                  ></IndexCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    );
  }

  function renderHeader() {
    return (
      <Box pb="2rem">
        <Box pb="2rem">
          <Container maxWidth="sm">
            <Typography
              variant="h4"
              className={css({
                borderBottom: "1px solid #ddd",
                textAlign: "center",
              })}
            >
              <ContentEditable
                value={sceneManager.state.scene.name}
                disabled={!isGM}
                onChange={(value) => {
                  sceneManager.actions.setName(value);
                }}
              ></ContentEditable>
            </Typography>
          </Container>
        </Box>

        <Box>
          {isGM ? (
            <Box
              display="flex"
              justifyContent="center"
              className={css({
                "& *": {
                  margin: "0 .5rem",
                },
              })}
            >
              <Button
                onClick={() => {
                  sceneManager.actions.addAspect();
                }}
                variant="outlined"
                color="secondary"
              >
                Add Aspect
              </Button>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                }}
              >
                Copy Game Link
              </Button>
              <Button
                onClick={() => {
                  sceneManager.actions.reset();
                }}
              >
                Reset Scene
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  }

  function renderPageError() {
    return (
      <Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h4">Something wrong hapenned.</Typography>
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h6">
            We could not connect to the server to initialize the play session.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center">
          <Typography variant="h6">
            Try to refresh the page to see if that fixes the issue.
          </Typography>
        </Box>
      </Box>
    );
  }
};

Play.displayName = "Play";

{
  /* <Box>
          <Container maxWidth="sm" disableGutters>
            <Paper>
              <Box p={"1rem"}>
                <Grid container spacing={2} justify="center">
                  {everyone.map((player) => {
                    return (
                      <Grid item xs={4} key={player.id}>
                        <Box
                          className={css({
                            textAlign: "center",
                            textDecoration: "underline",
                            textDecorationColor: "#ddd",
                          })}
                        >
                          <Typography variant="button">
                            {player.playerName}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Container>
        </Box> */
}
