const letters = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const starter = [0, 0, 0, 0];

module.exports = () =>
  starter
    .map(() => letters.charAt(Math.floor(Math.random() * letters.length)))
    .join("");
