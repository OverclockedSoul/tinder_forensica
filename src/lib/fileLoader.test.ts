import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { parseTinderFile } from "./fileLoader";

const samplePayload = {
  Usage: {
    swipes_likes: { "2026-01-01": 5 },
    swipes_passes: { "2026-01-01": 3 },
  },
  Messages: [
    { messages: [] },
    { messages: [{ message: "hey" }] },
    { messages: new Array(5).fill({ message: "x" }) },
  ],
};

describe("parseTinderFile", () => {
  it("parses plain json uploads", async () => {
    const file = new File([JSON.stringify(samplePayload)], "data.json", {
      type: "application/json",
    });

    await expect(parseTinderFile(file)).resolves.toMatchObject({
      totalSwipes: 8,
      chats: 1,
      noChats: 2,
    });
  });

  it("parses zip uploads containing data.json", async () => {
    const archive = new JSZip();
    archive.file("folder/data.json", JSON.stringify(samplePayload));
    const zipBytes = await archive.generateAsync({ type: "uint8array" });
    const file = new File([zipBytes], "myData.zip", { type: "application/zip" });

    await expect(parseTinderFile(file)).resolves.toMatchObject({
      totalSwipes: 8,
      chats: 1,
      noChats: 2,
    });
  });

  it("rejects zip uploads without data.json", async () => {
    const archive = new JSZip();
    archive.file("notes.txt", "no tinder export here");
    const zipBytes = await archive.generateAsync({ type: "uint8array" });
    const file = new File([zipBytes], "broken.zip", { type: "application/zip" });

    await expect(parseTinderFile(file)).rejects.toThrow(/missing data\.json/i);
  });
});
