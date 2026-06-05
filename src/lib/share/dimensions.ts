/**
 * Instagram Story canvas is ALWAYS 1080×1920 (9:16). These constants are the
 * single source of truth for every generated share image, and are pinned by a
 * unit test so the size can never silently drift.
 */
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const STORY_ASPECT = STORY_WIDTH / STORY_HEIGHT; // 0.5625 == 9/16

export type ShareKind = "quote" | "book" | "streak";
