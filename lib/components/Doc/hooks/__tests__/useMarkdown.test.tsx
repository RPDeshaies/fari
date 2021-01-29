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

describe("useMarkdownFile", () => {
  describe("Given I have an undefined markdown file", () => {
    it("should return an undefined state", async () => {
      const view = renderHook(() => {
        return useMarkdownFile(anUndefinedMarkdownFile, "/test-doc");
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
        return useMarkdownFile(undefined as any, "/test-doc");
      });

      expect(view.result.current.html).toEqual(undefined);
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toEqual(undefined);
    });
  });
  describe("Given I have an empty markdown file", () => {
    it("should return an undefined state", () => {
      const view = renderHook(() => {
        return useMarkdownFile(anEmptyMarkdownFile, "/test-doc");
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
          return useMarkdownFile(aMarkdownFileWithoutAHeader1, "/test-doc");
        },
        {
          wrapper: wrapper,
        }
      );

      view.waitFor(() => {
        expect(fakeLogger.error).toHaveBeenCalledWith("");
      });
      expect(view.result.current.html).toEqual(undefined);
      expect(view.result.current.markdownIndexes.flat).toEqual([]);
      expect(view.result.current.markdownIndexes.tree).toEqual([]);
      expect(view.result.current.dom).toEqual(undefined);
    });
  });
  describe("Given I have a markdown file with a dynamic anchor tag", () => {
    it("should add an anchor at the tag matching the id", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile(aMarkdownFileWithADynamicAnchor, "/test-doc");
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
  describe("Given I have a markdown file with a dynamic table of content element", () => {
    it("should add a table of content", async () => {
      const view = renderHook(
        () => {
          return useMarkdownFile(
            aMarkdownFileWithADynamicTableOfContent,
            "/test-doc"
          );
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
      const view = renderHook(() => {
        return useMarkdownFile(aComplexeMarkdownFile, "/test-doc");
      });
      await view.waitForValueToChange(() => view.result.current.html);

      expect(view.result.current.html).toMatchSnapshot();
      expect(view.result.current.dom).toMatchSnapshot();
    });
  });
  describe("Given I hierarcy formatted markdown file", () => {
    it("should return an good state", async () => {
      const view = renderHook(() => {
        return useMarkdownFile(aMarkdownFileInHierarchy, "/test-doc");
      });
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
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(anEmptyMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: "", section: "", dom: dom });
      });

      expect(view.result.current.title).toEqual("");
      expect(view.result.current.description).toEqual("");
      expect(view.result.current.currentPage).toEqual(undefined);
      expect(view.result.current.previousPage).toEqual(undefined);
      expect(view.result.current.nextPage).toEqual(undefined);
    });
  });
  describe("Given an undefined page", () => {
    it("should default to first h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(anUndefinedMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: undefined, section: "", dom: dom });
      });

      expect(view.result.current.title).toEqual("");
      expect(view.result.current.description).toEqual("");
      expect(view.result.current.currentPage).toEqual(undefined);
      expect(view.result.current.previousPage).toEqual(undefined);
      expect(view.result.current.nextPage).toEqual(undefined);
    });
  });
  describe("Given an undefined page", () => {
    it("should default to first h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(aComplexeMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: undefined, section: "", dom: dom });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header_1");
      expect(view.result.current.description).toEqual("[header_1.text]");
      expect(view.result.current.currentPage.textContent).toEqual("header_1");
      expect(view.result.current.previousPage).toEqual(undefined);
      expect(view.result.current.nextPage?.textContent).toEqual("header_2");
    });
  });
  describe("Given the first page page", () => {
    it("should go to first h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(aComplexeMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: undefined, section: "", dom: dom });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header_1");
      expect(view.result.current.description).toEqual("[header_1.text]");
      expect(view.result.current.currentPage.textContent).toEqual("header_1");
      expect(view.result.current.previousPage).toEqual(undefined);
      expect(view.result.current.nextPage?.textContent).toEqual("header_2");
    });
  });
  describe("Given the second page", () => {
    it("should go to second h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(aComplexeMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: "header_2", section: "", dom });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header_2");
      expect(view.result.current.description).toEqual("[header_2.text]");
      expect(view.result.current.currentPage.textContent).toEqual("header_2");
      expect(view.result.current.previousPage?.textContent).toEqual("header_1");
      expect(view.result.current.nextPage?.textContent).toEqual("header_3");
    });
  });
  describe("Given the third page", () => {
    it("should go to third h1", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(aComplexeMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: "header_3", section: "", dom });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("header_3");
      expect(view.result.current.description).toEqual("[header_3.text]");
      expect(view.result.current.currentPage.textContent).toEqual("header_3");
      expect(view.result.current.previousPage?.textContent).toEqual("header_2");
      expect(view.result.current.nextPage).toEqual(undefined);
    });
  });
  describe("Given the third page and there is a section", () => {
    it("should go to third h1 and have the right title and description", async () => {
      const view = renderHook(() => {
        const { dom } = useMarkdownFile(aComplexeMarkdownFile, "/test-doc");

        return useMarkdownPage({ page: "header_3", section: "rage", dom });
      });

      await view.waitForNextUpdate();
      expect(view.result.current.title).toEqual("Rage");
      expect(view.result.current.description).toEqual(
        "Berserk Rage. When you suffer a physical consequence, you can invoke that consequence for free on your next attack. If you suffer multiple physical con..."
      );
      expect(view.result.current.currentPage.textContent).toEqual("header_3");
      expect(view.result.current.previousPage?.textContent).toEqual("header_2");
      expect(view.result.current.nextPage).toEqual(undefined);
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
# header_1

[header_1.text]

## header_1_1

[header_1_2.text]

## header_1_2

[header_1_2.text]

### header_1_2_1

### header_1_2_2

### header_1_2_3

# header_2

[header_2.text]

# header_3

[header_3.text]

- bullet 1
- bullet 2

## Rage

- **Berserk Rage**. When you suffer a physical consequence, you can invoke that consequence for free on your next attack. If you suffer multiple physical consequences, you get a free invocation for each. (Fate System Toolkit, p.34)

`);

const aMarkdownFileInHierarchy = makeLoadFunction(`
# header_1
## header_2
### header_3
#### header_4
##### header_5
###### header_6

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

const aMarkdownFileWithADynamicTableOfContent = makeLoadFunction(`
# 1

<toc/>

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
