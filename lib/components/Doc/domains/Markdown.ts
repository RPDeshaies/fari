import kebabCase from "lodash/kebabCase";
import truncate from "lodash/truncate";
import marked from "marked";

export type IMarkdownIndexes = {
  tree: Array<IMarkdownIndex>;
  flat: Array<IMarkdownIndex>;
};

export type IMarkdownIndex = {
  id: string;
  label: string;
  preview: string;
  level: number;
  url: string | undefined;
  pageLabel: string | undefined;
  children: Array<IMarkdownIndex>;
};

export const Markdown = {
  process(props: {
    markdown: string;
    prefix: string;
  }): { dom: HTMLDivElement; markdownIndexes: IMarkdownIndexes } {
    const html = marked(props.markdown);
    const dom = document.createElement("div");
    dom.innerHTML = html;

    const allHeaders = dom.querySelectorAll("h1,h2,h3,h4,h5,h6");

    const treeReferences: Array<IMarkdownIndex> = [];
    const flatReferences: Array<IMarkdownIndex> = [];

    let latestH1: IMarkdownIndex | undefined;
    let latestH2: IMarkdownIndex | undefined;
    let latestParent: IMarkdownIndex | undefined;

    try {
      allHeaders.forEach((element, index) => {
        const currentNode: IMarkdownIndex = getNode({
          element: element,
          prefix: props.prefix,
          latestH1: latestH1,
          latestH2: latestH2,
        });

        if (index === 0 && currentNode.level !== 1) {
          throw "Document doesn't start with an H1";
        }

        flatReferences.push(currentNode);
        const isHigherLevel = !flatReferences.some(
          (n) => n.level < currentNode.level
        );
        if (isHigherLevel) {
          treeReferences.push(currentNode);
          latestParent = undefined;
        }

        if (!!latestParent) {
          const isNodeHigherInHierarchy =
            latestParent.level >= currentNode.level;
          if (isNodeHigherInHierarchy) {
            const indexWithHigherLevelFromEnd = [...flatReferences]
              .reverse()
              .find((i) => i.level < currentNode.level);
            latestParent = indexWithHigherLevelFromEnd;
          }
          latestParent?.children.push(currentNode);
        }
        latestParent = currentNode;

        if (currentNode.level === 1) {
          latestH1 = currentNode;
        }
        if (currentNode.level === 2) {
          latestH2 = currentNode;
        }

        const anchor = makeHeaderAnchor(element);
        element.append(anchor);
      });
    } catch (error) {
      return {
        dom: document.createElement("div"),
        markdownIndexes: {
          flat: [],
          tree: [],
        },
      };
    }

    // dynamic anchors
    const allElementsWithDynamicAnchor = dom.querySelectorAll(".with-anchor");
    allElementsWithDynamicAnchor.forEach((element) => {
      element.id = kebabCase(element.textContent ?? "");
      const anchor = makeHeaderAnchor(element);
      element.append(anchor);
    });

    const markdownIndexes: IMarkdownIndexes = {
      tree: treeReferences,
      flat: flatReferences,
    };

    return { dom, markdownIndexes };
  },
  getPage(props: {
    prefix: string;
    dom: HTMLDivElement | undefined;
    page: string | undefined;
    section: string | undefined | null;
  }) {
    const pageSelector = "h1";
    const pageElements =
      props.dom?.querySelectorAll(pageSelector) ??
      (([] as unknown) as NodeListOf<Element>);

    if (!!props.dom && pageElements.length === 0) {
      throw `useMarkdownPage: no "${pageSelector}" in the markdown document`;
    }

    const currentPageSelector = `[id='${props.page}']`;

    const currentPageElement =
      props.dom?.querySelector(currentPageSelector) ?? pageElements[0];

    const textAfterCurrentPage = getFirstMatchAfterElementWithPredicate(
      currentPageElement,
      (elem) => !!elem?.textContent
    );

    const currentSectionElement =
      props.dom?.querySelector(`[id='${props.section}']`) ?? undefined;
    const textAfterCurrentSection = getFirstMatchAfterElementWithPredicate(
      currentSectionElement,
      (elem) => !!elem?.textContent
    );

    const title =
      currentSectionElement?.textContent ??
      currentPageElement?.textContent ??
      "";
    const firstParagraph =
      textAfterCurrentSection?.textContent ??
      textAfterCurrentPage?.textContent ??
      "";

    const description = truncate(firstParagraph, { length: 155 });

    if (!currentPageElement) {
      return {
        pageDom: undefined,
        pageId: undefined,
        title: title.trim(),
        description: description.trim(),
        image: undefined,
      };
    }

    let nextPageId: string | undefined;

    pageElements.forEach((h, index) => {
      if (h.id === currentPageElement.id) {
        nextPageId = pageElements[index + 1]?.id;
      }
    });

    const allDomElementsInPage = getAllNextSiblingUntilId(
      currentPageElement,
      `${nextPageId}`
    );
    const pageDom = getPageDom(currentPageElement, allDomElementsInPage);
    const pageMetaOriginalElement = pageDom.querySelector("page-meta");
    const author = pageMetaOriginalElement?.getAttribute("author");
    const date = pageMetaOriginalElement?.getAttribute("date");
    const image = pageMetaOriginalElement?.getAttribute("image");

    if (author) {
      const metaDom = document.createElement("div");
      metaDom.className = "page-meta";
      const dateSection = date ? ` • ${date}` : "";

      metaDom.innerHTML = `By ${author}${dateSection}`;
      pageDom.querySelector("h1")?.after(metaDom);
    }
    return {
      pageDom: pageDom,
      pageId: currentPageElement.id,
      title: title.trim(),
      description: description.trim(),
      image: image,
    };
  },
};

function getNode(props: {
  element: Element;
  prefix: string;
  latestH1: IMarkdownIndex | undefined;
  latestH2: IMarkdownIndex | undefined;
}) {
  const level = getElementLevel(props.element);
  const label = props.element.textContent ?? "";
  const nextElement = props.element.nextElementSibling;
  const canPreviewNextElement = isElementHeader(nextElement);
  const preview = canPreviewNextElement
    ? nextElement?.textContent?.trim() ?? ""
    : "";

  const url = getNodeUrl(props);

  const currentNode: IMarkdownIndex = {
    id: props.element.id,
    label: label,
    preview: preview,
    level: level,
    url: url,
    pageLabel: level !== 1 ? props.latestH1?.label : undefined,
    children: [],
  };
  return currentNode;
}

function getNodeUrl(props: {
  element: Element;
  prefix: string;
  latestH1: IMarkdownIndex | undefined;
  latestH2: IMarkdownIndex | undefined;
}) {
  const level = getElementLevel(props.element);
  const id = props.element.id;

  if (level === 1) {
    return `${props.prefix}/${id}`;
  }

  return `${props.prefix}/${props.latestH1?.id}?goTo=${id}`;
}

function makeHeaderAnchor(element: Element) {
  const anchor = document.createElement("a");
  anchor.className = "anchor";
  anchor.href = `#${element.id}`;
  return anchor;
}

function isElementHeader(nextElement: Element | null) {
  return !nextElement?.tagName.startsWith("H");
}

function getElementLevel(element: Element) {
  return parseInt(element.tagName.replace("H", ""));
}

function getPageDom(currentH1: Element, allElementsInPage: Element[]) {
  const newDom = document.createElement("div");
  newDom.append(currentH1?.cloneNode(true)!);
  allElementsInPage.forEach((e) => {
    newDom.append(e.cloneNode(true));
  });

  return newDom;
}

function getAllNextSiblingUntilId(
  elem: Element | undefined | null,
  id: string
) {
  return getAllNextSiblingUntilSelector(elem, `[id='${id}']`);
}

function getAllNextSiblingUntilSelector(
  elem: Element | undefined | null,
  selector: string
) {
  const siblings: Array<Element> = [];

  let currentElement = elem?.nextElementSibling;

  while (currentElement) {
    if (currentElement.matches(selector)) break;

    siblings.push(currentElement);

    currentElement = currentElement.nextElementSibling;
  }

  return siblings;
}

function getFirstMatchAfterElementWithPredicate(
  elem: Element | undefined | null,
  predicate: (elem: Element | undefined | null) => boolean
): Element | undefined {
  let currentElement = elem?.nextElementSibling;

  while (currentElement) {
    if (predicate(currentElement)) {
      return currentElement;
    }

    currentElement = currentElement.nextElementSibling;
  }
}

function getFirstMatchAfterElementSelector(
  elem: Element | undefined | null,
  selector: string
): Element | undefined {
  return getFirstMatchAfterElementWithPredicate(
    elem,
    (elem) => elem?.matches(selector) ?? false
  );
}

function getFirstMatchBeforeElement(
  elem: Element | undefined | null,
  selector: string
): Element | undefined {
  let currentElement = elem?.previousElementSibling;

  while (currentElement) {
    if (currentElement.matches(selector)) {
      return currentElement;
    }

    currentElement = currentElement.previousElementSibling;
  }
}
