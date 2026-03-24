import JSZip from "jszip";
import { extractTinderMetrics, validateTinderExport } from "./metrics";
import type { TinderMetrics } from "../types/tinder";

const readFileAsText = (file: File): Promise<string> => {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(new Error("Unsupported file: unable to read file contents."));
    };

    reader.readAsText(file);
  });
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unsupported file: unable to read zip contents."));
    };
    reader.onerror = () => {
      reject(new Error("Unsupported file: unable to read zip contents."));
    };

    reader.readAsArrayBuffer(file);
  });
};

const readTinderPayload = async (file: File): Promise<string> => {
  const normalizedName = file.name.toLowerCase();

  if (!normalizedName.endsWith(".zip")) {
    return readFileAsText(file);
  }

  let archive: JSZip;

  try {
    archive = await JSZip.loadAsync(await readFileAsArrayBuffer(file));
  } catch {
    throw new Error("Unsupported file: invalid zip archive.");
  }

  const dataJsonEntry = Object.values(archive.files).find(
    (entry) => !entry.dir && entry.name.split("/").at(-1)?.toLowerCase() === "data.json",
  );

  if (!dataJsonEntry) {
    throw new Error("Unsupported zip: missing data.json.");
  }

  return dataJsonEntry.async("text");
};

export const parseTinderFile = async (file: File): Promise<TinderMetrics> => {
  const content = await readTinderPayload(file);

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Unsupported file: invalid JSON.");
  }

  return extractTinderMetrics(validateTinderExport(parsed));
};
