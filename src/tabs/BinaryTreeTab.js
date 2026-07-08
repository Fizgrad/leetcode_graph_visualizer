/**
 * BinaryTreeTab — LeetCode 二叉树可视化 + 前中后序遍历演示
 */
import { BaseTab } from './BaseTab.js';
import { getFirstLine, parseLeetCodeArray } from '../utils/helpers.js';
import { TRAVERSALS } from '../algorithms/treeTraversal.js';
import { Renderer } from '../core/Renderer.js';

export class BinaryTreeTab extends BaseTab {
    constructor(ctx) {
        super(ctx, 1, 'tabContent1');
        this._lastNodes = [];
        this._lastEdges = [];
        this._bindUI();
    }

    _bindUI() {
        document.getElementById('drawTreeBtn').addEventListener('click', () => this.render());
        document.getElementById('traversalRunBtn').addEventListener('click', () => this._runTraversal());
        document.getElementById('traversalStopBtn').addEventListener('click', () => this.ctx.animation.stop());
        document.getElementById('traversalResetBtn').addEventListener('click', () => this._resetColors());

        const speedSlider = document.getElementById('traversalSpeed');
        const speedLabel = document.getElementById('traversalSpeedLabel');
        speedSlider.addEventListener('input', () => { speedLabel.textContent = speedSlider.value + 'ms'; });
    }

    onActivate() {
        if (!document.getElementById('leetcode-input').value.trim()) {
            document.getElementById('leetcode-input').value = '[3,9,20,null,null,15,7]';
        }
        this.render();
    }

    reset() {
        this._lastNodes = [];
        this._lastEdges = [];
        document.getElementById('leetcode-input').value = '';
        document.getElementById('traversal-result').textContent = '';
        document.getElementById('error-message-leetcode').textContent = '';
        this.ctx.renderer.setData([], []);
    }

    /** 解析输入并渲染二叉树 */
    render() {
        const errEl = document.getElementById('error-message-leetcode');
        const resultEl = document.getElementById('traversal-result');
        errEl.textContent = '';
        resultEl.textContent = '';
        try {
            const line = getFirstLine(document.getElementById('leetcode-input').value);
            if (!line) {
                this._lastNodes = [];
                this._lastEdges = [];
                this.ctx.renderer.setData([], []);
                return;
            }
            const arr = parseLeetCodeArray(line);
            const { nodes, edges } = this._buildTree(arr);

            this._lastNodes = nodes;
            this._lastEdges = edges;
            this.ctx.renderer.setData(nodes, edges, {
                layout: { hierarchical: { direction: 'UD', sortMethod: 'directed', levelSeparation: 80, nodeSpacing: 120 } },
                nodes: { shape: 'circle', size: 25, font: { color: '#1e293b' }, color: { border: '#3b82f6', background: '#dbeafe' } },
                edges: { arrows: 'to', color: '#94a3b8' },
                physics: { enabled: false },
            });
        } catch (e) {
            errEl.textContent = '解析错误: ' + e.message;
        }
    }

    /** 从 LeetCode 数组构建 vis-network 节点和边 */
    _buildTree(arr) {
        const nodes = [];
        const edges = [];
        if (arr.length === 0 || arr[0] === null) {
            if (arr.length > 0) throw new Error('根节点不能为 null');
            return { nodes, edges };
        }

        const queue = [0];
        nodes.push({ id: 0, label: String(arr[0]), color: { ...Renderer.COLORS.default } });
        let head = 0;
        while (head < queue.length) {
            const p = queue[head++];
            const l = 2 * p + 1;
            const r = 2 * p + 2;
            if (l < arr.length && arr[l] !== null) {
                nodes.push({ id: l, label: String(arr[l]), color: { ...Renderer.COLORS.default } });
                edges.push({ id: `e${edges.length}`, from: p, to: l, arrows: 'to', color: '#94a3b8' });
                queue.push(l);
            }
            if (r < arr.length && arr[r] !== null) {
                nodes.push({ id: r, label: String(arr[r]), color: { ...Renderer.COLORS.default } });
                edges.push({ id: `e${edges.length}`, from: p, to: r, arrows: 'to', color: '#94a3b8' });
                queue.push(r);
            }
        }
        return { nodes, edges };
    }

    /** 运行选中的遍历动画 */
    async _runTraversal() {
        if (this._lastNodes.length === 0 || this.ctx.animation.isRunning) return;

        const type = document.getElementById('traversalSelect').value;
        if (!type) return;

        const cfg = TRAVERSALS[type];
        if (!cfg) return;

        const delay = parseInt(document.getElementById('traversalSpeed').value, 10) || 700;
        const frames = cfg.generate(this._lastNodes, this._lastEdges);
        const resultEl = document.getElementById('traversal-result');

        // 帧应用函数：高亮 current，标记 visited
        const applyFrame = (frame) => {
            const updates = this._lastNodes.map((n) => {
                let color = { ...Renderer.COLORS.idle };
                if (frame.visited.has(n.id)) color = { ...Renderer.COLORS.visited };
                if (frame.current === n.id) color = { ...Renderer.COLORS.current };
                return { id: n.id, color };
            });
            this.ctx.renderer.updateNodes(updates);
        };

        const completed = await this.ctx.animation.play(frames, delay, (frame, i) => {
            applyFrame(frame);
            resultEl.textContent = `[${i + 1}/${frames.length}] ${frame.description}`;
        });

        if (completed) {
            // 显示最终访问顺序（用节点 label 而非 id）
            const labelMap = {};
            this._lastNodes.forEach((n) => { labelMap[n.id] = n.label; });
            const orderLabels = frames[frames.length - 1].order.map((id) => labelMap[id]);
            resultEl.textContent = `${cfg.label}结果: ${orderLabels.join(' → ')}`;
        }
    }

    /** 重置所有节点为默认色 */
    _resetColors() {
        if (this._lastNodes.length === 0) return;
        const updates = this._lastNodes.map((n) => ({
            id: n.id,
            color: { ...Renderer.COLORS.default },
        }));
        this.ctx.renderer.updateNodes(updates);
    }
}
