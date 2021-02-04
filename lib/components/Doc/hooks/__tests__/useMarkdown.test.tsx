/**
 * @jest-environment jsdom
 */
/* eslint-disable react/display-name */

import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { InjectionsContext } from "../../../../contexts/InjectionsContext/InjectionsContext";
import { useMarkdownFile } from "../useMarkdownFile";
import { useMarkdownPage } from "../useMarkdownPage";

const fakeLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

beforeEach(() => {
  fakeLogger.debug.mockReset();
  fakeLogger.info.mockReset();
  fakeLogger.warn.mockReset();
  fakeLogger.error.mockReset();
});

describe("Given I want use the autocomplete indexes", () => {
  it("should give me good indexes", async () => {
    const view = renderHook(() => {
      return useMarkdownFile({
        loadFunction: aWiki,
        prefix: "/prefix",
      });
    });

    await view.waitForNextUpdate();

    expect(
      view.result.current.markdownIndexes.flat.map((i) => {
        return {
          label: i.label,
          url: i.url,
        };
      })
    ).toEqual([
      { label: "Wiki", url: "/prefix/wiki" },
      { label: "FAQ", url: "/prefix/faq" },
      { label: "Question 1", url: "/prefix/faq?goTo=question-1" },
      { label: "Question 2", url: "/prefix/faq?goTo=question-2" },
      { label: "Question 3", url: "/prefix/faq?goTo=question-3" },
      {
        label: "Question 3 Explanation",
        url: "/prefix/faq?goTo=question-3-explanation",
      },
      { label: "Tips and Tricks", url: "/prefix/tips-and-tricks" },
      { label: "Tip 1", url: "/prefix/tips-and-tricks?goTo=tip-1" },
      { label: "Tip 2", url: "/prefix/tips-and-tricks?goTo=tip-2" },
      { label: "Tip 3", url: "/prefix/tips-and-tricks?goTo=tip-3" },
      {
        label: "Question 3 Explanation",
        url: "/prefix/tips-and-tricks?goTo=question-3-explanation-1",
      },
    ]);
  });
});

describe("useMarkdownFile", () => {
  describe("Given I have an undefined markdown file", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(() => {
        return useMarkdownFile({
          loadFunction: anUndefinedMarkdownFile,
          prefix: "/test-doc",
        });
      });

      expect(view.result.current.html).toEqual(undefined);
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toEqual(undefined);
    });
  });
  describe("Given I dont have a load function", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(() => {
        return useMarkdownFile({
          loadFunction: undefined as any,
          prefix: "/test-doc",
        });
      });

      expect(view.result.current.html).toEqual(undefined);
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toEqual(undefined);
    });
  });
  describe("Given I have an empty markdown file", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(() => {
        return useMarkdownFile({
          loadFunction: anEmptyMarkdownFile,
          prefix: "/test-doc",
        });
      });

      expect(view.result.current.html).toEqual(undefined);
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toEqual(undefined);
    });
  });
  describe("Given I have a markdown file without h1", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile({
            loadFunction: aMarkdownFileWithoutAHeader1,
            prefix: "/test-doc",
          });
        },
        {
          wrapper: wrapper,
        }
      );
      await view.waitForValueToChange(() => view.result.current.html);

      expect(view.result.current.html).toMatchSnapshot();
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toMatchSnapshot();
    });
  });
  describe("Given I have a markdown file with a dynamic anchor tag", () => {
    it("should add an anchor at the tag matching the id", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile({
            loadFunction: aMarkdownFileWithADynamicAnchor,
            prefix: "/test-doc",
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForValueToChange(() => view.result.current.html);
      expect(view.result.current.html).toMatchSnapshot();
      expect(
        view.result.current.dom
          ?.querySelector("#something-important .anchor")
          ?.getAttribute("href")
      ).toEqual("#something-important");
    });
  });
  describe("Given I have a markdown file with a dynamic table of contents element", () => {
    it("should add a table of contents", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile({
            loadFunction: aMarkdownFileWithADynamicTableOfContents,
            prefix: "/test-doc",
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForValueToChange(() => view.result.current.html);
      expect(view.result.current.dom?.querySelector(".toc")).toMatchSnapshot();
    });
  });
  describe("Given I properly formatted markdown file", () => {
    it("should return an good state", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile({
            loadFunction: aComplexeMarkdownFile,
            prefix: "/test-doc",
          });
        },
        {
          wrapper: wrapper,
        }
      );
      await view.waitForValueToChange(() => view.result.current.html);

      expect(view.result.current.html).toMatchSnapshot();
      expect(view.result.current.dom).toMatchSnapshot();
    });
  });
  describe("Given I hierarchy formatted markdown file", () => {
    it("should return an good state", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile({
            loadFunction: aMarkdownFileInHierarchy,
            prefix: "/test-doc",
          });
        },
        {
          wrapper: wrapper,
        }
      );
      await view.waitForValueToChange(() => view.result.current.html);

      expect(view.result.current.html).toMatchSnapshot();
      expect(view.result.current.dom).toMatchSnapshot();
      expect(view.result.current.markdownIndexes.flat).toMatchSnapshot(
        "markdownIndexes.flat"
      );
      expect(view.result.current.markdownIndexes.tree).toMatchSnapshot(
        "markdownIndexes.tree"
      );
    });
  });
});

describe("useMarkdownPage", () => {
  describe("Given an empty page", () => {
    it("should default to first h1", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: anEmptyMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: "",
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      expect(view.result.current.title).toEqual("");
      expect(view.result.current.description).toEqual("");
      expect(view.result.current.currentPage).toEqual(undefined);
    });
  });
  describe("Given an undefined page for an undefined markdown file", () => {
    it("should default to first h1", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: anUndefinedMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: undefined,
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      expect(view.result.current.title).toEqual("");
      expect(view.result.current.description).toEqual("");
      expect(view.result.current.currentPage).toEqual(undefined);
    });
  });
  describe("Given I have a markdown file without h1", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: aMarkdownFileWithoutAHeader1,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: undefined,
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForValueToChange(
        () => view.result.current.pageDom?.innerHTML
      );
      expect(fakeLogger.error).toHaveBeenCalledWith(
        'useMarkdownPage: no "h1" in the markdown document'
      );
      expect(view.result.current.title).toEqual("Error");
      expect(view.result.current.description).toEqual("Document Error");
      expect(view.result.current.pageDom?.innerHTML).toEqual(
        `<h1>Error</h1><p>There was an error processing this document</p>`
      );
      expect(view.result.current.currentPage).toEqual(undefined);
    });
  });

  describe("Given an undefined page with a good markdown page", () => {
    it("should default to first h1", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: aComplexeMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: undefined,
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header-1");
      expect(view.result.current.description).toEqual("[header-1.text]");
      expect(view.result.current.currentPage?.label).toEqual("header-1");
    });
  });
  describe("Given the first page page", () => {
    it("should go to first h1", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: aComplexeMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: "header-1",
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header-1");
      expect(view.result.current.description).toEqual("[header-1.text]");
      expect(view.result.current.currentPage?.label).toEqual("header-1");
    });
  });
  describe("Given the second page", () => {
    it("should go to second h1", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: aComplexeMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: "header-2",
            section: "",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header-2");
      expect(view.result.current.description).toEqual("[header-2.text]");
      expect(view.result.current.currentPage?.label).toEqual("header-2");
    });
  });
  describe("Given the third page", () => {
    it("should go to third h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile({
          loadFunction: aComplexeMarkdownFile,
          prefix: "/test-doc",
        });

        return useMarkdownPage({
          page: "header-3",
          section: "",
          url: "test-doc",
          dom: dom,
        });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header-3");
      expect(view.result.current.description).toEqual("[header-3.text]");
      expect(view.result.current.currentPage?.label).toEqual("header-3");
    });
  });
  describe("Given the third page and there is a section", () => {
    it("should go to third h1 and have the right title and description", async () => {
      const view = renderHook(
        () => {
          const { dom } = useMarkdownFile({
            loadFunction: aComplexeMarkdownFile,
            prefix: "/test-doc",
          });

          return useMarkdownPage({
            page: "header-3",
            section: "rage",
            url: "test-doc",
            dom: dom,
          });
        },
        {
          wrapper: wrapper,
        }
      );

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("Rage");
      expect(view.result.current.description).toEqual(
        "Berserk Rage. When you suffer a physical consequence, you can invoke that consequence for free on your next attack. If you suffer multiple physical con..."
      );
      expect(view.result.current.currentPage?.label).toEqual("header-3");
    });
  });
});

const wrapper = (props: { children?: React.ReactNode }): JSX.Element => {
  return (
    <InjectionsContext.Provider value={{ logger: fakeLogger } as any}>
      {props.children}
    </InjectionsContext.Provider>
  );
};

function makeLoadFunction(markdownFile: string | undefined) {
  return async () => new Promise<string>((r) => r(markdownFile as string));
}

const anUndefinedMarkdownFile = makeLoadFunction(undefined);
const anEmptyMarkdownFile = makeLoadFunction("");
const aComplexeMarkdownFile = makeLoadFunction(`
# header-1

[header-1.text]

## header-1-1

[header-1-2.text]

## header-1-2

[header-1-2.text]

### header-1-2-1

### header-1-2-2

### header-1-2-3

# header-2

[header-2.text]

# header-3

[header-3.text]

- bullet 1
- bullet 2

## Rage

- **Berserk Rage**. When you suffer a physical consequence, you can invoke that consequence for free on your next attack. If you suffer multiple physical consequences, you get a free invocation for each. (Fate System Toolkit, p.34)

`);

const aMarkdownFileInHierarchy = makeLoadFunction(`
# header-1
## header-2
### header-3
#### header-4
##### header-5
###### header-6

# again_1
## again_2
## again_2
### again_3
### again_3
#### again_4
#### again_4
##### again_5
##### again_5
###### again_6
###### again_6

`);

const aMarkdownFileWithoutAHeader1 = makeLoadFunction(`
## Header 2

Header 2 details
`);

const aMarkdownFileWithADynamicAnchor = makeLoadFunction(`
# Header 1

<p class="with-anchor">something important</p>
`);

const aMarkdownFileWithADynamicTableOfContents = makeLoadFunction(`
# 1

<toc></toc>

## 1.1

## 1.2

## 1.3

# 2

## 2.1
## 2.2
## 2.3

# 3

# 4

`);

const aWiki = makeLoadFunction(`
# Wiki

# FAQ

## Question 1

## Question 2

## Question 3

### Question 3 Explanation

# Tips and Tricks

## Tip 1

## Tip 2

## Tip 3

### Question 3 Explanation

`);
