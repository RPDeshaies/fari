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
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidV4 } from "uuid";
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
  const [userId] = useState(() => {
    return uuidV4();
  });
  const shareLinkInputRef = useRef<HTMLInputElement>();
  const theme = useTheme();
  const textColors = useTextColors(theme.palette.primary.main);
  const sceneManager = useScene(userId, idFromProps);
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
            connectionsManager.actions.connect(idFromProps, userId, {
              playerName: playerName,
            });
          }}
        ></JoinAGame>
      );
    }
    return (
      <Box>
        {renderHeader()}
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            {renderSidePanel()}
          </Grid>
          <Grid item xs={12} md={9}>
            {renderMainContent()}
          </Grid>
        </Grid>
      </Box>
    );
  }

  function renderSidePanel() {
    return (
      <Box display="flex" flexDirection="column" height="100%" pb="1rem">
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
              return (
                <PlayerRow
                  key={player.id}
                  highlight={userId === player.id}
                  player={player}
                ></PlayerRow>
              );
            })}
          </Box>
        </Paper>
      </Box>
    );
  }

  function renderMainContent() {
    const aspectIds = Object.keys(sceneManager.state.scene.aspects);
    const shouldRenderEmptyAspectView = aspectIds.length === 0 && isGM;
    return (
      <Box pb="2rem">
        <Grid container spacing={2}>
          {shouldRenderEmptyAspectView && (
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
              <Grid item xs={12} sm={12} md={4} key={aspectId}>
                <IndexCard
                  title={sceneManager.state.scene.aspects[aspectId].title}
                  readonly={!isGM}
                  content={sceneManager.state.scene.aspects[aspectId].content}
                  freeInvokes={
                    sceneManager.state.scene.aspects[aspectId].freeInvokes
                  }
                  physicalStress={
                    sceneManager.state.scene.aspects[aspectId].physicalStress
                  }
                  mentalStress={
                    sceneManager.state.scene.aspects[aspectId].mentalStress
                  }
                  consequences={
                    sceneManager.state.scene.aspects[aspectId].consequences
                  }
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
                  onFreeInvokeChange={(index, value) => {
                    sceneManager.actions.updateAspectFreeInvoke(
                      aspectId,
                      index,
                      value
                    );
                  }}
                  onPhysicalStressChange={(index, value) => {
                    sceneManager.actions.updateAspectPhysicalStress(
                      aspectId,
                      index,
                      value
                    );
                  }}
                  onMentalStressChange={(index, value) => {
                    sceneManager.actions.updateAspectMentalStress(
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
                  onAddAspectFreeInvoke={() => {
                    sceneManager.actions.addAspectFreeInvoke(aspectId);
                  }}
                  onAddAspectPhysicalStress={() => {
                    sceneManager.actions.addAspectPhysicalStress(aspectId);
                  }}
                  onAddAspectMentalStress={() => {
                    sceneManager.actions.addAspectMentalStress(aspectId);
                  }}
                  onAddConsequence={() => {
                    sceneManager.actions.addAspectConsequence(aspectId);
                  }}
                ></IndexCard>
              </Grid>
            );
          })}
        </Grid>
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
                readonly={!isGM}
                onChange={(value) => {
                  sceneManager.actions.setName(value);
                }}
              ></ContentEditable>
            </Typography>
          </Container>
        </Box>

        <Box>
          {isGM && (
            <Box
              display="flex"
              justifyContent="center"
              flexWrap="wrap"
              className={css({
                "& *": {
                  margin: "0 .5rem",
                  flex: "0 1 auto",
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
              <input
                ref={shareLinkInputRef}
                type="text"
                value={shareLink}
                readOnly
                hidden
              />
              <Button
                onClick={() => {
                  shareLinkInputRef.current.select();
                  document.execCommand("copy");
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
          )}
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
