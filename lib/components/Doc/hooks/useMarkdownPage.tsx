import { useMemo } from "react";
import { useLogger } from "../../../contexts/InjectionsContext/hooks/useLogger";
import { Markdown } from "../domains/Markdown";

export function useMarkdownPage(props: {
  url: string;
  page: string | undefined;
  section: string | undefined | null;
  dom: HTMLDivElement | undefined;
}): ReturnType<typeof Markdown["getPage"]> {
  const logger = useLogger();

  return useMemo(() => {
    try {
      const result = Markdown.getPage({
        prefix: props.url,
        dom: props.dom,
        page: props.page,
        section: props.section,
      });
      return result;
    } catch (error) {
      logger.error(error);
      const errorHtml =
        "<h1>Error</h1><p>There was an error processing this document</p>";
      const dom = document.createElement("div");
      dom.innerHTML = errorHtml;

      return {
        title: "Error",
        description: "Document Error",
        pageDom: dom,
        currentPage: undefined,
      };
    }
  }, [props.url, props.dom, props.page, props.section]);
}
