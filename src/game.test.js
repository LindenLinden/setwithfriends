import {
  checkSet4Set,
  checkSetGhost,
  checkSetNormal,
  checkSetUltra,
  conjugateCard,
  conjugateCard4Set,
  findSet,
} from "./game";

it("computes conjugate cards", () => {
  expect(conjugateCard("0001", "0002")).toBe("0000");
  expect(conjugateCard("1201", "1002")).toBe("1100");
  expect(conjugateCard("0112", "0112")).toBe("0112");
});

it("computes conjugate cards (4set) ", () => {
  expect(conjugateCard4Set("2033", "2212", "1011")).toBe("1230");
  expect(conjugateCard4Set("3312", "3311", "2133")).toBe("2130");
  expect(conjugateCard4Set("2330", "3220", "1202")).toBe("0312");
});

const verifySet = (cards) => {
  expect(cards.length).toBe(3);
  expect(new Set(cards).size).toBe(3);
  const [a, b, c] = cards;
  expect(conjugateCard(a, b)).toBe(c);
};

it("checks sets", () => {
  verifySet(checkSetNormal("0001", "0002", "0000"));
  expect(checkSetNormal("0001", "0002", "0020")).toBe(null);
  expect(checkSetNormal("0010", "0002", "0000")).toBe(null);
  verifySet(checkSetNormal("1201", "1002", "1100"));
  expect(checkSetNormal("1221", "1002", "1100")).toBe(null);
  expect(checkSetNormal("0112", "0122", "0112")).toBe(null);
});

const verifyUltra = (cards) => {
  expect(cards.length).toBe(4);
  expect(new Set(cards).size).toBe(4);
  const [a, b, c, d] = cards;
  expect(conjugateCard(a, b)).toBe(conjugateCard(c, d));
};

const verifyUltraAnyOrder = (cards) => {
  expect(cards.length).toBe(4);
  expect(new Set(cards).size).toBe(4);
  expect(checkSetUltra(...cards)).not.toBe(null);
};

it("checks ultrasets", () => {
  verifyUltra(checkSetUltra("0001", "0002", "1202", "2101"));
  verifyUltra(checkSetUltra("1202", "0001", "0002", "2101"));
  verifyUltra(checkSetUltra("1202", "0001", "2101", "0002"));

  expect(checkSetUltra("0000", "1111", "2222", "1212")).toBe(null);
  expect(checkSetUltra("0000", "1111", "1010", "1212")).toBe(null);
  verifyUltra(checkSetUltra("1001", "1221", "1010", "1212"));
});

const verifyGhost = (cards) => {
  expect(cards.length).toBe(6);
  expect(new Set(cards).size).toBe(6);
  const [a, b, c, d, e, f] = cards;
  const ga = conjugateCard(a, b),
    gb = conjugateCard(c, d),
    gc = conjugateCard(e, f);
  expect(conjugateCard(ga, gb)).toBe(gc);
};

it("checks ghostsets", () => {
  verifyGhost(checkSetGhost("0001", "0002", "0000", "1201", "1002", "1100"));
  verifyGhost(checkSetGhost("1020", "0011", "0020", "0021", "0201", "2120"));
  expect(checkSetGhost("1020", "0011", "1020", "0021", "0201", "2120")).toBe(
    null
  );
  verifyGhost(checkSetGhost("1111", "1021", "0102", "2001", "2100", "0001"));
  expect(checkSetGhost("1111", "1021", "0102", "2001", "2100", "0201")).toBe(
    null
  );
  verifyGhost(checkSetGhost("0120", "1022", "1012", "0110", "2102", "2000"));
  expect(checkSetGhost("0120", "1022", "1012", "0110", "2102", "2020")).toBe(
    null
  );
});

const verify4Set = (cards) => {
  expect(cards.length).toBe(4);
  const [a, b, c, d] = cards;
  expect(conjugateCard4Set(a, b, c)).toBe(d);
};

it("checks 4sets", () => {
  verify4Set(checkSet4Set("0000", "0102", "0210", "0312"));
  expect(checkSet4Set("0000", "0102", "0210", "0310")).toBe(null);
});

describe("findSet()", () => {
  it("can find normal sets", () => {
    for (const deck of [
      ["0110", "0111", "0112"],
      ["2012", "0112", "0111", "2011", "0110"],
      ["1111", "2222", "1010", "2021", "0201", "1021", "1022", "0112"],
    ]) {
      verifySet(findSet(deck, "normal"));
      verifySet(findSet(deck, "setchain", { lastSet: [] }));
    }

    for (const deck of [
      ["2012", "0112", "0000", "2011", "2020"],
      ["1121", "2222", "1010", "2021", "0201", "1021", "1022", "0112"],
      ["1121", "2021", "2222", "0112", "1021", "1022", "0201", "1010"],
    ]) {
      expect(findSet(deck, "normal")).toBe(null);
      expect(findSet(deck, "setchain", { lastSet: [] })).toBe(null);
    }
  });

  it("can find set-chains", () => {
    const state = { lastSet: ["1200", "0012", "2121"] };
    expect(findSet(["0112", "0111", "0110"], "setchain", state)).toBe(null);
    verifySet(findSet(["0112", "0211", "0110"], "setchain", state));
  });

  it("can find puzzle sets", () => {
    const board = ["0000", "0001", "0002", "0010", "0020", "0011"];
    const state = { foundSets: new Set() };
    for (let i = 0; i < 3; i++) {
      const set = findSet(board, "puzzle", state);
      verifySet(set);
      expect(state.foundSets.has(set.slice().sort().join("|"))).toBe(false);
      state.foundSets.add(set.slice().sort().join("|"));
    }
    expect(findSet(board, "puzzle", state)).toBe(null);
  });

  it("can find ultrasets", () => {
    for (const deck of [
      ["1202", "0001", "0002", "2101"],
      ["1202", "0000", "0001", "0002", "2101"],
    ]) {
      verifyUltra(findSet(deck, "ultraset"));
      verifyUltra(findSet(deck, "ultrachain", { lastSet: [] }));
    }
    for (const deck of [
      ["1202", "0000", "0001", "0002"],
      ["1202", "0000", "0001", "0002", "2202"],
    ]) {
      expect(findSet(deck, "ultraset")).toBe(null);
      expect(findSet(deck, "ultrachain", { lastSet: [] })).toBe(null);
    }
  });

  it("can find ultraset-chains", () => {
    const state = { lastSet: ["1202", "0001", "0002", "2101"] };
    expect(findSet(["1001", "1221", "1010", "1210"], "ultrachain", state)).toBe(
      null
    );
    verifyUltra(findSet(["1001", "1221", "1010", "2112"], "ultrachain", state));
    verifyUltra(findSet(["1001", "1221", "1010", "1220"], "ultrachain", state));
  });

  it("can find puzzle ultrasets", () => {
    const board = ["0000", "0001", "1002", "2002", "0020", "0011", "1010"];
    const state = { foundSets: new Set() };
    for (let i = 0; i < 6; i++) {
      const set = findSet(board, "ultra9puzzle", state);
      verifyUltraAnyOrder(set);
      expect(state.foundSets.has(set.slice().sort().join("|"))).toBe(false);
      state.foundSets.add(set.slice().sort().join("|"));
    }
    expect(findSet(board, "ultra9puzzle", state)).toBe(null);
  });

  it("can find ghostsets", () => {
    for (const deck of [
      ["0001", "0002", "0000", "1201", "1002", "1100", "1111"],
      ["1111", "1021", "0102", "2001", "2100", "0001", "0002", "2222"],
      ["0001", "0002", "0010", "0020", "0100", "0200", "1111", "2222"],
    ]) {
      verifyGhost(findSet(deck, "ghostset"));
    }

    for (const deck of [
      ["0001", "0002", "0000", "1201", "1002"],
      ["1111", "1021", "0102", "2001", "2100", "1001", "0002"],
    ]) {
      expect(findSet(deck, "ghostset")).toBe(null);
    }
  });

  it("can find 4sets", () => {
    for (const deck of [
      ["0000", "0102", "0210", "0312"],
      ["0123", "0000", "0102", "0210", "0312", "3210"],
      ["0123", "0000", "0102", "0210", "0312", "3210", "1111", "2323"],
    ]) {
      verify4Set(findSet(deck, "4set"));
      verify4Set(findSet(deck, "4setjrchain", { lastSet: [] }));
    }

    for (const deck of [
      ["0000", "0102", "0210", "0311"],
      ["0123", "0000", "0102", "0210", "0311", "3210"],
      ["0123", "0000", "0102", "0210", "0311", "3210", "1111", "2323"],
    ]) {
      expect(findSet(deck, "4set")).toBe(null);
      expect(findSet(deck, "4setjrchain", { lastSet: [] })).toBe(null);
    }
  });

  it("can find 4set-chains", () => {
    const state = { lastSet: ["1202", "0001", "0002", "2101"] };
    expect(
      findSet(["0000", "0102", "0210", "0311"], "4setjrchain", state)
    ).toBe(null);
    verify4Set(findSet(["0000", "0102", "0210", "0003"], "4setjrchain", state));
    verify4Set(findSet(["0000", "0102", "0210", "3201"], "4setjrchain", state));
  });

  it("can find puzzle 4sets", () => {
    const board = ["0000", "0102", "0210", "0312", "1111", "1013", "1203"];
    const state = { foundSets: new Set() };
    for (let i = 0; i < 7; i++) {
      const set = findSet(board, "4setjrpuzzle", state);
      verify4Set(set);
      expect(state.foundSets.has(set.slice().sort().join("|"))).toBe(false);
      state.foundSets.add(set.slice().sort().join("|"));
    }
    expect(findSet(board, "4setjrpuzzle", state)).toBe(null);
  });
});
