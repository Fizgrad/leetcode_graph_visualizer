/**
 * 最大流 (Edmonds-Karp) — BFS 寻找增广路径
 * @returns {{ frames: Array, maxFlow: number }}
 */
export function generateMaxFlowFrames(adjList, source, sink, nodeCount, directed) {
    const frames = [];

    // 构建容量图
    const cap = {};
    for (let i = 0; i < nodeCount; i++) {
        cap[i] = {};
        for (let j = 0; j < nodeCount; j++) cap[i][j] = 0;
    }
    for (let u = 0; u < nodeCount; u++) {
        for (const { neighbor: v, weight: w } of adjList[u] || []) {
            cap[u][v] += w;
            if (!directed) cap[v][u] += w;
        }
    }

    let maxFlow = 0;
    let iterCount = 0;

    frames.push({
        description: `最大流: 源点=${source}, 汇点=${sink}`,
        visited: new Set(),
        current: -1,
    });

    while (true) {
        // BFS 找增广路径
        const parent = {};
        const queue = [source];
        parent[source] = -1;

        while (queue.length > 0) {
            const u = queue.shift();
            for (let v = 0; v < nodeCount; v++) {
                if (!(v in parent) && cap[u][v] > 0) {
                    parent[v] = u;
                    queue.push(v);
                    if (v === sink) break;
                }
            }
        }

        if (!(sink in parent)) break;

        // 找瓶颈
        let pathFlow = Infinity;
        let v = sink;
        while (v !== source) {
            const u = parent[v];
            pathFlow = Math.min(pathFlow, cap[u][v]);
            v = u;
        }

        // 增广
        v = sink;
        while (v !== source) {
            const u = parent[v];
            cap[u][v] -= pathFlow;
            cap[v][u] += pathFlow;
            v = u;
        }

        maxFlow += pathFlow;
        iterCount++;
        frames.push({
            description: `第 ${iterCount} 轮: 找到增广路径, 流量 +${pathFlow}（总计: ${maxFlow}）`,
            visited: new Set(),
            current: -1,
        });
    }

    frames.push({
        description: `完成！最大流 = ${maxFlow}（共 ${iterCount} 轮）`,
        visited: new Set(),
        current: -1,
    });

    return { frames, maxFlow };
}
