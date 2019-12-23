import React, { useState, FormEvent } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  TextField,
  IconButton
} from "@material-ui/core";
import { css } from "emotion";
import SendIcon from "@material-ui/icons/Send";

export function useChat() {
  const cachedName = undefined;
  const [name, setName] = useState(cachedName ?? "");

  function saveName(name: string) {
    setName(name);
    localStorage.setItem("name", name);
  }
  return {
    name,
    saveName
  };
}

const chatContainer = css({
  position: "fixed",
  zIndex: 1,
  bottom: "3.4rem",
  maxWidth: "100%",
  height: "auto",
  width: "300px",
  right: "2rem"
});

const expansionPanelSummary = css({
  boxShadow: "0 2px 1px rgba(0, 0, 0, .1)"
});
const expansionPanelDetails = css({
  padding: "1rem"
});
const chatDetailsContainer = css({
  display: "flex",
  flexDirection: "column",
  width: "100%"
});
const chatDetailsMessages = css({
  flex: "1 0 auto",
  height: "14rem",
  maxHeight: "14rem",
  overflowY: "scroll",
  padding: ".5rem 1rem .5rem 1rem",
  background: "#fafafa"
});
const chatDetailsControls = css({
  flex: "0",
  borderTop: "1px solid rgba(0, 0, 0, .1)",
  padding: "0.5rem 1rem 0.2rem 1rem"
});

const expansionPanel = css`
  padding-bottom: 0.2rem;

  & .MuiExpansionPanelSummary-root,
  & .MuiExpansionPanelSummary-root.Mui-expanded {
    min-height: 2.5rem;
    padding: 0 1rem;
  }
  & .MuiExpansionPanelSummary-content,
  & .MuiExpansionPanelSummary-content.Mui-expanded {
    margin: 0;
  }
  & .MuiExpansionPanelSummary-expandIcon {
    padding: 0 12px;
  }
  & .MuiExpansionPanelDetails-root {
    padding: 0;
  }
`;

const input = css`
  &.MuiFormControl-root {
    width: 100%;
  }
`;

export interface IMessage {
  text: string;
  from: string;
  timestamp: number;
}

interface IProps {
  messages: Array<IMessage>;
  onMessageSend: (message: IMessage) => void;
}

export const Chat: React.FC<IProps> = props => {
  const chatManager = useChat();
  const [inputValue, setInputValue] = useState("");
  const isNameEmpty = chatManager.name === "";

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isNameEmpty) {
      chatManager.saveName(inputValue);
    } else {
      const now = new Date().getTime();
      const text = getText(inputValue);
      props.onMessageSend?.({
        text: text,
        from: chatManager.name,
        timestamp: now
      });
    }
    setInputValue("");
  };
  return (
    <div className={chatContainer}>
      <ExpansionPanel className={expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={expansionPanelSummary}
        >
          <span>Chat</span>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={expansionPanelDetails}>
          <div className={chatDetailsContainer}>
            <div className={chatDetailsMessages}>
              {props.messages.map((message, i) => {
                return (
                  <div key={i}>
                    <b>{message.from}: </b>
                    <span>{message.text}</span>
                  </div>
                );
              })}
            </div>
            <div className={chatDetailsControls}>
              <form onSubmit={onSubmit}>
                <div className="row bottom-xs">
                  <div className="col-xs-10">
                    <TextField
                      className={input}
                      size="small"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={
                        isNameEmpty
                          ? "What's your name ?"
                          : "Write a message..."
                      }
                    />
                  </div>
                  <div className="col-xs-2">
                    <IconButton
                      aria-label="Send"
                      type="submit"
                      className={css`
                        &.MuiIconButton-root {
                          padding: 0.5rem;
                        }
                      `}
                    >
                      <SendIcon />
                    </IconButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

Chat.displayName = "Chat";

function getText(inputValue: string) {
  if (inputValue === "roll") {
    const first = Math.floor((Math.random() * 100) % 3);
    const second = Math.floor((Math.random() * 100) % 3);
    const third = Math.floor((Math.random() * 100) % 3);
    const fourth = Math.floor((Math.random() * 100) % 3);

    const firstText = FudgeText[first];
    const secondText = FudgeText[second];
    const thirdText = FudgeText[third];
    const fourthText = FudgeText[fourth];
    return `${firstText}-${secondText}-${thirdText}-${fourthText}`;
  }
  return inputValue;
}

const FudgeText = {
  0: "-1",
  1: "+0",
  2: "+1"
};
