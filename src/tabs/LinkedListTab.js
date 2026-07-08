/**
 * LinkedListTab — 链表可视化 + 算法演示
 * 支持: 单链表 / 双链表 / 循环单链表 / 循环双链表
 * 算法: 反转 / 找中点 / 检测环 / 删除倒数第 N 个
 */
import { BaseTab } from './BaseTab.js';
import { getRadio, showEl } from '../utils/helpers.js';
import { LIST_ALGOS } from '../algorithms/linkedList.js';
import { Renderer } from '../core/Renderer.js';

export class LinkedListTab extends BaseTab {
    constructor(ctx) {
        super(ctx, 3, 'tabContent3');
        this._lastArr = [];
        this._bindUI();
    }

    _bindUI() {
        document.getElementById('drawListBtn').addEventListener('click', () => this.render());
        this.contentEl.querySelectorAll('input[name="listType"]').forEach((r) => {
            r.addEventListener('change', () => this.render());
        });

        document.getElementById('listAlgoRunBtn').addEventListener('click', () => this._runAlgo());
        document.getElementById('listAlgoStopBtn').addEventListener('click', () => this.ctx.animation.stop());
        document.getElementById('listAlgoResetBtn').addEventListener('click', () => this._resetColors());

        document.getElementById('listAlgoSelect').addEventListener('change', () => {
            const cfg = LIST_ALGOS[document.getElementById('listAlgoSelect').value];
            showEl('listAlgoParam', cfg && cfg.needsParam);
        });

        const slider = document.getElementById('listAlgoSpeed');
        const label = document.getElementById('listAlgoSpeedLabel');
        slider.addEventListener('input', () => { label.textContent = slider.value + 'ms'; });
    }

    onActivate() {
        if (!document.getElementById('linkedlist-input').value.trim()) {
            document.getElementById('linkedlist-input').value = '[1,2,3,4,5]';
        }
        this.render();
    }

    reset() {
        this._lastArr = [];
        this.ctx.renderer.setData([], []);
        document.getElementById('listAlgo-result').textContent = '';
        document.getElementById('error-message-linkedlist').textContent = '';
    }

    render() {
        const errEl = document.getElementById('error-message-linkedlist');
        errEl.textContent = '';
        document.getElementById('listAlgo-result').textContent = '';
        try {
            const text = document.getElementById('linkedlist-input').value.trim();
            if (!text) {
                this._lastArr = [];
                this.ctx.renderer.setData([], []);
                return;
            }
            const arr = JSON.parse(text);
            if (!Array.isArray(arr)) throw new Error('请输入数组格式，如 [1,2,3]');
            this._lastArr = arr;
            this._drawList(arr);
        } catch (e) {
            errEl.textContent = '解析错误: ' + e.message;
        }
    }

    /** 根据数组值绘制链表 */
    _drawList(arr) {
        const listType = getRadio('listType');
        const isDoubly = listType === 'doubly' || listType === 'circular-doubly';
        const isCircular = listType === 'circular-singly' || listType === 'circular-doubly';
        const spacing = 120;

        const nodes = arr.map((val, i) => ({
            id: i,
            label: String(val),
            x: i * spacing,
            y: 0,
            fixed: true,
            shape: 'box',
            color: { ...Renderer.COLORS.default },
            font: { size: 16, color: '#1e293b' },
        }));

        const edges = [];
        for (let i = 0; i < arr.length - 1; i++) {
            edges.push({ id: `e${edges.length}`, from: i, to: i + 1, arrows: 'to', color: '#3b82f6', width: 2 });
            if (isDoubly) {
                edges.push({ id: `e${edges.length}`, from: i + 1, to: i, arrows: 'to', color: '#93c5fd', width: 2, dashes: true });
            }
        }
        if (isCircular && arr.length > 0) {
            edges.push({ id: `e${edges.length}`, from: arr.length - 1, to: 0, arrows: 'to', color: '#3b82f6', width: 2 });
            if (isDoubly) {
                edges.push({ id: `e${edges.length}`, from: 0, to: arr.length - 1, arrows: 'to', color: '#93c5fd', width: 2, dashes: true });
            }
        }

        this.ctx.renderer.setData(nodes, edges, {
            layout: { hierarchical: false },
            nodes: { shape: 'box', color: { border: '#3b82f6', background: '#dbeafe' }, font: { size: 16, color: '#1e293b' } },
            edges: { arrows: { to: { enabled: true } }, smooth: { type: 'curvedCW', roundness: 0.2 } },
            physics: { enabled: false },
        });
    }

    /** 获取链表类型选项 */
    _getListOpts() {
        const listType = getRadio('listType');
        return {
            isDoubly: listType === 'doubly' || listType === 'circular-doubly',
            isCircular: listType === 'circular-singly' || listType === 'circular-doubly',
        };
    }

    /** 运行选中的链表算法 */
    async _runAlgo() {
        if (this._lastArr.length === 0 || this.ctx.animation.isRunning) return;

        const type = document.getElementById('listAlgoSelect').value;
        const cfg = LIST_ALGOS[type];
        if (!cfg) return;

        const delay = parseInt(document.getElementById('listAlgoSpeed').value, 10) || 700;
        const resultEl = document.getElementById('listAlgo-result');

        let param = null;
        if (cfg.needsParam) {
            param = parseInt(document.getElementById('listAlgoParam').value, 10);
            if (isNaN(param) || param <= 0 || param > this._lastArr.length) {
                resultEl.textContent = `无效参数（请输入 1~${this._lastArr.length}）`;
                return;
            }
        }

        // 先重置颜色
        this._resetColors();

        const opts = this._getListOpts();
        const { frames, deletedIndex } = cfg.generate(this._lastArr, param, opts.isCircular, opts);

        // 帧应用
        const applyFrame = (frame) => {
            if (frame.highlights) {
                const updates = Object.entries(frame.highlights).map(([id, color]) => {
                    const update = { id: Number(id), color };
                    if (frame.labels && frame.labels[id] !== undefined) {
                        update.label = frame.labels[id];
                    }
                    return update;
                });
                this.ctx.renderer.updateNodes(updates);
            }
            if (frame.edges) {
                const edges = frame.edges.map((e, i) => ({
                    id: `ae${i}`,
                    from: e.from,
                    to: e.to,
                    arrows: 'to',
                    color: e.color || '#94a3b8',
                    width: e.width || 2,
                    dashes: e.dashes || false,
                }));
                this.ctx.renderer.setData(null, edges);
            }
        };

        const completed = await this.ctx.animation.play(frames, delay, (frame, i) => {
            applyFrame(frame);
            resultEl.textContent = `[${i + 1}/${frames.length}] ${frame.description}`;
        });

        if (!completed) return;

        // 算法完成后更新最终状态
        if (type === 'reverse') {
            this._lastArr = [...this._lastArr].reverse();
            this._drawList(this._lastArr);
            document.getElementById('linkedlist-input').value = JSON.stringify(this._lastArr);
            resultEl.textContent += ' — 已应用反转';
        } else if (type === 'removeNth' && deletedIndex >= 0) {
            this._lastArr.splice(deletedIndex, 1);
            this._drawList(this._lastArr);
            document.getElementById('linkedlist-input').value = JSON.stringify(this._lastArr);
            resultEl.textContent += ' — 已删除';
        } else {
            this._resetColors();
            if (type === 'findMiddle') {
                const midIdx = Math.floor(this._lastArr.length / 2);
                resultEl.textContent = `中点是: ${this._lastArr[midIdx]} (索引 ${midIdx})`;
            } else if (type === 'detectCycle') {
                resultEl.textContent = opts.isCircular ? '结论: 链表有环' : '结论: 链表无环';
            }
        }
    }

    /** 重置所有节点为默认色，恢复原始标签和边。不清 result 文本 */
    _resetColors() {
        if (this._lastArr.length === 0) return;
        const updates = this._lastArr.map((val, i) => ({
            id: i,
            color: { ...Renderer.COLORS.default },
            label: String(val),
        }));
        this.ctx.renderer.updateNodes(updates);
        // 恢复原始边（不重解析输入框，只用当前 _lastArr）
        this._drawList(this._lastArr);
    }
}
