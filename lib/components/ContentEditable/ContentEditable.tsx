import { css, cx } from "@emotion/css";
import { useTheme } from "@material-ui/core/styles";
import DOMPurify from "dompurify";
import lowerCase from "lodash/lowerCase";
import startCase from "lodash/startCase";
import truncate from "lodash/truncate";
import React, { useEffect, useRef, useState } from "react";
import { IDataCyProps } from "../../domains/cypress/types/IDataCyProps";

const DOMPurifyOptions = {
  ALLOWED_TAGS: ["br", "img"],
};
const ContentEditableDelay = 125;

type IPreviewContentEditableOptions = {
  value: string | undefined;
  length?: number;
};

export function previewContentEditable(
  options: IPreviewContentEditableOptions
) {
  if (!options.value) {
    return "";
  }
  const valueWithoutBrTags = options.value.split("<br>").join(" ").trim();

  const div = document.createElement("div");
  div.innerHTML = valueWithoutBrTags;
  const content = div.textContent ?? "";

  const formattedContent = startCase(lowerCase(content));

  if (options.length) {
    return truncate(formattedContent, { length: options.length });
  }

  return formattedContent;
}

export const ContentEditablePreview: React.FC<IPreviewContentEditableOptions> = React.memo(
  (props) => {
    const content = previewContentEditable({
      value: props.value,
      length: props.length,
    });
    return <>{content}</>;
  }
);

export const ContentEditable: React.FC<
  {
    value: string;
    className?: string;
    onClick?: () => void;
    onChange?: (value: string, event: React.FormEvent<HTMLDivElement>) => void;
    readonly?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    inline?: boolean;
    border?: boolean;
    underline?: boolean;
    id?: string;
  } & IDataCyProps
> = (props) => {
  const theme = useTheme();
  const $ref = useRef<HTMLSpanElement | null>(null);
  const timeout = useRef<any | undefined>(undefined);
  const [updating, setUpdating] = useState(false);
  const latestProps = useRef(props);

  const hasCursorPointer = props.readonly && props.onClick;

  useEffect(() => {
    latestProps.current = props;
  });

  useEffect(() => {
    if ($ref.current) {
      if (!props.value && props.readonly) {
        $ref.current.innerHTML = "&nbsp;";
      } else if ($ref.current.innerHTML !== props.value) {
        const cleanHTML = DOMPurify.sanitize(props.value, DOMPurifyOptions);
        $ref.current.innerHTML = cleanHTML;
      }
    }
  }, [props.value, props.readonly]);

  useEffect(() => {
    function focusOnLoad() {
      if ($ref.current && props.autoFocus) {
        $ref.current.focus();
      }
    }
    focusOnLoad();
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  function onChange(e: any) {
    if ($ref.current) {
      clearTimeout(timeout.current);
      const cleanHTML = DOMPurify.sanitize(
        $ref.current.innerHTML,
        DOMPurifyOptions
      );

      setUpdating(true);
      timeout.current = setTimeout(() => {
        latestProps.current.onChange?.(cleanHTML, e);
        setUpdating(false);
      }, ContentEditableDelay);
    }
  }

  return (
    <span
      data-cy={props["data-cy"]}
      className={cx(
        css({
          "outline": "none",
          "wordBreak": "break-word",
          "display": "inline-block",
          "width": "100%",
          "cursor": hasCursorPointer ? "pointer" : "text",
          "color": "inherit",
          "textDecoration": props.underline ? "underline" : undefined,
          "transition": !updating
            ? theme.transitions.create("color", { duration: 500 })
            : undefined,
          "borderBottom": props.border
            ? `1px solid ${theme.palette.divider}`
            : undefined,
          "img": {
            maxWidth: "75%",
            padding: ".5rem",
            margin: "0 auto",
            display: "flex",
          },
          "&:empty:before": {
            color: "lightgrey",
            content: props.placeholder ? `"${props.placeholder}"` : undefined,
          },
        }),
        props.className
      )}
      id={props.id}
      ref={$ref}
      onClick={() => {
        if (props.readonly) {
          props.onClick?.();
        }
      }}
      onInput={(e) => {
        onChange(e);
      }}
      contentEditable={!props.readonly}
    />
  );
};
ContentEditable.displayName = "ContentEditable";

// export function sanitizeContentEditable(value: string | undefined) {
//   if (!value) {
//     return "";
//   }
//   return removeHTMLTags(removeNBSP(value)).trim();
// }

// function removeNBSP(value: string) {
//   return value.replace(/&nbsp;/g, " ");
// }

// function removeHTMLTags(value: string) {
//   return value.replace(/<\/?[^>]+(>|$)/g, " ");
// }
