function toRollover(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const ascii = str.charCodeAt(i);
    result += "i".repeat(ascii) + "a";
    if (i < str.length - 1) result += "n";
  }
  return result;
}
let rolloverified = toRollover(prompt("What string do you want to convert?"));
alert(rolloverified);
console.log(rolloverified);
