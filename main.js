class Increment {
  static instances = [];
  constructor(die) {
    this.die = die;
    this.count = 1;
    this.button = document.getElementById(die);
    this.button.addEventListener("click", () => this.addDie());
    Increment.instances.push(this);
  }

  addDie() {
    const screen = document.getElementById("c-screen");

    if (screen.innerHTML.includes(")")) {
      screen.innerHTML = "";
    } else if (
      screen.innerHTML.split("+").length -
        1 +
        (screen.innerHTML.split("-").length - 1) ===
        4 &&
      !screen.innerHTML.endsWith(`${this.die}`) &&
      !screen.innerHTML.endsWith(" ")
    ) {
      return;
    } else if (this.count === 100) return;

    if (screen.innerHTML === "" || screen.innerHTML.endsWith(" ")) {
      this.count = 1;
      screen.innerHTML += `${this.count}${this.die}`;
    } else if (!screen.innerHTML.endsWith(`${this.die}`)) {
      this.count = 1;
      screen.innerHTML += ` + ${this.count}${this.die}`;
    } else {
      this.count++;
      screen.innerHTML = screen.innerHTML.replace(
        /(\d+)([dD]\d+)$/,
        (match, p1, p2) => {
          return `${parseInt(p1) + 1}${p2}`;
        }
      );
    }
  }
}
const increments = document.querySelectorAll(".increment");
increments.forEach((increment) => {
  const incrementor = new Increment(increment.id);
});

class Quick {
  constructor(die) {
    this.die = die;
    this.button = document.getElementById(die);
    this.button.addEventListener("click", () => this.quickAdd());
  }

  quickAdd() {
    const screen = document.getElementById("c-screen");
    const screenText = screen.innerHTML;

    if (screenText === "ADV()" || screenText === "DIS()") {
      let max;
      let min;

      screen.innerHTML = `2${this.die.replace("q", "")}`;
      roll();

      // Get all .roll-values spans (these contain the actual dice results)
      const valueSpans = Array.from(screen.querySelectorAll(".roll-values"));
      // Flatten all numbers in all spans
      const values = valueSpans
        .map((span) => {
          let text = span.childNodes[0]?.textContent || "";
          return (text.match(/-?\d+/g) || []).map(Number);
        })
        .flat();

      max = Math.max(...values);
      min = Math.min(...values);

      // Highlight max and min
      let highlighted;

      if (screenText === "ADV()") {
        highlighted = values
          .map((v) =>
            v === max
              ? `<span style="color:#6aa84f"><b>${v}</b></span>`
              : v === min
              ? `<span style="opacity:0.4;color: #b85450;">${v}</span>`
              : v
          )
          .join(", ");
      } else if (screenText === "DIS()") {
        highlighted = values
          .map((v) =>
            v === min
              ? `<span style="color:#b85450"><b>${v}</b></span>`
              : v === max
              ? `<span style="opacity:0.4;color: #6aa84f;">${v}</span>`
              : v
          )
          .join(", ");
      }

      if (screenText === "ADV()") {
        screen.innerHTML = `ADV(${this.die.replace(
          "q",
          ""
        )})<br><div style="display: flex;justify-content: flex-end;">(${highlighted})</div>`;
      } else if (screenText === "DIS()") {
        screen.innerHTML = `DIS(${this.die.replace(
          "q",
          ""
        )})<br><div style="display: flex;justify-content: flex-end;">(${highlighted})</div>`;
      }
    } else {
      screen.innerHTML = `1${this.die.replace("q", "")}`;
      roll();

      screen.innerHTML = screen.innerHTML.split("<b>")[0];
      screen.querySelectorAll(".sub-total").forEach((sub) => {
        sub.innerHTML = "";
      });
    }
  }
}
const quicks = document.querySelectorAll(".quick");
quicks.forEach((quick) => {
  const quickDie = new Quick(quick.id);
});

function number(event) {
  const screen = document.getElementById("c-screen");
  const button = event.target;

  const endingSub = screen.innerHTML
    .substring(screen.innerHTML.lastIndexOf(" ") + 1)
    .trim();

  if (screen.innerHTML.includes(")")) {
    screen.innerHTML = "";
  } else if (
    screen.innerHTML.split("+").length -
      1 +
      (screen.innerHTML.split("-").length - 1) ===
      4 &&
    (endingSub.length === 3 || endingSub.includes("d"))
  ) {
    return;
  }

  if (screen.innerHTML === "" || screen.innerHTML.endsWith(" ")) {
    screen.innerHTML += button.innerHTML;
  } else if (!endingSub.includes("d") && endingSub.length < 3) {
    screen.innerHTML += `${button.innerHTML}`;
  } else {
    screen.innerHTML += ` + ${button.innerHTML}`;
  }
}
document.querySelectorAll(".number").forEach((button) => {
  button.addEventListener("click", number);
});

function advDis(button) {
  const screen = document.getElementById("c-screen");

  if (button.id === "adv") {
    screen.innerHTML = "ADV()";
  } else if (button.id === "dis") {
    screen.innerHTML = "DIS()";
  }
}

function plusMinus(button) {
  const screen = document.getElementById("c-screen");
  const operation = button.innerHTML;

  if (
    screen.innerHTML.split("+").length -
      1 +
      (screen.innerHTML.split("-").length - 1) ===
    4
  ) {
    return;
  }

  if (
    screen.innerHTML != "" &&
    !screen.innerHTML.endsWith(" ") &&
    !screen.innerHTML.includes(")") &&
    operation === "+"
  ) {
    screen.innerHTML += " + ";
  } else if (
    screen.innerHTML != "" &&
    !screen.innerHTML.endsWith(" ") &&
    !screen.innerHTML.includes(")") &&
    operation === "-"
  ) {
    screen.innerHTML += " - ";
  } else if (
    (screen.innerHTML === "" || screen.innerHTML.includes(")")) &&
    operation === "-"
  ) {
    screen.innerHTML = " - ";
  }

  Increment.instances.forEach((instance) => {
    instance.count = 1; // Reset the count for each die
  });
}

function clear() {
  const screen = document.getElementById("c-screen");
  screen.innerHTML = "";

  Increment.instances.forEach((instance) => {
    instance.count = 1; // Reset the count for each die
  });
}
document.getElementById("clear").addEventListener("click", clear);

function roll() {
  const screen = document.getElementById("c-screen");
  let formula;

  // Remove previous results
  if (screen.querySelector("#head")) {
    formula = screen.querySelector("#head").innerHTML.split("<br>")[0];
  } else {
    formula = screen.innerHTML.split("<br>")[0];
  }
  screen.innerHTML = formula;

  let total = 0;
  let results = [];
  let groupIndex = 0;
  const tokens = formula.split(/(\s[+-]\s)/);

  let currentOp = "+";

  tokens.forEach((token) => {
    token = token.trim();
    if (token === "+" || token === "-") {
      currentOp = token;
    } else if (token) {
      const diceMatch = token.match(/(\d+)[dD](\d+)/);
      const constMatch = token.match(/^\d+$/);
      if (diceMatch) {
        const count = parseInt(diceMatch[1], 10);
        const sides = parseInt(diceMatch[2], 10);
        let groupResults = [];
        for (let i = 0; i < count; i++) {
          const result = Math.floor(Math.random() * sides) + 1;
          if (currentOp === "-") {
            groupResults.push(`-${result}`);
            total -= result;
          } else {
            groupResults.push(`${result}`);
            total += result;
          }
        }
        let color = `hsl(${Math.random() * 360}, ${90 + Math.random() * 10}%, ${
          70 + Math.random() * 10
        }%)`;
        let groupLabel = `${count}d${sides}`;
        let groupSpan = `<span class="roll-group" style="text-align: left;background:${color};padding:2px 6px;border-radius:6px;margin-right:4px;display:inline-block;">
    <span class="roll-label" style="font-size:0.9em;opacity:0.7;">${groupLabel}:</span>
    <span class="roll-values" style="text-align: right;">${groupResults.join(
      ", "
    )}<sub class="sub-total" style="font-size: ${
          window.innerHeight > window.innerWidth ? "4vw" : "4vh"
        };">${groupResults.reduce(
          (acc, val) => acc + Number(val),
          0
        )}</sub></span>
  </span>`;
        results.push(groupSpan);
        groupIndex++;
      } else if (constMatch) {
        let color = `hsl(${Math.random() * 360}, ${90 + Math.random() * 10}%, ${
          70 + Math.random() * 10
        }%)`;
        let value = parseInt(token, 10);
        if (currentOp === "-") {
          value = -value;
          let constSpan = `<span class="roll-group" style="text-align: left;background:${color};padding:2px 6px;border-radius:6px;margin-right:4px;display:inline-block;">
    <span class="roll-label" style="font-size:0.9em;opacity:0.7;">${
      value >= 0 ? "+" : "-"
    }:</span>
    <span class="roll-values" style="text-align: right;">${-value}</span>
  </span>`;
          results.push(constSpan);
          groupIndex++;
          total += value;
        } else {
          let constSpan = `<span class="roll-group" style="text-align: left;background:${color};padding:2px 6px;border-radius:6px;margin-right:4px;display:inline-block;">
    <span class="roll-label" style="font-size:0.9em;opacity:0.7;">${
      value >= 0 ? "+" : "-"
    }:</span>
    <span class="roll-values" style="text-align: right;">${value}</span>
  </span>`;
          results.push(constSpan);
          groupIndex++;
          total += value;
        }
      }
    }
  });

  if (total <= 0) {
    total = 1;
  }

  Increment.instances.forEach((instance) => {
    instance.count = 1;
  });

  screen.innerHTML = `<div id="head" style="color: transparent;">${screen.innerHTML}</div>`;
  screen.innerHTML += `<br><div>(${results.join("")})</div><b>${total}</b>`;

  screen.scrollTop = screen.scrollHeight;
}
document.getElementById("roll").addEventListener("click", roll);

const pressedKeys = new Set();
document.addEventListener("keydown", function (event) {
  pressedKeys.add(event.key.toLowerCase());

  if (event.key === "Enter") {
    const roll = document.getElementById("roll");
    roll.classList.add("active");
    setTimeout(() => {
      roll.classList.remove("active");
      roll.click();
    }, 100);
  }
  if (event.key === "Backspace") {
    const clear = document.getElementById("clear");
    clear.classList.add("active");
    setTimeout(() => {
      clear.classList.remove("active");
      clear.click();
    }, 100);
  }
  if (event.key === "a" || event.key === "A") {
    const adv = document.getElementById("adv");
    adv.classList.add("active");
    setTimeout(() => {
      adv.classList.remove("active");
      adv.click();
    }, 100);
  }
  if (event.key === "d" || event.key === "D") {
    const dis = document.getElementById("dis");
    dis.classList.add("active");
    setTimeout(() => {
      dis.classList.remove("active");
      dis.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("u")) {
    const qd4 = document.getElementById("qd4");
    qd4.classList.add("active");
    setTimeout(() => {
      qd4.classList.remove("active");
      qd4.click();
    }, 100);
  } else if (event.key === "u" || event.key === "U") {
    const d4 = document.getElementById("d4");
    d4.classList.add("active");
    setTimeout(() => {
      d4.classList.remove("active");
      d4.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("i")) {
    const qd6 = document.getElementById("qd6");
    qd6.classList.add("active");
    setTimeout(() => {
      qd6.classList.remove("active");
      qd6.click();
    }, 100);
  } else if (event.key === "i" || event.key === "I") {
    const d6 = document.getElementById("d6");
    d6.classList.add("active");
    setTimeout(() => {
      d6.classList.remove("active");
      d6.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("o")) {
    const qd8 = document.getElementById("qd8");
    qd8.classList.add("active");
    setTimeout(() => {
      qd8.classList.remove("active");
      qd8.click();
    }, 100);
  } else if (event.key === "o" || event.key === "O") {
    const d8 = document.getElementById("d8");
    d8.classList.add("active");
    setTimeout(() => {
      d8.classList.remove("active");
      d8.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("p")) {
    const qd10 = document.getElementById("qd10");
    qd10.classList.add("active");
    setTimeout(() => {
      qd10.classList.remove("active");
      qd10.click();
    }, 100);
  } else if (event.key === "p" || event.key === "P") {
    const d10 = document.getElementById("d10");
    d10.classList.add("active");
    setTimeout(() => {
      d10.classList.remove("active");
      d10.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("j")) {
    const qd12 = document.getElementById("qd12");
    qd12.classList.add("active");
    setTimeout(() => {
      qd12.classList.remove("active");
      qd12.click();
    }, 100);
  } else if (event.key === "j" || event.key === "J") {
    const d12 = document.getElementById("d12");
    d12.classList.add("active");
    setTimeout(() => {
      d12.classList.remove("active");
      d12.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("k")) {
    const qd20 = document.getElementById("qd20");
    qd20.classList.add("active");
    setTimeout(() => {
      qd20.classList.remove("active");
      qd20.click();
    }, 100);
  } else if (event.key === "k" || event.key === "K") {
    const d20 = document.getElementById("d20");
    d20.classList.add("active");
    setTimeout(() => {
      d20.classList.remove("active");
      d20.click();
    }, 100);
  }
  if (pressedKeys.has("q") && pressedKeys.has("l")) {
    const qd100 = document.getElementById("qd100");
    qd100.classList.add("active");
    setTimeout(() => {
      qd100.classList.remove("active");
      qd100.click();
    }, 100);
  } else if (event.key === "l" || event.key === "L") {
    const d100 = document.getElementById("d100");
    d100.classList.add("active");
    setTimeout(() => {
      d100.classList.remove("active");
      d100.click();
    }, 100);
  }
  if (event.key === "+" || event.key === "=") {
    const plus = document.getElementById("plus");
    plus.classList.add("active");
    setTimeout(() => {
      plus.classList.remove("active");
      plus.click();
    }, 100);
  }
  if (event.key === "-") {
    const minus = document.getElementById("minus");
    minus.classList.add("active");
    setTimeout(() => {
      minus.classList.remove("active");
      minus.click();
    }, 100);
  }
  if (
    event.key === "1" ||
    event.key === "2" ||
    event.key === "3" ||
    event.key === "4" ||
    event.key === "5" ||
    event.key === "6" ||
    event.key === "7" ||
    event.key === "8" ||
    event.key === "9" ||
    event.key === "0"
  ) {
    const number = document.querySelector(`.number[data-key="${event.key}"]`);
    number.classList.add("active");
    setTimeout(() => {
      number.classList.remove("active");
      number.click();
    }, 100);
  }
});

document.addEventListener("keyup", function (event) {
  pressedKeys.delete(event.key.toLowerCase());
  document.querySelectorAll("*").forEach((el) => {
    if (document.activeElement === el) {
      el.blur();
    }
  });
});
