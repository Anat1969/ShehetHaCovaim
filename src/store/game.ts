import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type HatId = "white" | "red" | "black" | "yellow" | "green" | "blue";
export type Theme = "obsidian" | "chalk";
export type GoalType = "business" | "personal" | "creative";

export const HAT_ORDER: HatId[] = ["white", "red", "black", "yellow", "green", "blue"];

// ----- Per-hat data shapes -----
export type WhiteItem = { id: string; text: string; bucket: "knows" | "assumes" | "unsorted"; assumption: boolean };
export type Risk = { id: string; text: string; probability: number; impact: number; contingency?: string };
export type YellowValue = { riskId: string; text: string; approved: boolean };
export type GreenIdeas = { reverse1: string; reverse2: string; analogyDomain: string; analogyAnswer: string; exaggerate1: string; exaggerate2: string };
export type HybridRating = "applicable" | "interesting" | "irrelevant";

export type RoomsState = {
  white: { items: WhiteItem[]; score: number; completed: boolean };
  red: { text: string; locked: boolean; pie: Record<string, number>; emotion: string; confirmed: "yes" | "no" | "partial" | null; score: number; completed: boolean };
  black: { risks: Risk[]; score: number; completed: boolean };
  yellow: { values: YellowValue[]; score: number; completed: boolean };
  green: { ideas: GreenIdeas; ratings: Record<string, HybridRating>; score: number; completed: boolean };
  blue: { nextStep: string; obstacleRiskId: string; contingency: string; score: number; completed: boolean };
};

export const emptyRooms = (): RoomsState => ({
  white: { items: [], score: 0, completed: false },
  red: { text: "", locked: false, pie: {}, emotion: "", confirmed: null, score: 0, completed: false },
  black: { risks: [], score: 0, completed: false },
  yellow: { values: [], score: 0, completed: false },
  green: { ideas: { reverse1: "", reverse2: "", analogyDomain: "", analogyAnswer: "", exaggerate1: "", exaggerate2: "" }, ratings: {}, score: 0, completed: false },
  blue: { nextStep: "", obstacleRiskId: "", contingency: "", score: 0, completed: false },
});

export type CheckIn = "done" | "partial" | "not";

export type Journey = {
  id: string;
  createdAt: number;
  updatedAt: number;
  goalText: string;
  goalType: GoalType;
  complexity: number;
  rooms: RoomsState;
  totalScore?: number;
  completedAt?: number;
  checkIn?: CheckIn;
};

type Store = {
  theme: Theme;
  journeys: Journey[];
  activeId: string | null;
  setTheme: (t: Theme) => void;
  startJourney: (text: string, type: GoalType, complexity: number) => string;
  openJourney: (id: string) => void;
  deleteJourney: (id: string) => void;
  updateRoom: <K extends HatId>(hat: K, patch: Partial<RoomsState[K]>) => void;
  completeRoom: (hat: HatId, score: number) => void;
  finishJourney: () => void;
  setCheckIn: (id: string, v: CheckIn) => void;
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `j-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function patchActive(s: Store, fn: (j: Journey) => Journey): Partial<Store> {
  return { journeys: s.journeys.map((j) => (j.id === s.activeId ? { ...fn(j), updatedAt: Date.now() } : j)) };
}

export function totalScoreOf(rooms: RoomsState) {
  return Math.round(HAT_ORDER.reduce((a, h) => a + (rooms[h].score || 0), 0) / HAT_ORDER.length);
}

const prefersLight = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches;

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      theme: prefersLight ? "chalk" : "obsidian",
      journeys: [],
      activeId: null,

      setTheme: (theme) => set({ theme }),

      startJourney: (goalText, goalType, complexity) => {
        const now = Date.now();
        const j: Journey = { id: uid(), createdAt: now, updatedAt: now, goalText, goalType, complexity, rooms: emptyRooms() };
        set((s) => ({ journeys: [j, ...s.journeys], activeId: j.id }));
        return j.id;
      },

      openJourney: (id) => set({ activeId: id }),

      deleteJourney: (id) =>
        set((s) => ({ journeys: s.journeys.filter((j) => j.id !== id), activeId: s.activeId === id ? null : s.activeId })),

      updateRoom: (hat, patch) =>
        set((s) => patchActive(s, (j) => ({ ...j, rooms: { ...j.rooms, [hat]: { ...j.rooms[hat], ...patch } } as RoomsState }))),

      completeRoom: (hat, score) =>
        set((s) => patchActive(s, (j) => ({ ...j, rooms: { ...j.rooms, [hat]: { ...j.rooms[hat], completed: true, score } } as RoomsState }))),

      finishJourney: () => {
        const j = get().journeys.find((x) => x.id === get().activeId);
        if (!j) return;
        const totalScore = totalScoreOf(j.rooms);
        if (j.completedAt && j.totalScore === totalScore) return;
        set((s) => patchActive(s, (x) => ({ ...x, totalScore, completedAt: x.completedAt ?? Date.now() })));
      },

      setCheckIn: (id, v) => set((s) => ({ journeys: s.journeys.map((j) => (j.id === id ? { ...j, checkIn: v } : j)) })),
    }),
    {
      name: "hats-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, journeys: s.journeys, activeId: s.activeId }),
    },
  ),
);

export function useActiveJourney(): Journey | null {
  return useGame((s) => s.journeys.find((j) => j.id === s.activeId) ?? null);
}

/** Rooms of the active journey, or empty rooms when none is open. */
export function useRooms(): RoomsState {
  const j = useActiveJourney();
  return j ? j.rooms : EMPTY;
}
const EMPTY = emptyRooms();

export function roomStatus(rooms: RoomsState, hat: HatId): "done" | "active" | "locked" {
  if (rooms[hat].completed) return "done";
  const idx = HAT_ORDER.indexOf(hat);
  if (idx === 0) return "active";
  return rooms[HAT_ORDER[idx - 1]].completed ? "active" : "locked";
}

export function nextOpenHat(rooms: RoomsState): HatId | null {
  return HAT_ORDER.find((h) => !rooms[h].completed) ?? null;
}
