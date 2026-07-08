/**
 * 动态规划 — 在矩阵上逐格填充，生成动画帧序列
 * 支持: minPathSum / maxPathSum / uniquePaths
 *
 * @param {number[][]} matrix
 * @param {string} type
 * @returns {{ frames: Array, result: number }}
 */
export function generateDPFrames(matrix, type) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const frames = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (type === 'minPathSum') {
                if (i === 0 && j === 0) dp[i][j] = matrix[i][j];
                else if (i === 0) dp[i][j] = dp[i][j - 1] + matrix[i][j];
                else if (j === 0) dp[i][j] = dp[i - 1][j] + matrix[i][j];
                else dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + matrix[i][j];
            } else if (type === 'maxPathSum') {
                if (i === 0 && j === 0) dp[i][j] = matrix[i][j];
                else if (i === 0) dp[i][j] = dp[i][j - 1] + matrix[i][j];
                else if (j === 0) dp[i][j] = dp[i - 1][j] + matrix[i][j];
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]) + matrix[i][j];
            } else if (type === 'uniquePaths') {
                if (i === 0 || j === 0) dp[i][j] = 1;
                else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }

            frames.push({
                row: i,
                col: j,
                value: dp[i][j],
                description: `填充 [${i}, ${j}] = ${dp[i][j]}`,
            });
        }
    }

    return { frames, result: dp[rows - 1][cols - 1] };
}
