import React, { useContext, useEffect } from "react";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { Scene, SceneMode } from "../../components/Scene/Scene";
import { CharactersContext } from "../../contexts/CharactersContext/CharactersContext";
import { useLogger } from "../../contexts/InjectionsContext/hooks/useLogger";
import { MyStuffContext } from "../../contexts/MyStuffContext/MyStuffContext";
import { ScenesContext } from "../../contexts/SceneContext/ScenesContext";
import { sanitizeSceneName, useScene } from "../../hooks/useScene/useScene";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";
import { useUserId } from "../../hooks/useUserId/useUserId";

export const PlayOfflineRoute: React.FC<{
  match: {
    params: { id: string };
  };
}> = () => {
  const userId = useUserId();
  const charactersManager = useContext(CharactersContext);
  const scenesManager = useContext(ScenesContext);

  const sceneManager = useScene({
    userId: userId,
    charactersManager: charactersManager,
  });
  const myStuffManager = useContext(MyStuffContext);
  const sceneName = sceneManager.state.scene.name;
  const pageTitle = sanitizeSceneName(sceneName);
  const logger = useLogger();

  useEffect(() => {
    logger.info("Route:PlayOffline");
  }, []);

  const { t } = useTranslate();

  return (
    <>
      <PageMeta
        title={pageTitle || t("home-route.play-offline.title")}
        description={t("home-route.play-offline.description")}
      />
      <Scene
        mode={SceneMode.PlayOffline}
        sceneManager={sceneManager}
        scenesManager={scenesManager}
        charactersManager={charactersManager}
        myStuffManager={myStuffManager}
      />
    </>
  );
};

PlayOfflineRoute.displayName = "PlayOfflineRoute";
export default PlayOfflineRoute;
