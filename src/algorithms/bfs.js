/**
 * BFS 遍历 — 生成动画帧序列
 * @returns {Array<Frame>} 每帧包含 visited/current/inQueue/order/description
 */
export function generateBFSFrames(adjList, start, nodeCount) {
    const frames = [];
    const visited = new Set([start]);
    const queue = [start];
    const order = [];

    frames.push({
        description: `起点 ${start} 入队`,
        visited: new Set(visited),
        inQueue: new Set(queue),
        current: -1,
        order: [],
    });

    while (queue.length > 0) {
        const u = queue.shift();
        order.push(u);
        frames.push({
            description: `访问节点 ${u}`,
            visited: new Set(visited),
            inQueue: new Set(queue),
            current: u,
            order: [...order],
        });

        for (const { neighbor: v } of adjList[u] || []) {
            if (!visited.has(v)) {
                visited.add(v);
                queue.push(v);
                frames.push({
                    description: `发现节点 ${v}（从 ${u}）`,
                    visited: new Set(visited),
                    inQueue: new Set(queue),
                    current: u,
                    order: [...order],
                });
            }
        }
    }

    frames[frames.length - 1].order = order;
    return frames;
}
