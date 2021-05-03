import { css } from "@emotion/css";
import Box from "@material-ui/core/Box";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { useTheme } from "@material-ui/core/styles";
import produce from "immer";
import React from "react";
import { ContentEditable } from "../../../../../components/ContentEditable/ContentEditable";
import { BlockType, IBlock } from "../../../../../domains/character/types";
import { IDiceRollResult } from "../../../../../domains/dice/Dice";
import { useLazyState } from "../../../../../hooks/useLazyState/useLazyState";
import { useTranslate } from "../../../../../hooks/useTranslate/useTranslate";
import { IBlockComponentProps } from "../types/IBlockComponentProps";
import { BlockDicePool, BlockDicePoolActions } from "./blocks/BlockDicePool";
import { BlockImage } from "./blocks/BlockImage";
import { BlockLink, BlockLinkActions } from "./blocks/BlockLink";
import { BlockNumeric, BlockNumericActions } from "./blocks/BlockNumeric";
import {
  BlockPointCounter,
  BlockPointCounterActions,
} from "./blocks/BlockPointCounter";
import { BlockSeparator, BlockSeparatorActions } from "./blocks/BlockSeparator";
import { BlockSkill, BlockSkillActions } from "./blocks/BlockSkill";
import { BlockSlotTracker } from "./blocks/BlockSlotTracker";
import { BlockText, BlockTextActions } from "./blocks/BlockText";

export function BlockByType(
  props: Omit<
    IBlockComponentProps<any>,
    "onLabelChange" | "onValueChange" | "onMetaChange"
  > & {
    hideHelp?: boolean;
    onChange(newBlock: IBlock): void;
    onRemove(): void;
    onDuplicate(): void;
    onMainPointCounterChange?(): void;
    onRoll(diceRollResult: IDiceRollResult): void;
  }
) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [block, setBlock] = useLazyState({
    value: props.block,
    delay: 0,
    onChange(newBlock) {
      props.onChange(newBlock);
    },
  });

  function handleOnLabelChange(label: any) {
    setBlock(
      produce((draft: IBlock | undefined) => {
        if (!draft) {
          return;
        }
        draft.label = label;
      })
    );
  }

  function handleOnValueChange(value: any) {
    setBlock(
      produce((draft: IBlock | undefined) => {
        if (!draft) {
          return;
        }
        draft.value = value;
      })
    );
  }

  function handleOnMetaChange(meta: any) {
    setBlock(
      produce((draft: IBlock | undefined) => {
        if (!draft) {
          return;
        }

        draft.meta = meta;
      })
    );
  }
  function handleOnHelperTextChange(helperText: string) {
    setBlock(
      produce((draft: IBlock | undefined) => {
        if (!draft) {
          return;
        }

        draft.meta.helperText = helperText;
      })
    );
  }

  return (
    <>
      {props.block.type === BlockType.Text && (
        <BlockText
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}
      {props.block.type === BlockType.Numeric && (
        <BlockNumeric
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}
      {props.block.type === BlockType.Image && (
        <BlockImage
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}
      {props.block.type === BlockType.Skill && (
        <BlockSkill
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}
      {props.block.type === BlockType.DicePool && (
        <BlockDicePool
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}
      {props.block.type === BlockType.PointCounter && (
        <BlockPointCounter
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}

      {props.block.type === BlockType.SlotTracker && (
        <BlockSlotTracker
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}

      {props.block.type === BlockType.Link && (
        <BlockLink
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}

      {props.block.type === BlockType.Separator && (
        <BlockSeparator
          advanced={props.advanced}
          dataCy={props.dataCy}
          readonly={props.readonly}
          block={block}
          onLabelChange={handleOnLabelChange}
          onValueChange={handleOnValueChange}
          onMetaChange={handleOnMetaChange}
          onRoll={props.onRoll}
        />
      )}

      {props.advanced && renderBlockAdvancedOptions()}
      {renderBlockHelpText()}
    </>
  );

  function renderBlockAdvancedOptions() {
    return (
      <Grid container justify="flex-end" spacing={1}>
        {block.type === BlockType.PointCounter && (
          <BlockPointCounterActions
            block={block}
            onMetaChange={handleOnMetaChange}
            onMainPointCounterChange={props.onMainPointCounterChange}
          />
        )}
        {block.type === BlockType.Text && (
          <BlockTextActions block={block} onMetaChange={handleOnMetaChange} />
        )}
        {block.type === BlockType.Numeric && (
          <BlockNumericActions
            block={block}
            onMetaChange={handleOnMetaChange}
          />
        )}

        {block.type === BlockType.Skill && (
          <BlockSkillActions block={block} onMetaChange={handleOnMetaChange} />
        )}
        {block.type === BlockType.DicePool && (
          <BlockDicePoolActions
            block={block}
            onMetaChange={handleOnMetaChange}
          />
        )}
        {block.type === BlockType.Link && (
          <BlockLinkActions block={block} onMetaChange={handleOnMetaChange} />
        )}
        {block.type === BlockType.Separator && (
          <BlockSeparatorActions
            block={block}
            onMetaChange={handleOnMetaChange}
          />
        )}

        <Grid item>
          <Link
            component="button"
            variant="caption"
            className={css({
              label: "CharacterDialog-duplicate",
              color: theme.palette.primary.main,
            })}
            onClick={() => {
              props.onDuplicate();
            }}
          >
            {t("character-dialog.control.duplicate")}
          </Link>
        </Grid>
        <Grid item>
          <Link
            component="button"
            variant="caption"
            data-cy={`${props.dataCy}.remove`}
            className={css({
              label: "CharacterDialog-remove",
              color: theme.palette.primary.main,
            })}
            onClick={() => {
              props.onRemove();
            }}
          >
            {t("character-dialog.control.remove-block")}
          </Link>
        </Grid>
      </Grid>
    );
  }

  function renderBlockHelpText() {
    if (props.hideHelp || (!props.advanced && !block.meta.helperText)) {
      return null;
    }
    return (
      <Box>
        <Grid container alignItems="flex-start" wrap="nowrap">
          {props.advanced && (
            <Grid item>
              <FormHelperText className={css({ paddingRight: ".2rem" })}>
                {t("character-dialog.helper-text.help")}
              </FormHelperText>
            </Grid>
          )}

          <Grid item xs>
            {" "}
            <FormHelperText>
              <ContentEditable
                readonly={!props.advanced}
                border={props.advanced}
                data-cy={`${props.dataCy}.helper-text`}
                value={block.meta.helperText ?? ""}
                onChange={(newHelpText) => {
                  handleOnHelperTextChange(newHelpText);
                }}
              />
            </FormHelperText>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
