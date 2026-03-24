import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { extractTinderMetrics, validateTinderExport } from "./metrics";

const sampleExport = JSON.parse(
  readFileSync(resolve(process.cwd(), "data/Joan/data.json"), "utf8"),
);

describe("validateTinderExport", () => {
  it("accepts the provided Tinder export fixture", () => {
    expect(validateTinderExport(sampleExport)).toBeTruthy();
  });

  it("rejects malformed usage data", () => {
    expect(() =>
      validateTinderExport({
        Usage: {
          swipes_likes: { "2026-01-01": "nope" },
          swipes_passes: {},
        },
        Messages: [],
      }),
    ).toThrow(/Unsupported file/);
  });
});

describe("extractTinderMetrics", () => {
  it("extracts deterministic metrics from the sample export", () => {
    const metrics = extractTinderMetrics(validateTinderExport(sampleExport));

    expect(metrics).toEqual({
      totalSwipes: 78402,
      leftSwipes: 3575,
      rightSwipes: 74827,
      matches: 952,
      noMatch: 73875,
      chats: 160,
      noChats: 792,
    });
  });

  it("clamps no-match counts to zero for inconsistent input", () => {
    const metrics = extractTinderMetrics(
      validateTinderExport({
        Usage: {
          swipes_likes: { "2026-01-01": 1 },
          swipes_passes: { "2026-01-01": 2 },
        },
        Messages: [{ messages: [] }, { messages: [{ message: "hi" }] }],
      }),
    );

    expect(metrics.noMatch).toBe(0);
    expect(metrics.chats).toBe(0);
    expect(metrics.noChats).toBe(2);
  });
});
