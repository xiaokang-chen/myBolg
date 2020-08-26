// function splitInterger(n) {
//   if (n === 1) {
//     return 1;
//   }
//   let res = -1;
//   for (let i = 1; i <= n - 1; i++) {
//     res = Math.max(res, i * (n - i), i * splitInterger(n - i));
//   }
//   return res;
// }

// console.log(splitInterger(8));

function splitInterger(n) {
  let dp = [];
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    for (let j = 1; j <= i - 1; j++) {
      if (!dp[i]) {
        dp[i] = -1;
      }
      dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j]);
    }
  }
  return dp;
}
console.log(splitInterger(10));
