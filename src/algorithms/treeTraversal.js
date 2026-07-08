/**
 * 二叉树遍历 — 前序 / 中序 / 后序
 *
 * 输入: nodes 数组（vis-network 节点格式，含 id），edges 数组（含 from/to）
 * 通过 edges 构建「父→子」关系，从根节点（id=0）开始递归遍历。
 *
 * 每帧结构:
 *   { description, current, visited: Set, order: number[] }
 *   - current: 当前访问的节点 id（高亮为橙色）
 *   - visited: 已访问的节点集合（蓝色）
 *   - order:   到目前为止的访问顺序（节点 id 数组）
 */

/** 从 edges 构建 子节点映射 { parentId: [leftChildId, rightChildId] } */
function buildChildrenMap(nodes, edges) {
    const map = {};
    for (const n of nodes) map[n.id] = [];
    for (const e of edges) {
        if (!map[e.from]) map[e.from] = [];
        map[e.from].push(e.to);
    }
    // 每个父节点的子节点按 id 排序，保证左子树在前
    Object.keys(map).forEach((k) => map[k].sort((a, b) => a - b));
    return map;
}

/** 前序遍历: 根 → 左 → 右 */
export function generatePreOrderFrames(nodes, edges) {
    const children = buildChildrenMap(nodes, edges);
    const frames = [];
    const visited = new Set();
    const order = [];

    function dfs(u) {
        if (u === undefined || u === null) return;
        visited.add(u);
        order.push(u);
        frames.push({
            description: `访问节点 ${u}（前序: 根→左→右）`,
            current: u,
            visited: new Set(visited),
            order: [...order],
        });
        const [left, right] = children[u] || [];
        dfs(left);
        dfs(right);
    }

    dfs(nodes.length > 0 ? nodes[0].id : null);
    return frames;
}

/** 中序遍历: 左 → 根 → 右 */
export function generateInOrderFrames(nodes, edges) {
    const children = buildChildrenMap(nodes, edges);
    const frames = [];
    const visited = new Set();
    const order = [];

    function dfs(u) {
        if (u === undefined || u === null) return;
        const [left, right] = children[u] || [];
        dfs(left);
        visited.add(u);
        order.push(u);
        frames.push({
            description: `访问节点 ${u}（中序: 左→根→右）`,
            current: u,
            visited: new Set(visited),
            order: [...order],
        });
        dfs(right);
    }

    dfs(nodes.length > 0 ? nodes[0].id : null);
    return frames;
}

/** 后序遍历: 左 → 右 → 根 */
export function generatePostOrderFrames(nodes, edges) {
    const children = buildChildrenMap(nodes, edges);
    const frames = [];
    const visited = new Set();
    const order = [];

    function dfs(u) {
        if (u === undefined || u === null) return;
        const [left, right] = children[u] || [];
        dfs(left);
        dfs(right);
        visited.add(u);
        order.push(u);
        frames.push({
            description: `访问节点 ${u}（后序: 左→右→根）`,
            current: u,
            visited: new Set(visited),
            order: [...order],
        });
    }

    dfs(nodes.length > 0 ? nodes[0].id : null);
    return frames;
}

/** 遍历类型 → 帧生成器 的映射表 */
export const TRAVERSALS = {
    preorder: { label: '前序遍历', generate: generatePreOrderFrames },
    inorder: { label: '中序遍历', generate: generateInOrderFrames },
    postorder: { label: '后序遍历', generate: generatePostOrderFrames },
};
