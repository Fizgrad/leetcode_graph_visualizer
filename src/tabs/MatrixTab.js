/**
 * MatrixTab — 矩阵可视化 + DP 动态规划动画
 */
import { BaseTab } from './BaseTab.js';
import { generateDPFrames } from '../algorithms/dp.js';

export class MatrixTab extends BaseTab {
    constructor(ctx) {
        super(ctx, 2, 'tabContent2');
        document.getElementById('drawMatrixBtn').addEventListener('click', () => this.render());
        document.getElementById('dpRunBtn').addEventListener('click', () => this._runDP());
        document.getElementById('dpStopBtn').addEventListener('click', () => this.ctx.animation.stop());
        document.getElementById('dpResetBtn').addEventListener('click', () => this.render());
        // 速度标签实时更新
        const dpSpeedSlider = document.getElementById('dpSpeed');
        const dpSpeedLabel = document.getElementById('dpSpeedLabel');
        dpSpeedSlider.addEventListener('input', () => { dpSpeedLabel.textContent = dpSpeedSlider.value + 'ms'; });
    }

    onActivate() {
        if (!document.getElementById('matrix-input').value.trim()) {
            document.getElementById('matrix-input').value = '[[11,17,13,0,18],[13,12,10,12,19],[4,8,10,14,16],[2,13,12,7,16],[4,9,7,4,3]]';
        }
        this.render();
    }

    reset() {
        document.getElementById('matrix-input').value = '';
        document.getElementById('dp-result').textContent = '';
        document.getElementById('error-message-matrix').textContent = '';
        this.ctx.store.setMatrix(null);
        this.ctx.renderer.setData([], []);
    }

    render() {
        const errEl = document.getElementById('error-message-matrix');
        const dpResultEl = document.getElementById('dp-result');
        errEl.textContent = '';
        dpResultEl.textContent = '';
        try {
            const text = document.getElementById('matrix-input').value.trim();
            if (!text) {
                this.ctx.renderer.setData([], []);
                return;
            }
            const matrix = JSON.parse(text);
            if (!Array.isArray(matrix) || (matrix.length > 0 && !Array.isArray(matrix[0]))) {
                throw new Error('输入必须是二维数组');
            }
            this.ctx.store.setMatrix(matrix);
            this._drawMatrix(matrix);
        } catch (e) {
            errEl.textContent = '解析错误: ' + e.message;
        }
    }

    _drawMatrix(matrix) {
        const nodes = [];
        const spacing = 110;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                nodes.push({
                    id: `${i}-${j}`,
                    label: String(matrix[i][j]),
                    x: j * spacing,
                    y: i * spacing,
                    fixed: true,
                    shape: 'box',
                    margin: { top: 8, right: 12, bottom: 8, left: 12 },
                    font: { size: 14, face: 'monospace', color: '#1e293b' },
                    color: { border: '#38bdf8', background: '#1e3a5f' },
                    widthConstraint: { minimum: 60 },
                });
            }
        }
        this.ctx.renderer.setData(nodes, [], {
            layout: { hierarchical: false },
            nodes: {
                shape: 'box',
                margin: { top: 8, right: 12, bottom: 8, left: 12 },
                font: { size: 14, face: 'monospace', color: '#e2e8f0' },
                color: { border: '#38bdf8', background: '#1e3a5f' },
                widthConstraint: { minimum: 60 },
            },
            physics: { enabled: false },
        });
    }

    async _runDP() {
        const matrix = this.ctx.store.state.matrix;
        if (!matrix || this.ctx.animation.isRunning) return;

        const type = document.getElementById('dpType').value;
        if (!type) return;

        const delay = parseInt(document.getElementById('dpSpeed').value, 10) || 80;
        const { frames, result } = generateDPFrames(matrix, type);
        const resultEl = document.getElementById('dp-result');

        this.render(); // 重置矩阵
        await new Promise((r) => setTimeout(r, 200));

        // 等待期间用户可能点了停止
        if (this.ctx.store.state.animationAbort) return;

        const completed = await this.ctx.animation.play(frames, delay, (frame, i) => {
            const cellId = `${frame.row}-${frame.col}`;
            this.ctx.renderer.updateNodes([{
                id: cellId,
                label: `${matrix[frame.row][frame.col]}\n(dp:${frame.value})`,
                color: { border: '#fbbf24', background: '#78350f' },
            }]);
            resultEl.textContent = `[${i + 1}/${frames.length}] ${frame.description}`;
        });

        // 最终把所有填过的格子恢复为默认色
        if (completed) {
            const updates = frames.map((f) => ({
                id: `${f.row}-${f.col}`,
                color: { border: '#38bdf8', background: '#1e3a5f' },
            }));
            this.ctx.renderer.updateNodes(updates);
            resultEl.textContent = `DP 完成。右下角结果: ${result}`;
        }
    }
}
