// Original Rollover interpreter by Scratch_Fakemon
// Rewritten by Pigeon (pid-j)

window.Rollover = class {
  constructor(length = 256, maxValue = 256, maxLoopIterations = 131_072, configuration = null) {
    this.reset(length, maxValue, maxLoopIterations);
    this.configuration = this._validateConfiguration(configuration) ?? {
      commands: {
        ignoreUnknown: false,
        typeset: {
          "a": "a",
          "c": "c",
          "[": "[",
          "]": "]",
          "g": "g",
          "i": "i",
          "n": "n",
          "p": "p",
          "u": "u"
        }
      }
    };
  }

  reset(length = 256, maxValue = 256, maxLoopIterations = 131_072) {
    this.output = new Array();
    this.maxValue = maxValue;
    this.maxLoopIterations = maxLoopIterations;
    this.cells = [0];
    this.cellAmount = length;
    this.pointer = 0;
  }

  _validateConfiguration(configuration = null) {
    if (typeof configuration != "object") return;
    if (configuration == null || configuration == {}) return;

    if (configuration.commands == null) return;

    return configuration;
  }

  _char(char = "") {
    try {
      return this.configuration.commands.typeset[char] || char;
    } catch {
      return char;
    }
  }

  _cfg(path = "") {
    let sp = path.split(".");

    try {
      return this.configuration[sp[0]][sp[1]];
    } catch {
      return null;
    }
  }

  async _doChar(char = "") {
    switch (char) {
      case this._char("n"):
        this.pointer++;
        this.pointer %= this.cellAmount;
        if (this.cells.length - 1 < this.pointer)
          this.cells.push(0);
        break;
      case this._char("i"):
        this.cells[this.pointer]++;
        this.cells[this.pointer] %= this.maxValue;
        break;
      case this._char("p"):
        this.output.push(this.cells[this.pointer].toString());
        break;
      case this._char("p"):
        this.output.push(String.fromCodePoint(this.cells[this.pointer]));
        break;
      case this._char("a"):
        if (this.cells[this.pointer] < 128) {
          this.output.push(String.fromCharCode(this.cells[this.pointer]));
          break;
        }
        this.output.push(`<br/>Rollover: ASCII Print Error; value "${this.cells[this.pointer]}" is not ASCII.<br/>`);
        console.error(`Rollover: ASCII Print Error; value "${this.cells[this.pointer]}" is not ASCII.`);
        break;
      case _char("g"):
        await (async () => {
          return await prompt(`Please input a number between 0 and ${this.maxValue - 1}.`)
        })().then(value => {
          let input = parseInt(value);
          if (Number.isNaN(input)) return;
          if (input < 0) input = 0;
          if (input >= this.maxValue) input = this.maxValue - 1;
          this.cells[this.pointer] = input;
        });
        break;
      default:
        if (this._cfg("commands.ignoreUnknown")) break;

        this.output.push(`<br/>Rollover: Unknown command "${char}" in loop or program.<br/>`);
        console.error(`Rollover: Unknown command "${char}" in loop or program.`);
        break;
    }
  }

  async _parseAndRunLoop(body = "", iterations = 0) {
    if (iterations > this.maxLoopIterations) {
      throw new Error(`Rollover: Crashed due to loop limit (${this.maxLoopIterations}) being exceeded!`);
    }

    for (let k = 0; k < body.length; k++) {
      const char = body.charAt(k) || "";
      if (char === this._char("c") &&
        body.charAt(k + 1) === this._char("[")) {
        // Start of nested loop
        let bracketDepth = 1;
        let innerBody = "";
        let m = k + 2;
        while (m < body.length && bracketDepth > 0) {
          if (body.charAt(m) === this._char("[")) bracketDepth++;
          else if (body.charAt(m) === this._char("]")) bracketDepth--;
          if (bracketDepth > 0) innerBody += body.charAt(m);
          m++;
        }

        if (bracketDepth !== 0) {
          this.output.push(`<br/>Rollover: Mismatched brackets in nested loop.<br/>`);
          console.error(`Rollover: Mismatched brackets in nested loop.`);
          return;
        }

        // Move k to end of loop block
        k = m - 1;

        // Execute nested loop
        while (this.cells[this.pointer] !== this.pointer) {
          await this._parseAndRunLoop(innerBody, iterations + 1);
        }

        continue;
      }

      await this._doChar(char);
    }
  }

  async runProgram(program = "") {
    for (let i = 0; i < program.length; i++) {
      let currChar = program.charAt(i);

      if (currChar === this._char("c")) {
        if (program.charAt(i + 1) === this._char("[")) {
          let loopBody = "";
          let bracketDepth = 1;
          let j = i + 2;

          while (j < program.length && bracketDepth > 0) {
            if (program.charAt(j) === this._char("[")) bracketDepth++;
            else if (program.charAt(j) === this._char("]")) bracketDepth--;
            if (bracketDepth > 0) loopBody += program.charAt(j);
            j++;
          }

          if (bracketDepth !== 0) {
            this.output.push(`<br/>Rollover: Mismatched brackets starting at character ${i}.<br/>`);
            console.error(
              `Rollover: Mismatched brackets starting at character ${i}.`,
            );
            return;
          }

          i = j - 1;

          let iterations = -1;
          while (this.cells[this.pointer] !== this.pointer) {
            iterations++;
            await this._parseAndRunLoop(loopBody, iterations);
          }
        } else {
          this.output.push(`<br/>Rollover: Loop Start Error at character ${i}; Expected "${this._char("[")}" but found "${program.charAt(i + 1)}".<br/>`);
          console.error(
            `Rollover: Loop Start Error at character ${i}; Expected "${this._char("[")}" but found "${program.charAt(i + 1)}".`,
          );
        }
      } else if (currChar === this._char("[")) {
        if (program.charAt(i - 1) !== this._char("c")) {
          this.output.push(`<br/>Rollover: Loop Reference Error at character ${i}; "${this._char("[")}"" without "${this._char("c")}" before it.<br/>`);
          console.error(
            `Rollover: Loop Reference Error at character ${i}; "${this._char("[")} without ""${this._char("c")}" before it.`,
          );
        }
      } else if (currChar === this._char("]")) {
        // Handled during loop parsing
      } else {
        await this._doChar(currChar);
      }
    }

    return this.output.map(el => { return el.toString() }).join("");
  }

  stringToRollover(text = "") {
    let result = [];
    let stack = [0];
    let pointer = 0;
    text.split("").forEach(char => {
      let codepoint = char.codePointAt(0);

      if (codepoint >= this.maxValue) return;

      if (stack[pointer] > codepoint && stack.length < this.cellAmount) {
        while (true) {
          pointer++;
          pointer %= this.cellAmount;
          result.push(this._char("n"));
          if (pointer >= stack.length) break;
        }

        stack.push(0);
      }

      while (true) {
        if (stack[pointer] === codepoint) {
          result.push(this._char("u"));
          break;
        };

        stack[pointer]++;
        stack[pointer] %= this.maxValue;
        result.push(this._char("i"));
      }
    });

    return result.join("");
  }
}
