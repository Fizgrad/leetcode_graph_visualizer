/**
 * GeneralGraphTab — 通用图/树 Tab
 * 包含图解析、绘制，以及 BFS/DFS/Dijkstra/BellmanFord/MaxFlow 算法演示
 */
import { BaseTab } from './BaseTab.js';
import { getRadio, showEl } from '../utils/helpers.js';
import { generateBFSFrames } from '../algorithms/bfs.js';
import { generateDFSFrames } from '../algorithms/dfs.js';
import { generateDijkstraFrames } from '../algorithms/dijkstra.js';
import { generateBellmanFordFrames } from '../algorithms/bellmanFord.js';
import { generateMaxFlowFrames } from '../algorithms/maxFlow.js';
import { Renderer } from '../core/Renderer.js';

const ALGORITHMS = {
    bfs: { needsEnd: false, runner: (adj, s, e, n, dir) => ({ frames: generateBFSFrames(adj, s), result: () => 'BFS 顺序' }) },
    dfs: { needsEnd: false, runner: (adj, s, e, n, dir) => ({ frames: generateDFSFrames(adj, s), result: () => 'DFS 顺序' }) },
    dijkstra: { needsEnd: true, runner: (adj, s, e, n, dir) => { const r = generateDijkstraFrames(adj, s, e, n); return { frames: r.frames, result: () => `最短距离: ${r.dist}${r.path.length ? ' | 路径: ' + r.path.join(' → ') : ' (不可达)'}` }; } },
    bellman: { needsEnd: true, runner: (adj, s, e, n, dir) => { const r = generateBellmanFordFrames(adj, s, e, n); return { frames: r.frames, result: () => r.negativeCycle ? '检测到负环！' : `最短距离: ${r.dist}` }; } },
    maxflow: { needsEnd: true, runner: (adj, s, e, n, dir) => { const r = generateMaxFlowFrames(adj, s, e, n, dir); return { frames: r.frames, result: () => `最大流: ${r.maxFlow}` }; } },
};

export class GeneralGraphTab extends BaseTab {
    constructor(ctx) {
        super(ctx, 0, 'tabContent0');
        this._bindUI();
    }

    onActivate() {
        if (!document.getElementById('graphStructureInput').value.trim()) {
            this._setExample();
        }
        this._updateUI();
        this.render();
    }

    reset() {
        document.getElementById('graphStructureInput').value = '';
        document.getElementById('nodeWeightsInput').value = '';
        document.getElementById('edgeWeightsInput').value = '';
        document.getElementById('algo-result').textContent = '';
        document.getElementById('error-message-general').textContent = '';
        document.getElementById('algoStart').value = '';
        document.getElementById('algoEnd').value = '';
        this.ctx.renderer.setData([], []);
    }

    _bindUI() {
        // 图选项变更
        this.contentEl.querySelectorAll('input[type="radio"]').forEach((r) => {
            r.addEventListener('change', () => this._updateUI());
        });
        // 绘制按钮
        document.getElementById('drawGraphBtn').addEventListener('click', () => this.render());
        // 算法控件
        document.getElementById('algoSelect').addEventListener('change', () => this._onAlgoChange());
        document.getElementById('algoRunBtn').addEventListener('click', () => this._runAlgorithm());
        document.getElementById('algoStopBtn').addEventListener('click', () => this.ctx.animation.stop());
        document.getElementById('algoResetBtn').addEventListener('click', () => this._resetColors());
        // 速度标签实时更新
        const speedSlider = document.getElementById('algoSpeed');
        const speedLabel = document.getElementById('algoSpeedLabel');
        speedSlider.addEventListener('input', () => { speedLabel.textContent = speedSlider.value + 'ms'; });
    }

    _setExample() {
        document.getElementById('graphStructureInput').value = '[[0,1,5],[1,3,10],[0,2,3],[2,3,4]]';
        document.querySelector('input[name="edgeWeightSource"][value="thirdElement"]').checked = true;
        this._updateUI();
    }

    _updateUI() {
        // 节点权重
        const hasNodeWeights = getRadio('hasNodeWeights') === 'yes';
        showEl('nodeWeightsGroup', hasNodeWeights);

        // 边权重（仅边列表模式才有）
        const isEdgeList = getRadio('graphFormat') === 'edgeList';
        showEl('edgeWeightsGroup', isEdgeList);
        if (isEdgeList) {
            const src = getRadio('edgeWeightSource');
            showEl('edgeWeightsInputWrap', src === 'separate');
        }
    }

    _onAlgoChange() {
        const algo = document.getElementById('algoSelect').value;
        const cfg = ALGORITHMS[algo];
        showEl('algoEnd', cfg ? cfg.needsEnd : false);
    }

    /** 解析输入，构建图数据并渲染 */
    render() {
        const errEl = document.getElementById('error-message-general');
        const algoResultEl = document.getElementById('algo-result');
        errEl.textContent = '';
        algoResultEl.textContent = '';

        try {
            const graph = this._parseGraph();
            this._buildAndRender(graph);
            this.ctx.store.setGraph(graph);
        } catch (e) {
            errEl.textContent = '解析错误: ' + e.message;
        }
    }

    _parseGraph() {
        const format = getRadio('graphFormat');
        const indexMode = getRadio('indexMode');
        const graphType = getRadio('graphType');
        const hasNodeWeights = getRadio('hasNodeWeights') === 'yes';
        const edgeWeightSource = format === 'edgeList' ? getRadio('edgeWeightSource') : 'none';
        const idOffset = indexMode === '1-indexed' ? 1 : 0;
        const adjustId = (id) => id - idOffset;

        const graphText = document.getElementById('graphStructureInput').value.trim();
        if (!graphText) return null;
        const graphData = JSON.parse(graphText);

        const nodeWeights = hasNodeWeights
            ? JSON.parse(document.getElementById('nodeWeightsInput').value)
            : null;

        let rawEdges = [];
        let extractedWeights = null;

        if (format === 'edgeList') {
            if (edgeWeightSource === 'thirdElement') {
                graphData.forEach((item) => {
                    if (!Array.isArray(item) || item.length !== 3)
                        throw new Error('选择第三元素但数据项长度不为3');
                });
                rawEdges = graphData.map((item) => [item[0], item[1]]);
                extractedWeights = graphData.map((item) => item[2]);
            } else {
                graphData.forEach((item) => {
                    if (!Array.isArray(item) || item.length !== 2)
                        throw new Error('边列表格式应为 [[u,v], ...]');
                });
                rawEdges = graphData;
                if (edgeWeightSource === 'separate') {
                    extractedWeights = JSON.parse(document.getElementById('edgeWeightsInput').value);
                }
            }
        } else {
            const seen = {};
            graphData.forEach((neighbors, rawU) => {
                if (!Array.isArray(neighbors)) throw new Error('邻接列表格式不正确');
                const u = rawU + idOffset;
                neighbors.forEach((rawV) => {
                    const v = rawV;
                    if (graphType === 'undirected') {
                        const key = Math.min(u, v) + '-' + Math.max(u, v);
                        if (!seen[key]) { rawEdges.push([u, v]); seen[key] = true; }
                    } else {
                        rawEdges.push([u, v]);
                    }
                });
            });
        }

        const adjustedEdges = rawEdges.map((e) => e.map(adjustId));

        // 校验边引用的节点 ID 非负
        for (const e of adjustedEdges) {
            if (e[0] < 0 || e[1] < 0) {
                throw new Error('边引用了无效的节点 ID（可能索引设置不正确）');
            }
        }

        let nodeCount;
        if (nodeWeights) nodeCount = nodeWeights.length;
        else if (format === 'edgeList') {
            const allIds = adjustedEdges.flat();
            nodeCount = allIds.length > 0 ? Math.max(...allIds) + 1 : 0;
        } else nodeCount = graphData.length;

        // 如果有节点权重，校验与邻接列表行数一致
        if (nodeWeights && format === 'adjList' && graphData.length > nodeCount) {
            nodeCount = graphData.length; // 以较大的为准
        }

        const nodeLabels = [];
        for (let i = 0; i < nodeCount; i++) {
            const displayId = i + idOffset;
            const wl = nodeWeights && i < nodeWeights.length ? `(${nodeWeights[i]})` : '';
            nodeLabels.push(`${displayId}${wl}`);
        }

        // 构建邻接表
        const adjList = {};
        for (let i = 0; i < nodeCount; i++) adjList[i] = [];
        adjustedEdges.forEach((e, i) => {
            const w = extractedWeights && i < extractedWeights.length ? extractedWeights[i] : 1;
            adjList[e[0]].push({ neighbor: e[1], weight: w });
            if (graphType === 'undirected') {
                adjList[e[1]].push({ neighbor: e[0], weight: w });
            }
        });

        return {
            nodeCount, nodeLabels, adjList, idOffset,
            directed: graphType === 'directed',
            edgeWeights: extractedWeights,
            adjustedEdges,
        };
    }

    _buildAndRender(graph) {
        if (!graph) {
            this.ctx.renderer.setData([], []);
            return;
        }
        const { nodeCount, nodeLabels, adjustedEdges, directed, edgeWeights } = graph;

        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                id: i,
                label: nodeLabels[i],
                color: { ...Renderer.COLORS.default },
            });
        }

        const edges = adjustedEdges.map((e, i) => {
            const ve = { id: `e${i}`, from: e[0], to: e[1], color: '#94a3b8' };
            if (edgeWeights && i < edgeWeights.length) {
                ve.label = String(edgeWeights[i]);
                ve.font = { align: 'top', color: '#ef4444', strokeWidth: 0 };
            }
            ve.arrows = directed ? 'to' : '';
            return ve;
        });

        this.ctx.renderer.setData(nodes, edges, {
            layout: { hierarchical: false },
            nodes: { shape: 'box', size: 25, font: { color: '#1e293b' }, color: { border: '#3b82f6', background: '#dbeafe' } },
            edges: {
                arrows: { to: { enabled: directed } },
                font: { align: 'top', color: '#ef4444', strokeWidth: 0 },
                color: '#94a3b8',
            },
            physics: { enabled: true, solver: 'barnesHut' },
        });
    }

    async _runAlgorithm() {
        const graph = this.ctx.store.state.graph;
        if (!graph || this.ctx.animation.isRunning) return;

        const algo = document.getElementById('algoSelect').value;
        if (!algo) return;

        const start = parseInt(document.getElementById('algoStart').value, 10);
        if (isNaN(start) || start < 0 || start >= graph.nodeCount) {
            document.getElementById('algo-result').textContent = '无效的起点';
            return;
        }

        const endNode = parseInt(document.getElementById('algoEnd').value, 10);
        const hasEnd = !isNaN(endNode) && endNode >= 0 && endNode < graph.nodeCount;
        const cfg = ALGORITHMS[algo];
        if (cfg.needsEnd && !hasEnd) {
            document.getElementById('algo-result').textContent = '此算法需要终点/汇点';
            return;
        }

        const delay = parseInt(document.getElementById('algoSpeed').value, 10) || 500;
        const { frames, result } = cfg.runner(graph.adjList, start, endNode, graph.nodeCount, graph.directed);
        const resultEl = document.getElementById('algo-result');

        const completed = await this.ctx.animation.play(frames, delay, (frame, i) => {
            this._applyFrame(frame, algo);
            resultEl.textContent = `[${i + 1}/${frames.length}] ${frame.description}`;
        });

        if (completed) {
            resultEl.textContent = result();
        }
    }

    _applyFrame(frame, algo) {
        const graph = this.ctx.store.state.graph;
        if (!graph) return;

        const updates = [];
        for (let i = 0; i < graph.nodeCount; i++) {
            let color = { ...Renderer.COLORS.idle };
            if (frame.visited?.has(i)) color = { ...Renderer.COLORS.visited };
            if (frame.current === i) color = { ...Renderer.COLORS.current };
            if (frame.finalized?.has(i)) color = { ...Renderer.COLORS.finalized };
            if (frame.inQueue?.has(i)) color = { ...Renderer.COLORS.inQueue };

            let label = graph.nodeLabels[i];
            if ((algo === 'dijkstra' || algo === 'bellman') && frame.dist && frame.dist[i] !== undefined && frame.dist[i] < Infinity) {
                label = `${graph.nodeLabels[i]}\n(d=${frame.dist[i]})`;
            }
            updates.push({ id: i, color, label });
        }
        this.ctx.renderer.updateNodes(updates);
    }

    _resetColors() {
        const graph = this.ctx.store.state.graph;
        if (!graph) return;
        const updates = [];
        for (let i = 0; i < graph.nodeCount; i++) {
            updates.push({ id: i, color: { ...Renderer.COLORS.default }, label: graph.nodeLabels[i] });
        }
        this.ctx.renderer.updateNodes(updates);
    }
}
