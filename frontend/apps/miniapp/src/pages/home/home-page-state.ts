export interface HomePageState {
  readonly description: string;
  readonly eyebrow: string;
  readonly status: string;
  readonly title: string;
}

export function createHomePageState(): HomePageState {
  return Object.freeze({
    description: "当前为原生微信小程序应用壳，业务功能将按验收计划逐步实现。",
    eyebrow: "门店竹签清点",
    status: "前端工程已就绪",
    title: "数得快",
  });
}
