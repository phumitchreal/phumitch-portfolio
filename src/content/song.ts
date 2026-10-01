/**
 * song.ts — home-page "now playing" card content.
 *
 * PASTE THE LYRICS into `lyrics` below and they render in the card
 * automatically (this file is the only place to edit).
 * Leave `lyrics` empty and the lyrics block is hidden.
 */
export type Song = {
  title: string;
  artist: string;
  /** Cover image path from /public, e.g. "/song-cover.jpg" (optional). */
  cover?: string;
  year?: string;
  duration?: string;
  /** Link to listen, e.g. a YouTube / Spotify / Apple Music URL. */
  url?: string;
  /** Lyrics — plain text; line breaks are preserved. */
  lyrics?: string;
};

export const song: Song = {
  title: "YOU NEVER KNOW",
  artist: "SEXSKI",
  cover: "/song-cover.jpg", // ← ปกเพลง (self-hosted ใน public/)
  year: "", // ← ปีที่ปล่อย
  duration: "", // ← ความยาว เช่น 3:24
  url: "https://music.youtube.com/watch?v=idHCTrYqBnc", // ← ลิงก์ฟังเพลง
  lyrics: "", // ← วางเนื้อเพลงตรงนี้ (วางเองได้เลย)
};