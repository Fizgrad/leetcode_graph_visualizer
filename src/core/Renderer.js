/**
 * Renderer — vis-network 的封装
 * 负责图/树/矩阵/链表的渲染与节点/边颜色更新
 */
import { COLORS as THEME_COLORS } from '../constants/colors.js';

export class Renderer {
    constructor(container) {
        this.container = container;
        this.nodes = new vis.DataSet();
        this.edges = new vis.DataSet();
        this.network = new vis.Network(
            container,
            { nodes: this.nodes, edges: this.edges },
            Renderer.defaultOptions()
        );

        // 选中节点时切换字体为深色，避免浅字+浅底看不清
        this.network.on('selectNode', (params) => {
            if (params.nodes.length > 0) {
                this.nodes.update(params.nodes.map((id) => ({
                    id, font: { color: '#0f172a' },
                })));
            }
        });
        this.network.on('deselectNode', (params) => {
            const deselected = params.previousSelection?.nodes || [];
            if (deselected.length > 0) {
                this.nodes.update(deselected.map((id) => ({
                    id, font: { color: '#e2e8f0' },
                })));
            }
        });
    }

    static defaultOptions() {
        return {
            layout: { hierarchical: false },
            nodes: {
                shape: 'box',
                size: 25,
                font: { color: '#e2e8f0' },
                color: { border: '#38bdf8', background: '#1e3a5f' },
            },
            edges: { color: '#475569' },
            physics: { enabled: true, solver: 'barnesHut' },
        };
    }

    /** 设置完整数据（清空后重新填充）。nodes 为 null 时仅替换边 */
    setData(nodes = [], edges = [], options = null) {
        if (nodes !== null) {
            this.nodes.clear();
            if (nodes.length) this.nodes.add(nodes);
        }
        this.edges.clear();
        if (edges.length) this.edges.add(edges);
        if (options) this.network.setOptions(options);
    }

    /** 批量更新节点属性（颜色、label 等） */
    updateNodes(updates) {
        this.nodes.update(updates);
    }

    /** 批量更新边属性 */
    updateEdges(updates) {
        this.edges.update(updates);
    }

    /** 获取节点/边数量 */
    getStats() {
        return { nodes: this.nodes.length, edges: this.edges.length };
    }

    /** 显示/隐藏 network（用于切换到 stack/queue 视图时） */
    setVisible(visible) {
        this.container.style.display = visible ? '' : 'none';
    }

    /** 导出当前画布为 PNG（透明背景） */
    exportPNG() {
        const canvases = this.container.querySelectorAll('canvas');
        if (canvases.length === 0) return null;
        const w = canvases[0].width;
        const h = canvases[0].height;
        const out = document.createElement('canvas');
        out.width = w;
        out.height = h;
        const ctx = out.getContext('2d');
        canvases.forEach((c) => ctx.drawImage(c, 0, 0));
        return out.toDataURL('image/png');
    }

    /** 统一配色常量，供算法动画复用 */
    static COLORS = THEME_COLORS;
}
