import { describe, expect, it } from "vitest";
import { analyzeRed, buildHybrids, classifyGoal, extractWhiteItems, findActionVerb, validateBlueContingency, validateBlueStep, whiteScore } from "../heuristics";

describe("classifyGoal", () => {
  it("detects business goals", () => {
    expect(classifyGoal("אני רוצה להגדיל את המכירות של העסק ולהביא לקוח חדש כל שבוע").type).toBe("business");
  });
  it("detects creative goals", () => {
    expect(classifyGoal("לכתוב ספר ילדים מאויר ולהוציא אותו לאור עד הקיץ הבא").type).toBe("creative");
  });
});

describe("white hat", () => {
  it("always offers at least six items to sort", () => {
    expect(extractWhiteItems("מטרה קצרה מאוד כאן").length).toBeGreaterThanOrEqual(6);
  });
  it("flags assumption words", () => {
    const items = extractWhiteItems("ברור שכולם יקנו את זה, יש לי שלושה לקוחות קבועים");
    expect(items[0].assumption).toBe(true);
  });
  it("penalises assumptions sorted as facts", () => {
    const base = { id: "a", text: "x", assumption: false };
    const good = whiteScore([{ ...base, bucket: "knows" }, { ...base, bucket: "knows" }, { ...base, bucket: "assumes" }, { ...base, bucket: "assumes" }]);
    const bad = whiteScore([{ ...base, assumption: true, bucket: "knows" }, { ...base, bucket: "knows" }, { ...base, bucket: "assumes" }, { ...base, bucket: "assumes" }]);
    expect(bad).toBeLessThan(good);
  });
});

describe("red hat", () => {
  it("finds the dominant emotion", () => {
    expect(analyzeRed("אני מפחד וחושש ומודאג שזה ייכשל").dominant).toBe("פחד");
  });
  it("reports no clear emotion when nothing matches", () => {
    expect(analyzeRed("שולחן כיסא מנורה").dominant).toBe("לא מובחן");
  });
});

describe("green hat", () => {
  it("builds hybrids with stable ids", () => {
    const h = buildHybrids({ reverse1: "a", reverse2: "ב", analogyDomain: "טבע", analogyAnswer: "ג", exaggerate1: "d", exaggerate2: "ד" });
    expect(h.map((x) => x.id)).toEqual(["rev-ana", "ana-exa", "exa-rev"]);
  });
});

describe("blue hat", () => {
  it("finds first person future verbs", () => {
    expect(findActionVerb("אני אתקשר לשלושה לקוחות")).toBe("אתקשר");
    expect(findActionVerb("אני רוצה אולי")).toBeNull();
  });
  it("requires verb and date", () => {
    expect(validateBlueStep("אשלח את ההצעה עד יום שלישי").ok).toBe(true);
    expect(validateBlueStep("לשלוח את ההצעה").ok).toBe(false);
  });
  it("rejects soft contingencies", () => {
    expect(validateBlueContingency("אחשוב על זה").ok).toBe(false);
    expect(validateBlueContingency("אפנה לספק השני ואזמין ממנו מיד").ok).toBe(true);
  });
});
