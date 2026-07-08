/**
 * StackQueueTab — 栈 & 队列可视化
 * 栈模式: 垂直布局, 弹出历史在右侧
 * 队列模式: 水平布局, 弹出历史在下方
 */
import { BaseTab } from './BaseTab.js';
import { getRadio } from '../utils/helpers.js';

export class StackQueueTab extends BaseTab {
    constructor(ctx) {
        super(ctx, 4, 'tabContent4');
        this._state = { data: [], log: [], popped: [] };

        document.getElementById('sqPushBtn').addEventListener('click', () => this._push());
        document.getElementById('sqPopBtn').addEventListener('click', () => this._pop());
        document.getElementById('sqClearBtn').addEventListener('click', () => this._clear());

        const input = document.getElementById('sqValueInput');
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._push(); });

        this.contentEl.querySelectorAll('input[name="sqMode"]').forEach((r) => {
            r.addEventListener('change', () => this.render());
        });
    }

    onActivate() {
        this.ctx.renderer.setVisible(false);
        document.getElementById('struct-view').style.display = '';
        this.render();
    }

    onDeactivate() {
        this.ctx.renderer.setVisible(true);
        document.getElementById('struct-view').style.display = 'none';
    }

    reset() {
        this._state = { data: [], log: [], popped: [] };
        this.render();
    }

    _push() {
        const input = document.getElementById('sqValueInput');
        const val = input.value.trim();
        if (!val) return;
        const mode = getRadio('sqMode');
        this._state.data.push(val);
        this._addLog((mode === 'stack' ? 'Push(' : 'Enqueue(') + val + ')');
        input.value = '';
        input.focus();
        this.render();
    }

    _pop() {
        if (this._state.data.length === 0) return;
        const mode = getRadio('sqMode');
        const val = mode === 'stack'
            ? this._state.data.pop()
            : this._state.data.shift();
        this._state.popped.push(val);
        this._addLog((mode === 'stack' ? 'Pop() = ' : 'Dequeue() = ') + val);
        this.render();
    }

    _clear() {
        this._state = { data: [], log: [], popped: [] };
        this.render();
    }

    _addLog(entry) {
        this._state.log.push(entry);
        if (this._state.log.length > 30) this._state.log.shift();
    }

    render() {
        const s = this._state;
        const mode = getRadio('sqMode');
        const isStack = mode === 'stack';

        const structView = document.getElementById('struct-view');
        const display = document.getElementById('sq-display');
        const popped = document.getElementById('sq-popped');
        const log = document.getElementById('sq-log');
        const info = document.getElementById('sq-info');

        if (!structView || !display || !popped || !log || !info) return;

        // --- 设置布局模式 class ---
        structView.classList.remove('sq-mode-stack', 'sq-mode-queue');
        structView.classList.add(isStack ? 'sq-mode-stack' : 'sq-mode-queue');

        // --- 方向标记 ---
        const markerStart = document.querySelector('.sq-marker-start');
        const markerEnd = document.querySelector('.sq-marker-end');
        if (markerStart) markerStart.textContent = isStack ? 'TOP ↓' : 'FRONT →';
        if (markerEnd) markerEnd.textContent = isStack ? '↑ BOTTOM' : '← REAR';

        // --- 当前数据项 ---
        display.className = 'sq-display ' + (isStack ? 'sq-stack' : 'sq-queue');
        display.innerHTML = s.data.length === 0
            ? '<span style="color:var(--c-text-muted);font-size:14px;">空</span>'
            : s.data.map(v => `<div class="sq-item">${v}</div>`).join('');

        // --- 弹出历史 ---
        popped.innerHTML = s.popped.length === 0
            ? '<span class="sq-popped-empty">暂无弹出记录</span>'
            : s.popped.map(v => `<div class="sq-popped-item">${v}</div>`).join('');

        // --- 操作日志 ---
        log.innerHTML = s.log.map(e => `<div>${e}</div>`).join('');
        log.scrollTop = log.scrollHeight;

        // --- 信息栏 ---
        const topVal = s.data.length > 0 ? s.data[s.data.length - 1] : 'N/A';
        const frontVal = s.data.length > 0 ? s.data[0] : 'N/A';
        info.innerHTML = isStack
            ? `<b>栈</b> | 大小: ${s.data.length} | 栈顶: ${topVal} | 已弹出: ${s.popped.length}`
            : `<b>队列</b> | 大小: ${s.data.length} | 队首: ${frontVal} | 队尾: ${topVal} | 已弹出: ${s.popped.length}`;

        document.getElementById('sqPushBtn').textContent = isStack ? 'Push' : 'Enqueue';
        document.getElementById('sqPopBtn').textContent = isStack ? 'Pop' : 'Dequeue';
    }
}
