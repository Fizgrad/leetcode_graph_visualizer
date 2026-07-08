/**
 * Dijkstra 最短路 — 生成动画帧序列
 * @returns {{ frames: Array, dist: number, path: number[] }}
 */
export function generateDijkstraFrames(adjList, start, end, nodeCount) {
    const frames = [];
    const dist = {};
    const prev = {};
    const finalized = new Set();

    for (let i = 0; i < nodeCount; i++) {
        dist[i] = Infinity;
        prev[i] = -1;
    }
    dist[start] = 0;

    frames.push({
        description: `初始化: dist[${start}] = 0，其余 = ∞`,
        visited: new Set(),
        finalized: new Set(),
        current: start,
        dist: { ...dist },
    });

    while (finalized.size < nodeCount) {
        // 选最小距离的未确定节点
        let u = -1;
        let minD = Infinity;
        for (let i = 0; i < nodeCount; i++) {
            if (!finalized.has(i) && dist[i] < minD) {
                minD = dist[i];
                u = i;
            }
        }
        if (u === -1 || dist[u] === Infinity) break;

        finalized.add(u);
        frames.push({
            description: `确定节点 ${u}（dist=${dist[u]}）`,
            visited: new Set(finalized),
            finalized: new Set(finalized),
            current: u,
            dist: { ...dist },
        });
        if (u === end) break;

        // 松弛邻边
        for (const { neighbor: v, weight: w } of adjList[u] || []) {
            if (dist[u] + w < dist[v]) {
                const old = dist[v];
                dist[v] = dist[u] + w;
                prev[v] = u;
                frames.push({
                    description: `松弛 ${u}→${v}: dist[${v}] = ${old === Infinity ? '∞' : old} → ${dist[v]}`,
                    visited: new Set(finalized),
                    finalized: new Set(finalized),
                    current: u,
                    dist: { ...dist },
                });
            }
        }
    }

    // 回溯路径
    const path = [];
    if (dist[end] < Infinity) {
        let cur = end;
        while (cur !== -1) {
            path.unshift(cur);
            cur = prev[cur];
        }
    }

    return { frames, dist: dist[end], path };
}
