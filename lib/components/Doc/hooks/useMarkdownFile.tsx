import { useEffect, useState } from "react";
import { useLogger } from "../../../contexts/InjectionsContext/hooks/useLogger";
import {
  IMarkdownIndexes,
  Markdown,
  MarkdownDocMode,
} from "../domains/Markdown";

export type ILoadFunction = () => Promise<string>;

export function useMarkdownFile(props: {
  loadFunction: ILoadFunction;
  prefix: string;
  docMode: MarkdownDocMode;
}) {
  const [dom, setDom] = useState<HTMLDivElement>();
  const [html, setHtml] = useState<string | undefined>();
  const [markdownIndexes, setMarkdownIndexes] = useState<IMarkdownIndexes>({
    tree: [],
    flat: [],
  });
  const logger = useLogger();

  useEffect(() => {
    load();
    async function load() {
      if (props.loadFunction) {
        try {
          const markdown = await props.loadFunction();

          if (markdown) {
            const { dom, markdownIndexes } = Markdown.process({
              markdown: markdown,
              prefix: props.prefix,
              docMode: props.docMode,
            });
            setDom(dom);
            setHtml(dom.innerHTML);
            setMarkdownIndexes(markdownIndexes);
          }
        } catch (error) {
          logger.error("useMarkdownFile:error", error);
        }
      }
    }
  }, [props.loadFunction]);

  return { dom, html, markdownIndexes };
}

export const scrollMarginTop = 16;
