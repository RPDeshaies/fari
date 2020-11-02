import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { ManagerMode } from "../../components/Manager/Manager";
import { Page } from "../../components/Page/Page";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import {
  CharactersContext,
  ICharacter,
} from "../../contexts/CharactersContext/CharactersContext";
import { useLogger } from "../../contexts/InjectionsContext/hooks/useLogger";
import { Dice, IRollDiceOptions } from "../../domains/dice/Dice";
import { IDiceRoll } from "../../domains/dice/IDiceRoll";
import { useQuery } from "../../hooks/useQuery/useQuery";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";
import { CharacterDialog } from "./components/CharacterDialog";

export const CharacterRoute: React.FC<{
  match: {
    params: { id: string };
  };
}> = (props) => {
  const { t } = useTranslate();
  const history = useHistory();
  const charactersManager = useContext(CharactersContext);
  const [rolls, setRolls] = useState<Array<IDiceRoll>>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<
    ICharacter | undefined
  >(undefined);
  const logger = useLogger();

  function roll(options: IRollDiceOptions) {
    setRolls((draft) => {
      const newRoll = Dice.roll4DF(options);
      logger.info("DiceRoute:onDiceRoll", { roll: newRoll });
      return [newRoll, ...draft];
    });
  }

  useEffect(() => {
    logger.info("Route:Character");
  }, []);

  useEffect(() => {
    const characterToLoad = charactersManager.state.characters.find(
      (s) => s.id === props.match.params.id
    );

    if (characterToLoad) {
      setSelectedCharacter(characterToLoad);
    } else {
      history.replace("/");
      charactersManager.actions.openManager(ManagerMode.Manage);
    }
  }, [props.match.params.id, charactersManager.state.characters]);

  const query = useQuery<"dialog">();
  const dialogMode = query.get("dialog") === "true";
  return (
    <>
      <PageMeta
        title={t("characters-route.title")}
        description={t("characters-route.description")}
      />

      <Page>
        <CharacterDialog
          open={!!selectedCharacter}
          character={selectedCharacter}
          dialog={dialogMode || false}
          rolls={rolls}
          onRoll={(bonus) => {
            roll(bonus);
          }}
          onSave={(newCharacter) => {
            charactersManager.actions.upsert(newCharacter);
          }}
        />
      </Page>
    </>
  );
};

CharacterRoute.displayName = "CharacterRoute";
