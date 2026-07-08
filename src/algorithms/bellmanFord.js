/**
 * Bellman-Ford 最短路 — 支持负权边，检测负环
 * @returns {{ frames: Array, dist: number, path: number[], negativeCycle: boolean }}
 */
export function generateBellmanFordFrames(adjList, start, end, nodeCount) {
    const frames = [];
    const dist = {};
    const prev = {};
    for (let i = 0; i < nodeCount; i++) { dist[i] = Infinity; prev[i] = -1; }
    dist[start] = 0;

    // 构建边列表
    const allEdges = [];
    for (let u = 0; u < nodeCount; u++) {
        for (const { neighbor: v, weight: w } of adjList[u] || []) {
            allEdges.push({ from: u, to: v, weight: w });
        }
    }

    frames.push({
        description: `初始化: dist[${start}] = 0`,
        visited: new Set(),
        current: start,
        dist: { ...dist },
    });

    // V-1 轮松弛
    for (let iter = 0; iter < nodeCount - 1; iter++) {
        let updated = false;
        for (const edge of allEdges) {
            if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
                dist[edge.to] = dist[edge.from] + edge.weight;
                prev[edge.to] = edge.from;
                updated = true;
                frames.push({
                    description: `第 ${iter + 1} 轮: 松弛 ${edge.from}→${edge.to}, dist=${dist[edge.to]}`,
                    visited: new Set(),
                    current: edge.from,
                    dist: { ...dist },
                });
            }
        }
        if (!updated) break;
    }

    // 检测负环
    let negativeCycle = false;
    for (const edge of allEdges) {
        if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
            negativeCycle = true;
            break;
        }
    }

    // 回溯路径
    const path = [];
    if (dist[end] < Infinity && !negativeCycle) {
        let cur = end;
        while (cur !== -1) {
            path.unshift(cur);
            cur = prev[cur];
        }
    }

    return { frames, dist: dist[end], path, negativeCycle };
}
