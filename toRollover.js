function toRollover(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const ascii = str.charCodeAt(i);
    result += "i".repeat(ascii) + "a";
    if (i < str.length - 1) result += "n";
  }
  return result;
}

console.log(toRollover("According to all known laws of aviation, there is no way a bee should be able to fly."));
