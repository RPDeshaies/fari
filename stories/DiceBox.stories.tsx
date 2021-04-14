import Box from "@material-ui/core/Box";
import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";
import React from "react";
import { DiceBox } from "../lib/components/DiceBox/DiceBox";
import { RollType } from "../lib/domains/dice/Dice";
import { StoryProvider } from "./StoryProvider";

type IProps = Parameters<typeof DiceBox>["0"];

export default {
  title: "Main/DiceBox",
  component: DiceBox,
  args: {
    tooltipOpen: true,
    onClick: action("onClick"),
    onFinalResult: action("onFinalResult"),
    onRolling: action("onRolling"),
    rolls: [],
    tooltipPlacement: "right",
    size: "7rem",
    fontSize: "4.5rem",
    borderSize: ".5rem",
    disabled: false,
    reduceOpacityWithoutHover: false,
    showDetails: false,
    disableConfettis: true,
  },
} as Meta<IProps>;

const Template: Story<IProps> = (args, context) => (
  <StoryProvider theme={context.globals.theme}>
    <Box mt="4rem">
      <DiceBox
        rolls={args.rolls}
        onClick={args.onClick}
        tooltipOpen={args.tooltipOpen}
        tooltipPlacement={args.tooltipPlacement}
        size={args.size}
        fontSize={args.fontSize}
        borderSize={args.borderSize}
        disabled={args.disabled}
        reduceOpacityWithoutHover={args.reduceOpacityWithoutHover}
        showDetails={args.showDetails}
        disableConfettis={args.disableConfettis}
      />
    </Box>
  </StoryProvider>
);

export const Default = Template.bind({});
Default.args = {
  rolls: [
    {
      total: 4,
      totalWithoutModifiers: 4,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
      ],
    },
  ],
};

export const DefaultWithModifiers = Template.bind({});
DefaultWithModifiers.args = {
  rolls: [
    {
      total: 6,
      totalWithoutModifiers: 4,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.Modifier,
          value: 2,
          label: "Academic",
        },
      ],
    },
  ],
};

export const DefaultBadResult = Template.bind({});
DefaultBadResult.args = {
  rolls: [
    {
      total: -4,
      totalWithoutModifiers: -4,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: -1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: -1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: -1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
        {
          type: RollType.DiceCommand,
          value: -1,
          commandGroupId: "1dF",
          commandName: "1dF",
        },
      ],
    },
  ],
};

export const DefaultD20 = Template.bind({});
DefaultD20.args = {
  rolls: [
    {
      total: 20,
      totalWithoutModifiers: 20,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 20,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
      ],
    },
  ],
};
export const DefaultD20BadResult = Template.bind({});
DefaultD20BadResult.args = {
  rolls: [
    {
      total: 1,
      totalWithoutModifiers: 1,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
      ],
    },
  ],
};

export const MultipleDice = Template.bind({});
MultipleDice.args = {
  rolls: [
    {
      total: 6,
      totalWithoutModifiers: 6,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 2,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 3,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
      ],
    },
  ],
};

export const MultipleDiceWithModifiers = Template.bind({});
MultipleDiceWithModifiers.args = {
  rolls: [
    {
      total: 9,
      totalWithoutModifiers: 6,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 2,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 3,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.Modifier,
          value: 2,
          label: "Academic",
        },
        {
          type: RollType.Modifier,
          value: 1,
          label: "Lore",
        },
      ],
    },
  ],
};

export const Pool = Template.bind({});
Pool.args = {
  rolls: [
    {
      total: 6,
      totalWithoutModifiers: 6,
      options: { listResults: true },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 2,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 3,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
      ],
    },
  ],
};

export const OutOfBound = Template.bind({});
OutOfBound.args = {
  rolls: [
    {
      total: 6,
      totalWithoutModifiers: 6,
      options: { listResults: false },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d4",
          commandName: "1d4",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d6",
          commandName: "1d6",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d8",
          commandName: "1d8",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d10",
          commandName: "1d10",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d4",
          commandName: "1d4",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d6",
          commandName: "1d6",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d8",
          commandName: "1d8",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d10",
          commandName: "1d10",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
      ],
    },
  ],
};
export const OutOfBoundPool = Template.bind({});
OutOfBoundPool.args = {
  rolls: [
    {
      total: 6,
      totalWithoutModifiers: 6,
      options: { listResults: true },
      commandResult: [
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d4",
          commandName: "1d4",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d6",
          commandName: "1d6",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d8",
          commandName: "1d8",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d10",
          commandName: "1d10",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d4",
          commandName: "1d4",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d6",
          commandName: "1d6",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d8",
          commandName: "1d8",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d10",
          commandName: "1d10",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d20",
          commandName: "1d20",
        },
        {
          type: RollType.DiceCommand,
          value: 1,
          commandGroupId: "1d12",
          commandName: "1d12",
        },
      ],
    },
  ],
};
