import type { TinderExport, TinderMessageThread, TinderMetrics } from "../types/tinder";

const isNumberRecord = (value: unknown): value is Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "number");
};

const hasMessageThreadShape = (value: unknown): value is TinderMessageThread => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const maybeMessages = (value as TinderMessageThread).messages;
  return maybeMessages === undefined || Array.isArray(maybeMessages);
};

const sumSeries = (series: Record<string, number>): number =>
  Object.values(series).reduce((total, current) => total + current, 0);

export const validateTinderExport = (input: unknown): TinderExport => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Unsupported file: expected a Tinder export JSON object.");
  }

  const exportData = input as TinderExport;
  const likes = exportData.Usage?.swipes_likes;
  const passes = exportData.Usage?.swipes_passes;
  const messages = exportData.Messages;

  if (!isNumberRecord(likes) || !isNumberRecord(passes) || !Array.isArray(messages)) {
    throw new Error(
      "Unsupported file: missing Usage.swipes_likes, Usage.swipes_passes, or Messages.",
    );
  }

  if (!messages.every(hasMessageThreadShape)) {
    throw new Error("Unsupported file: Messages must be an array of match threads.");
  }

  return exportData;
};

export const extractTinderMetrics = (exportData: TinderExport): TinderMetrics => {
  const likes = exportData.Usage?.swipes_likes;
  const passes = exportData.Usage?.swipes_passes;
  const messages = exportData.Messages;

  if (!likes || !passes || !messages) {
    throw new Error("Cannot extract metrics before the Tinder export is validated.");
  }

  const rightSwipes = sumSeries(likes);
  const leftSwipes = sumSeries(passes);
  const usageMatches = exportData.Usage?.matches;
  const matches = usageMatches && isNumberRecord(usageMatches) ? sumSeries(usageMatches) : messages.length;
  const chats = messages.filter((thread) => (thread.messages?.length ?? 0) >= 5).length;
  const noChats = matches - chats;
  const noMatch = Math.max(0, rightSwipes - matches);

  return {
    totalSwipes: leftSwipes + rightSwipes,
    leftSwipes,
    rightSwipes,
    matches,
    noMatch,
    chats,
    noChats,
  };
};
