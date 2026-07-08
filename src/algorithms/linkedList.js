/**
 * 链表算法 — 生成动画帧序列
 *
 * 帧结构:
 *   {
 *     description: string,
 *     highlights: { [nodeId]: { background, border } },
 *     labels: { [nodeId]: string },        // 可选: 该帧的节点 label
 *     edges: [{ from, to, color, width, dashes }]  // 可选: 该帧的完整边集
 *   }
 *   如果帧带 edges 字段，则用该边集完全替换当前边; 否则保持原边不变。
 */
import { COLORS as C } from '../constants/colors.js';

/** 构建默认边集，支持双向和循环 */
function defaultEdges(n, isDoubly = false, isCircular = false) {
    const edges = [];
    for (let i = 0; i < n - 1; i++) {
        edges.push({ from: i, to: i + 1, color: '#3b82f6', width: 2 });
        if (isDoubly) {
            edges.push({ from: i + 1, to: i, color: '#93c5fd', width: 2, dashes: true });
        }
    }
    if (isCircular && n > 0) {
        edges.push({ from: n - 1, to: 0, color: '#3b82f6', width: 2 });
        if (isDoubly) {
            edges.push({ from: 0, to: n - 1, color: '#93c5fd', width: 2, dashes: true });
        }
    }
    return edges;
}

/** 高亮辅助: 生成所有节点的高亮 map */
function makeHighlights(n, marks) {
    const h = {};
    for (let i = 0; i < n; i++) {
        h[i] = { ...C.idle };
    }
    if (marks.current != null) h[marks.current] = { ...C.current };
    if (marks.prev != null && marks.prev !== marks.current) h[marks.prev] = { ...C.prev };
    if (marks.next != null && marks.next !== marks.current && marks.next !== marks.prev) h[marks.next] = { ...C.next };
    if (marks.found != null) h[marks.found] = { ...C.found };
    if (marks.matched != null) h[marks.matched] = { ...C.matched };
    return h;
}

/**
 * 反转链表（迭代法）
 * 逐帧更新边方向: curr.next = prev
 */
export function generateReverseFrames(arr) {
    const n = arr.length;
    const frames = [];
    let prev = null;
    let curr = 0;

    // 初始: 全部正向边
    frames.push({
        description: '初始状态: prev=null, curr=0',
        highlights: makeHighlights(n, { current: 0, prev: null, next: n > 1 ? 1 : null }),
        edges: defaultEdges(n),
    });

    while (curr !== null && curr < n) {
        const next = curr + 1 < n ? curr + 1 : null;

        // 构建当前帧的边集
        const edges = [];

        // 已反转的 prev 链: 从 prev 往回到 0
        if (prev !== null) {
            for (let i = prev; i > 0; i--) {
                edges.push({ from: i, to: i - 1, color: '#22c55e', width: 3 });
            }
            edges.push({ from: curr, to: prev, color: '#f59e0b', width: 3 });
        }

        // curr → next (即将断开)
        if (next !== null) {
            edges.push({ from: curr, to: next, color: '#94a3b8', width: 2, dashes: true });
        }

        // 剩余正向边
        if (next !== null) {
            for (let i = next; i < n - 1; i++) {
                edges.push({ from: i, to: i + 1, color: '#3b82f6', width: 2 });
            }
        }

        frames.push({
            description: `反转: curr=${arr[curr]}.next → prev=${prev !== null ? arr[prev] : 'null'}`,
            highlights: makeHighlights(n, { current: curr, prev, next }),
            edges,
        });

        prev = curr;
        curr = next;
    }

    // 最终: 全部反向边
    const finalEdges = [];
    for (let i = n - 1; i > 0; i--) {
        finalEdges.push({ from: i, to: i - 1, color: '#22c55e', width: 3 });
    }
    frames.push({
        description: '反转完成! 所有 next 指针已反向',
        highlights: makeHighlights(n, {}),
        edges: finalEdges,
    });

    return frames;
}

/** 快慢指针找中点 */
export function generateFindMiddleFrames(arr, opts = {}) {
    const n = arr.length;
    const frames = [];
    let slow = 0;
    let fast = 0;
    const { isDoubly = false, isCircular = false } = opts;
    const edges = defaultEdges(n, isDoubly, isCircular);

    const labels = (s, f) => {
        const m = {};
        for (let i = 0; i < n; i++) {
            let lbl = String(arr[i]);
            if (i === s && i === f) lbl += '\n[S/F]';
            else if (i === s) lbl += '\n[slow]';
            else if (i === f) lbl += '\n[fast]';
            m[i] = lbl;
        }
        return m;
    };

    const hl = (s, f, visited) => {
        const h = {};
        for (let i = 0; i < n; i++) {
            if (i === s && i === f) h[i] = { ...C.matched };
            else if (i === s) h[i] = { ...C.current };
            else if (i === f) h[i] = { ...C.next };
            else if (visited && visited.has(i)) h[i] = { ...C.visitedTrack };
            else h[i] = { ...C.idle };
        }
        return h;
    };

    const slowVisited = new Set([0]);

    frames.push({
        description: `起点: slow 和 fast 都在第 0 个节点 (${arr[0]})`,
        highlights: hl(slow, fast),
        labels: labels(slow, fast),
        edges,
    });

    let step = 0;
    while (fast + 1 < n) {
        step++;
        slow = slow + 1;
        fast = fast + 2;
        if (fast >= n) fast = n - 1;
        slowVisited.add(slow);

        frames.push({
            description: `第 ${step} 步: slow 走到 ${arr[slow]} (1步), fast 走到 ${arr[fast]} (2步)${fast === n - 1 && fast + 1 >= n ? ' — fast 到达末尾' : ''}`,
            highlights: hl(slow, fast, slowVisited),
            labels: labels(slow, fast),
            edges,
        });
    }

    const finalH = {};
    for (let i = 0; i < n; i++) {
        finalH[i] = i === slow ? { ...C.found } : { ...C.idle };
    }
    const finalLabels = {};
    for (let i = 0; i < n; i++) {
        finalLabels[i] = i === slow ? `${arr[i]}\n[中点]` : String(arr[i]);
    }
    frames.push({
        description: `fast 到达末尾, slow 停在中点: ${arr[slow]} (索引 ${slow})`,
        highlights: finalH,
        labels: finalLabels,
        edges,
    });

    return frames;
}

/** 检测环（快慢指针）— 自动判断列表是否有环 */
export function generateDetectCycleFrames(arr, isCircular = false, opts = {}) {
    const n = arr.length;
    const frames = [];
    const { isDoubly = false } = opts;
    const edges = defaultEdges(n, isDoubly, isCircular);

    let slow = 0;
    let fast = 0;

    const labels = (s, f) => {
        const m = {};
        for (let i = 0; i < n; i++) {
            let lbl = String(arr[i]);
            if (i === s && i === f) lbl += '\n[S/F]';
            else if (i === s) lbl += '\n[S]';
            else if (i === f) lbl += '\n[F]';
            m[i] = lbl;
        }
        return m;
    };

    const hl = (s, f) => {
        const h = {};
        for (let i = 0; i < n; i++) {
            if (i === s && i === f) h[i] = { ...C.matched };
            else if (i === s) h[i] = { ...C.current };
            else if (i === f) h[i] = { ...C.next };
            else h[i] = { ...C.idle };
        }
        return h;
    };

    frames.push({
        description: `起点: slow 和 fast 都在节点 ${arr[0]}`,
        highlights: hl(slow, fast),
        labels: labels(slow, fast),
        edges,
    });

    if (isCircular && n > 0) {
        const maxSteps = n * 3;
        for (let step = 0; step < maxSteps; step++) {
            slow = (slow + 1) % n;
            fast = (fast + 2) % n;

            if (slow === fast) {
                frames.push({
                    description: `第 ${step + 1} 步: slow 和 fast 在节点 ${arr[slow]} 相遇 → 检测到环!`,
                    highlights: hl(slow, fast),
                    labels: labels(slow, fast),
                    edges,
                });
                return frames;
            }
            frames.push({
                description: `第 ${step + 1} 步: slow→${arr[slow]} (走1步), fast→${arr[fast]} (走2步) — fast 在追赶 slow`,
                highlights: hl(slow, fast),
                labels: labels(slow, fast),
                edges,
            });
        }
    } else {
        let step = 0;
        while (true) {
            const nextSlow = slow + 1 < n ? slow + 1 : null;
            const nextFast = fast + 2 < n ? fast + 2 : null;
            if (nextFast === null || nextSlow === null) {
                frames.push({
                    description: `fast 走到链表末尾, 无法继续 → 无环`,
                    highlights: hl(slow, fast),
                    labels: labels(slow, fast),
                    edges,
                });
                return frames;
            }
            step++;
            slow = nextSlow;
            fast = nextFast;
            frames.push({
                description: `第 ${step} 步: slow→${arr[slow]} (走1步), fast→${arr[fast]} (走2步)`,
                highlights: hl(slow, fast),
                labels: labels(slow, fast),
                edges,
            });
        }
    }

    return frames;
}

/** 删除倒数第 N 个节点（双指针法）
 *  返回 { frames, deletedIndex }
 */
export function generateRemoveNthFromEndFrames(arr, n, opts = {}) {
    const len = arr.length;
    const frames = [];
    if (n > len || n <= 0) {
        frames.push({ description: `无效的 n: ${n}`, highlights: {}, edges: [] });
        return { frames, deletedIndex: -1 };
    }

    const { isDoubly = false, isCircular = false } = opts;
    const edges = defaultEdges(len, isDoubly, isCircular);

    const targetIdx = len - n;
    let fastIdx = 0;
    let slowIdx = 0;

    const makeFrame = (desc) => ({
        description: desc,
        highlights: makeHighlights(len, {
            current: slowIdx,
            next: fastIdx !== slowIdx ? fastIdx : null,
            matched: targetIdx,
        }),
        edges,
    });

    for (let i = 0; i < n; i++) {
        fastIdx = i + 1;
        frames.push(makeFrame(`快指针先走 ${i + 1} 步 → ${arr[fastIdx]}`));
    }

    while (fastIdx < len - 1) {
        slowIdx++;
        fastIdx++;
        frames.push(makeFrame(`同时移动: slow→${arr[slowIdx]}, fast→${arr[fastIdx]}`));
    }

    // 标记目标节点 + 展示删除后的边
    const afterEdges = [];
    for (let i = 0; i < len - 1; i++) {
        if (i === targetIdx - 1) {
            if (targetIdx + 1 < len) {
                afterEdges.push({ from: i, to: targetIdx + 1, color: '#22c55e', width: 3 });
            }
        } else if (i < targetIdx) {
            afterEdges.push({ from: i, to: i + 1, color: '#3b82f6', width: 2 });
        } else if (i > targetIdx) {
            afterEdges.push({ from: i, to: i + 1, color: '#3b82f6', width: 2 });
        }
    }

    const h = makeHighlights(len, { found: targetIdx });
    h[targetIdx] = { ...C.matched };
    frames.push({
        description: `删除节点 ${arr[targetIdx]} (索引 ${targetIdx}), 重新连接指针`,
        highlights: h,
        edges: afterEdges,
    });

    return { frames, deletedIndex: targetIdx };
}

/** 所有算法注册表 */
export const LIST_ALGOS = {
    reverse: { label: '反转链表', needsParam: false, generate: (arr) => ({ frames: generateReverseFrames(arr) }) },
    findMiddle: { label: '找中点 (快慢指针)', needsParam: false, generate: (arr, _param, _isCircular, opts) => ({ frames: generateFindMiddleFrames(arr, opts) }) },
    detectCycle: { label: '检测环 (快慢指针)', needsParam: false, generate: (arr, _param, isCircular, opts) => ({ frames: generateDetectCycleFrames(arr, isCircular, opts) }) },
    removeNth: { label: '删除倒数第N个', needsParam: true, paramName: 'n', generate: (arr, param, _isCircular, opts) => { const r = generateRemoveNthFromEndFrames(arr, param, opts); return { frames: r.frames, deletedIndex: r.deletedIndex }; } },
};
