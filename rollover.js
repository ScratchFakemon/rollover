let notices = "";
function runprogram(prg) {
  let cells = [0];
  const maxlength = 255;
  const maxvalue = 255;
  let currcellnum = 0;

  function execChar(char) {
    if (char === "n") {
      currcellnum++;
      cells.push(0);
      if (currcellnum > maxlength) {
        currcellnum = 0;
      }
    } else if (char === "i") {
      cells[currcellnum]++;
      if (cells[currcellnum] > maxvalue) {
        cells[currcellnum] = 0;
      }
    } else if (char === "p") {
      notices+=cells[currcellnum]+ "<br>";
      console.log(cells[currcellnum]);
    } else if (char === "u") {
      notices+=String.fromCodePoint(cells[currcellnum]) + "<br>";
      console.log(String.fromCodePoint(cells[currcellnum]));
    } else if (char === "a") {
      if (cells[currcellnum] < 128) {
        notices+=String.fromCharCode(cells[currcellnum]) + "<br>";
        console.log(String.fromCharCode(cells[currcellnum]));
      } else {
        notices+=`Rollover: ASCII Print Error; value "${cells[currcellnum]}" is not ASCII.<br>`
        console.error(
          `Rollover: ASCII Print Error; value "${cells[currcellnum]}" is not ASCII.`
        );
      }
    } else {
      notices+=`Rollover: Unknown command "${char}" in loop or program.<br>`
      console.error(`Rollover: Unknown command "${char}" in loop or program.`);
    }
  }

  for (let i = 0; i < prg.length; i++) {
    let currChar = prg[i];

    if (currChar === "c") {
      if (prg[i + 1] === "[") {
        let loopBody = "";
        let bracketDepth = 1;
        let j = i + 2;

        while (j < prg.length && bracketDepth > 0) {
          if (prg[j] === "[") bracketDepth++;
          else if (prg[j] === "]") bracketDepth--;

          if (bracketDepth > 0) loopBody += prg[j];
          j++;
        }

        if (bracketDepth !== 0) {
          notices+=`Rollover: Mismatched brackets starting at character ${i}.<br>`
          console.error(`Rollover: Mismatched brackets starting at character ${i}.`);
          return;
        }

        // Move main pointer to just after loop
        i = j - 1;

        // Execute loop body until value == index
        while (cells[currcellnum] !== currcellnum) {
          for (let k = 0; k < loopBody.length; k++) {
            execChar(loopBody[k]);
          }
        }

      } else {
        notices+=`Rollover: Loop Start Error at character ${i}; Expected "[", found "${prg[i + 1]}".<br>`
        console.error(
          `Rollover: Loop Start Error at character ${i}; Expected "[", found "${prg[i + 1]}".`
        );
      }

    } else if (currChar === "[") {
      if (prg[i - 1] !== "c") {
        notices+=`Rollover: Loop Reference Error at character ${i}; "[" without "c" before it.<br>`
                console.error(
          `Rollover: Loop Reference Error at character ${i}; "[" without "c" before it.`
        );
      }
    } else if (currChar === "]") {
      // No action — handled inside loop parsing
    } else {
      execChar(currChar);
    }
  }
notices+=`Final state: ${JSON.stringify(cells)}`
  console.log("Final state:", JSON.stringify(cells));
}
function runfromweb() {
  notices = ""
  let inputelement = document.getElementById("rolloverinput");
  let noticeselement = document.getElementById("notices");
  runprogram(inputelement.value);
  noticeselement.innerHTML = notices.toString();
}
document.onkeydown = (key) => {
          if (key.key === "Enter") {
            runfromweb();
          }}
