import { useContext, useState } from "react";
import { DiceContext } from "../../contexts/DiceContext/DiceContext";
import { BlockType } from "../../domains/character/types";
import {
  IDicePool,
  IDicePoolElement,
} from "../../routes/Character/components/CharacterDialog/components/blocks/BlockDicePool";

export function useDicePool() {
  const [pool, setPool] = useState<IDicePool>([]);
  const diceManager = useContext(DiceContext);
  function addOrRemovePoolElement(element: IDicePoolElement) {
    setPool((draft) => {
      const ids = draft.map((element) => element.blockId);
      const exists = ids.includes(element.blockId);
      if (exists) {
        return draft.filter((e) => e.blockId !== element.blockId);
      }
      return [...draft, element];
    });
  }

  function clearPool() {
    setPool([]);
  }

  function getPoolResult() {
    const listResults = pool.some((e) => e.blockType === BlockType.DicePool);

    const commands = pool.flatMap((element) => element.commandOptionList);

    const result = diceManager.actions.roll(commands, { listResults });

    clearPool();
    return result;
  }

  return {
    state: { pool },
    actions: {
      clearPool,
      addOrRemovePoolElement,
      getPoolResult,
    },
  };
}
