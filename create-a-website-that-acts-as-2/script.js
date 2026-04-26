const symbols = {
  s: "s",
  u: "u",
  v: "v",
  a: "a",
  t: "t",
};

const names = {
  s: "Displacement",
  u: "Initial velocity",
  v: "Final velocity",
  a: "Acceleration",
  t: "Time",
};

const units = {
  s: "m",
  u: "m/s",
  v: "m/s",
  a: "m/s²",
  t: "s",
};

const EPSILON = 1e-9;

const form = document.getElementById("suvat-form");
const clearBtn = document.getElementById("clear-btn");
const status = document.getElementById("status");
const solvedList = document.getElementById("solved-list");
const possibleList = document.getElementById("possible-list");
const workingList = document.getElementById("working-list");

function prettyNumber(value) {
  if (!Number.isFinite(value)) {
    return "undefined";
  }
  const rounded = Math.abs(value) < EPSILON ? 0 : value;
  return Number(rounded.toFixed(6)).toString();
}

function isClose(a, b) {
  return Math.abs(a - b) < 1e-6;
}

function safeDivide(numerator, denominator) {
  if (Math.abs(denominator) < EPSILON) {
    return null;
  }
  return numerator / denominator;
}

function parseInputs() {
  const values = {};
  for (const key of Object.keys(symbols)) {
    const raw = form.elements[key].value;
    if (raw === "") {
      values[key] = null;
      continue;
    }
    const value = Number(raw);
    values[key] = Number.isFinite(value) ? value : null;
  }
  return values;
}

function initialState(values) {
  const state = {};
  for (const key of Object.keys(values)) {
    state[key] = {
      value: values[key],
      source: values[key] == null ? null : "Given",
    };
  }
  return state;
}

function buildRules() {
  return [
    {
      id: "1",
      equation: "v = u + at",
      target: "v",
      needs: ["u", "a", "t"],
      compute: ({ u, a, t }) => ({
        kind: "single",
        value: u + a * t,
        substitution: `v = ${prettyNumber(u)} + ${prettyNumber(a)} × ${prettyNumber(t)} = ${prettyNumber(u + a * t)}`,
      }),
    },
    {
      id: "1",
      equation: "v = u + at",
      target: "u",
      needs: ["v", "a", "t"],
      compute: ({ v, a, t }) => ({
        kind: "single",
        value: v - a * t,
        substitution: `u = ${prettyNumber(v)} - (${prettyNumber(a)} × ${prettyNumber(t)}) = ${prettyNumber(v - a * t)}`,
      }),
    },
    {
      id: "1",
      equation: "v = u + at",
      target: "a",
      needs: ["v", "u", "t"],
      compute: ({ v, u, t }) => {
        const value = safeDivide(v - u, t);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `a = (${prettyNumber(v)} - ${prettyNumber(u)}) / ${prettyNumber(t)} = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "1",
      equation: "v = u + at",
      target: "t",
      needs: ["v", "u", "a"],
      compute: ({ v, u, a }) => {
        const value = safeDivide(v - u, a);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `t = (${prettyNumber(v)} - ${prettyNumber(u)}) / ${prettyNumber(a)} = ${prettyNumber(value)}`,
        };
      },
    },

    {
      id: "2",
      equation: "s = ((u + v) / 2)t",
      target: "s",
      needs: ["u", "v", "t"],
      compute: ({ u, v, t }) => ({
        kind: "single",
        value: ((u + v) / 2) * t,
        substitution: `s = ((${prettyNumber(u)} + ${prettyNumber(v)}) / 2) × ${prettyNumber(t)} = ${prettyNumber(((u + v) / 2) * t)}`,
      }),
    },
    {
      id: "2",
      equation: "s = ((u + v) / 2)t",
      target: "u",
      needs: ["s", "v", "t"],
      compute: ({ s, v, t }) => {
        const value = safeDivide(2 * s, t);
        if (value == null) return null;
        const uVal = value - v;
        return {
          kind: "single",
          value: uVal,
          substitution: `u = (2 × ${prettyNumber(s)} / ${prettyNumber(t)}) - ${prettyNumber(v)} = ${prettyNumber(uVal)}`,
        };
      },
    },
    {
      id: "2",
      equation: "s = ((u + v) / 2)t",
      target: "v",
      needs: ["s", "u", "t"],
      compute: ({ s, u, t }) => {
        const value = safeDivide(2 * s, t);
        if (value == null) return null;
        const vVal = value - u;
        return {
          kind: "single",
          value: vVal,
          substitution: `v = (2 × ${prettyNumber(s)} / ${prettyNumber(t)}) - ${prettyNumber(u)} = ${prettyNumber(vVal)}`,
        };
      },
    },
    {
      id: "2",
      equation: "s = ((u + v) / 2)t",
      target: "t",
      needs: ["s", "u", "v"],
      compute: ({ s, u, v }) => {
        const value = safeDivide(2 * s, u + v);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `t = (2 × ${prettyNumber(s)}) / (${prettyNumber(u)} + ${prettyNumber(v)}) = ${prettyNumber(value)}`,
        };
      },
    },

    {
      id: "3",
      equation: "s = ut + (1/2)at²",
      target: "s",
      needs: ["u", "t", "a"],
      compute: ({ u, t, a }) => ({
        kind: "single",
        value: u * t + 0.5 * a * t * t,
        substitution: `s = (${prettyNumber(u)} × ${prettyNumber(t)}) + 0.5 × ${prettyNumber(a)} × ${prettyNumber(t)}² = ${prettyNumber(u * t + 0.5 * a * t * t)}`,
      }),
    },
    {
      id: "3",
      equation: "s = ut + (1/2)at²",
      target: "u",
      needs: ["s", "t", "a"],
      compute: ({ s, t, a }) => {
        const value = safeDivide(s - 0.5 * a * t * t, t);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `u = (${prettyNumber(s)} - 0.5 × ${prettyNumber(a)} × ${prettyNumber(t)}²) / ${prettyNumber(t)} = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "3",
      equation: "s = ut + (1/2)at²",
      target: "a",
      needs: ["s", "u", "t"],
      compute: ({ s, u, t }) => {
        const value = safeDivide(2 * (s - u * t), t * t);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `a = (2 × (${prettyNumber(s)} - ${prettyNumber(u)} × ${prettyNumber(t)})) / ${prettyNumber(t)}² = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "3",
      equation: "s = ut + (1/2)at²",
      target: "t",
      needs: ["s", "u", "a"],
      compute: ({ s, u, a }) => {
        if (Math.abs(a) < EPSILON) {
          const value = safeDivide(s, u);
          if (value == null) return null;
          return {
            kind: "single",
            value,
            substitution: `a = 0 so s = ut, therefore t = ${prettyNumber(s)} / ${prettyNumber(u)} = ${prettyNumber(value)}`,
          };
        }

        const A = 0.5 * a;
        const B = u;
        const C = -s;
        const disc = B * B - 4 * A * C;
        if (disc < -EPSILON) return null;
        const rootDisc = Math.sqrt(Math.max(disc, 0));
        const t1 = (-B + rootDisc) / (2 * A);
        const t2 = (-B - rootDisc) / (2 * A);
        const options = [t1, t2].filter((val) => Number.isFinite(val));
        return {
          kind: "multi",
          values: options,
          substitution: `0.5(${prettyNumber(a)})t² + ${prettyNumber(u)}t - ${prettyNumber(s)} = 0 gives t = ${options.map(prettyNumber).join(" or ")}`,
        };
      },
    },

    {
      id: "4",
      equation: "s = vt - (1/2)at²",
      target: "s",
      needs: ["v", "t", "a"],
      compute: ({ v, t, a }) => ({
        kind: "single",
        value: v * t - 0.5 * a * t * t,
        substitution: `s = (${prettyNumber(v)} × ${prettyNumber(t)}) - 0.5 × ${prettyNumber(a)} × ${prettyNumber(t)}² = ${prettyNumber(v * t - 0.5 * a * t * t)}`,
      }),
    },
    {
      id: "4",
      equation: "s = vt - (1/2)at²",
      target: "v",
      needs: ["s", "t", "a"],
      compute: ({ s, t, a }) => {
        const value = safeDivide(s + 0.5 * a * t * t, t);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `v = (${prettyNumber(s)} + 0.5 × ${prettyNumber(a)} × ${prettyNumber(t)}²) / ${prettyNumber(t)} = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "4",
      equation: "s = vt - (1/2)at²",
      target: "a",
      needs: ["s", "v", "t"],
      compute: ({ s, v, t }) => {
        const value = safeDivide(2 * (v * t - s), t * t);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `a = (2 × (${prettyNumber(v)} × ${prettyNumber(t)} - ${prettyNumber(s)})) / ${prettyNumber(t)}² = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "4",
      equation: "s = vt - (1/2)at²",
      target: "t",
      needs: ["s", "v", "a"],
      compute: ({ s, v, a }) => {
        if (Math.abs(a) < EPSILON) {
          const value = safeDivide(s, v);
          if (value == null) return null;
          return {
            kind: "single",
            value,
            substitution: `a = 0 so s = vt, therefore t = ${prettyNumber(s)} / ${prettyNumber(v)} = ${prettyNumber(value)}`,
          };
        }

        const A = 0.5 * a;
        const B = -v;
        const C = s;
        const disc = B * B - 4 * A * C;
        if (disc < -EPSILON) return null;
        const rootDisc = Math.sqrt(Math.max(disc, 0));
        const t1 = (-B + rootDisc) / (2 * A);
        const t2 = (-B - rootDisc) / (2 * A);
        const options = [t1, t2].filter((val) => Number.isFinite(val));
        return {
          kind: "multi",
          values: options,
          substitution: `0.5(${prettyNumber(a)})t² - ${prettyNumber(v)}t + ${prettyNumber(s)} = 0 gives t = ${options.map(prettyNumber).join(" or ")}`,
        };
      },
    },

    {
      id: "5",
      equation: "v² = u² + 2as",
      target: "a",
      needs: ["v", "u", "s"],
      compute: ({ v, u, s }) => {
        const value = safeDivide(v * v - u * u, 2 * s);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `a = (${prettyNumber(v)}² - ${prettyNumber(u)}²) / (2 × ${prettyNumber(s)}) = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "5",
      equation: "v² = u² + 2as",
      target: "s",
      needs: ["v", "u", "a"],
      compute: ({ v, u, a }) => {
        const value = safeDivide(v * v - u * u, 2 * a);
        if (value == null) return null;
        return {
          kind: "single",
          value,
          substitution: `s = (${prettyNumber(v)}² - ${prettyNumber(u)}²) / (2 × ${prettyNumber(a)}) = ${prettyNumber(value)}`,
        };
      },
    },
    {
      id: "5",
      equation: "v² = u² + 2as",
      target: "v",
      needs: ["u", "a", "s"],
      compute: ({ u, a, s }) => {
        const inside = u * u + 2 * a * s;
        if (inside < -EPSILON) return null;
        const root = Math.sqrt(Math.max(inside, 0));
        return {
          kind: "multi",
          values: [root, -root],
          substitution: `v = ±sqrt(${prettyNumber(u)}² + 2 × ${prettyNumber(a)} × ${prettyNumber(s)}) = ±${prettyNumber(root)}`,
        };
      },
    },
    {
      id: "5",
      equation: "v² = u² + 2as",
      target: "u",
      needs: ["v", "a", "s"],
      compute: ({ v, a, s }) => {
        const inside = v * v - 2 * a * s;
        if (inside < -EPSILON) return null;
        const root = Math.sqrt(Math.max(inside, 0));
        return {
          kind: "multi",
          values: [root, -root],
          substitution: `u = ±sqrt(${prettyNumber(v)}² - 2 × ${prettyNumber(a)} × ${prettyNumber(s)}) = ±${prettyNumber(root)}`,
        };
      },
    },
  ];
}

function applyRules(givenValues) {
  const state = initialState(givenValues);
  const working = [];
  const loggedMulti = new Set();
  const possible = {
    s: [],
    u: [],
    v: [],
    a: [],
    t: [],
  };

  const rules = buildRules();

  function addPossible(target, values) {
    for (const val of values) {
      if (!Number.isFinite(val)) continue;
      if (!possible[target].some((existing) => isClose(existing, val))) {
        possible[target].push(val);
      }
    }
  }

  function trySet(target, value, rule, substitution) {
    if (!Number.isFinite(value)) return false;

    const existing = state[target].value;
    if (existing == null) {
      state[target] = {
        value,
        source: `Eq. ${rule.id}: ${rule.equation}`,
      };
      working.push({
        target,
        equationNo: rule.id,
        equation: rule.equation,
        substitution,
        result: `${symbols[target]} = ${prettyNumber(value)} ${units[target]}`,
      });
      return true;
    }

    return false;
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (const rule of rules) {
      if (state[rule.target].value != null) continue;

      const inputs = {};
      let ready = true;
      for (const key of rule.needs) {
        const value = state[key].value;
        if (value == null) {
          ready = false;
          break;
        }
        inputs[key] = value;
      }
      if (!ready) continue;

      const output = rule.compute(inputs);
      if (!output) continue;

      if (output.kind === "single") {
        const didSet = trySet(rule.target, output.value, rule, output.substitution);
        if (didSet) {
          changed = true;
        }
      } else if (output.kind === "multi") {
        const unique = output.values.filter((val, index, arr) => arr.findIndex((other) => isClose(other, val)) === index);
        if (unique.length === 1) {
          const didSet = trySet(rule.target, unique[0], rule, output.substitution);
          if (didSet) {
            changed = true;
          }
        } else {
          addPossible(rule.target, unique);
          const multiKey = `${rule.id}:${rule.target}:${unique.map(prettyNumber).join("|")}`;
          if (!loggedMulti.has(multiKey)) {
            loggedMulti.add(multiKey);
            const valuesText = unique.map((value) => `${prettyNumber(value)} ${units[rule.target]}`).join(" or ");
            working.push({
              target: rule.target,
              equationNo: rule.id,
              equation: rule.equation,
              substitution: output.substitution,
              result: `${symbols[rule.target]} = ${valuesText}`,
            });
          }
        }
      }
    }
  }

  const unresolved = Object.keys(state).filter((key) => state[key].value == null);
  return { state, working, possible, unresolved };
}

function render(results, givenValues) {
  solvedList.innerHTML = "";
  possibleList.innerHTML = "";

  const knownCount = Object.values(givenValues).filter((val) => val != null).length;

  if (knownCount < 3) {
    status.textContent = "Enter at least 3 known quantities so SUVAT equations can be solved reliably.";
    status.className = "status";
    workingList.textContent = "Your worked steps will appear here.";
    workingList.className = "working-list muted";
    return;
  }

  const solvedUnknowns = Object.entries(results.state)
    .filter(([key, data]) => givenValues[key] == null && data.value != null)
    .map(([key, data]) => ({ key, ...data }));

  const possibleUnknowns = Object.keys(results.possible)
    .filter((key) => givenValues[key] == null && results.state[key].value == null && results.possible[key].length > 0)
    .map((key) => ({ key, values: results.possible[key] }));

  if (solvedUnknowns.length === 0 && possibleUnknowns.length > 0) {
    status.textContent = "2 possible answers.";
    status.className = "status";
  } else if (solvedUnknowns.length === 0) {
    status.textContent = "No unknown values could be calculated from this combination.";
    status.className = "status";
  } else {
    status.textContent = `Solved ${solvedUnknowns.length} unknown ${solvedUnknowns.length === 1 ? "quantity" : "quantities"}.`;
    status.className = "status";
  }

  for (const item of solvedUnknowns) {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-title">${names[item.key]} (${symbols[item.key]})</div>
      <div>${prettyNumber(item.value)} ${units[item.key]}</div>
      <div class="muted">Calculated using ${item.source}</div>
    `;
    solvedList.appendChild(card);
  }

  if (possibleUnknowns.length > 0) {
    const heading = document.createElement("h3");
    heading.textContent = "Possible values (more information needed)";
    heading.style.marginBottom = "0.5rem";
    possibleList.appendChild(heading);

    for (const item of possibleUnknowns) {
      const card = document.createElement("article");
      card.className = "result-card";
      const valuesText = item.values.map((v) => `${prettyNumber(v)} ${units[item.key]}`).join(" or ");
      card.innerHTML = `
        <div class="result-title">${names[item.key]} (${symbols[item.key]})</div>
        <div>${valuesText}</div>
        <div class="muted">Two mathematical roots are possible with current inputs.</div>
      `;
      possibleList.appendChild(card);
    }
  }

  if (results.working.length === 0) {
    workingList.textContent = "No worked steps were generated.";
    workingList.className = "working-list muted";
    return;
  }

  workingList.className = "working-list";
  workingList.innerHTML = "";

  for (const step of results.working) {
    const card = document.createElement("article");
    card.className = "working-card";
    card.innerHTML = `
      <strong>Find ${names[step.target]} (${symbols[step.target]})</strong>
      <p class="equation">Equation ${step.equationNo}: ${step.equation}</p>
      <p class="substitution">${step.substitution}</p>
      <p class="substitution"><strong>${step.result}</strong></p>
    `;
    workingList.appendChild(card);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = parseInputs();
  const results = applyRules(values);
  render(results, values);
});

clearBtn.addEventListener("click", () => {
  form.reset();
  status.textContent = "Fill in at least three values and press calculate.";
  status.className = "status muted";
  solvedList.innerHTML = "";
  possibleList.innerHTML = "";
  workingList.textContent = "Your worked steps will appear here.";
  workingList.className = "working-list muted";
});

