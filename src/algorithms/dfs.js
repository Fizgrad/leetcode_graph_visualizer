/**
 * DFS 遍历（迭代式）— 生成动画帧序列
 */
export function generateDFSFrames(adjList, start) {
    const frames = [];
    const visited = new Set();
    const stack = [start];
    const order = [];

    frames.push({
        description: `起点 ${start} 入栈`,
        visited: new Set(),
        inQueue: new Set(stack),
        current: -1,
        order: [],
    });

    while (stack.length > 0) {
        const u = stack.pop();
        if (visited.has(u)) continue;

        visited.add(u);
        order.push(u);
        frames.push({
            description: `访问节点 ${u}`,
            visited: new Set(visited),
            inQueue: new Set(stack),
            current: u,
            order: [...order],
        });

        const neighbors = adjList[u] || [];
        for (let k = neighbors.length - 1; k >= 0; k--) {
            const v = neighbors[k].neighbor;
            if (!visited.has(v)) {
                stack.push(v);
                frames.push({
                    description: `节点 ${v} 入栈（从 ${u}）`,
                    visited: new Set(visited),
                    inQueue: new Set(stack),
                    current: u,
                    order: [...order],
                });
            }
        }
    }

    frames[frames.length - 1].order = order;
    return frames;
}
