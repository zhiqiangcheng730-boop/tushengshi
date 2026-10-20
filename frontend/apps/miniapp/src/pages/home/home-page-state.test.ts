import { describe, expect, it } from "vitest";

import { createHomePageState } from "./home-page-state";

describe("createHomePageState", () => {
  it("should return the deterministic application-shell state", () => {
    const state = createHomePageState();

    expect(state).toEqual({
      description: "当前为原生微信小程序应用壳，业务功能将按验收计划逐步实现。",
      eyebrow: "门店竹签清点",
      status: "前端工程已就绪",
      title: "数得快",
    });
    expect(Object.isFrozen(state)).toBe(true);
  });

  it("should create an independent immutable state for each page instance", () => {
    const firstState = createHomePageState();
    const secondState = createHomePageState();

    expect(firstState).not.toBe(secondState);
    expect(secondState).toEqual(firstState);
  });
});
