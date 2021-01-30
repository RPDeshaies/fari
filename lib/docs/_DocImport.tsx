export const DocImport = {
  FateCondensed: () => {
    return import("./fate-condensed.md");
  },
  FateCore: () => {
    return import("./fate-core.md");
  },
  FateAccelerated: () => {
    return import("./fate-accelerated.md");
  },
  FateAdversaryToolkit: () => {
    return import("./fate-adversary-toolkit.md");
  },
  FateSystemToolkit: () => {
    return import("./fate-system-toolkit.md");
  },
  FateStunts: () => {
    return import("./fate-stunts.md");
  },
  SeelieSquire: () => {
    return import("./seelie-squire.md");
  },
  SceneCheckist: () => {
    return import("./scene-checklist.md");
  },
  CheatSheet: () => {
    return import("./cheat-sheet.md");
  },
  Dials: () => {
    return import("./dials.md");
  },
  FateFaq: () => {
    return import("./fate-wiki.md");
  },
  Test: () => {
    return import("./test.md");
  },
  TestEmpty: () => {
    return import("./test-empty.md");
  },
  Changelog: () => {
    return import("../../CHANGELOG.md");
  },
};
