/**
 * TabManager — 管理 Tab 的切换逻辑
 * 依赖各 Tab 类和 EventBus
 */
import { GeneralGraphTab } from './GeneralGraphTab.js';
import { BinaryTreeTab } from './BinaryTreeTab.js';
import { MatrixTab } from './MatrixTab.js';
import { LinkedListTab } from './LinkedListTab.js';
import { StackQueueTab } from './StackQueueTab.js';

export class TabManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.tabs = [
            new GeneralGraphTab(ctx),
            new BinaryTreeTab(ctx),
            new MatrixTab(ctx),
            new LinkedListTab(ctx),
            new StackQueueTab(ctx),
        ];
        this.activeIndex = -1;
        this._bindButtons();
    }

    _bindButtons() {
        this.tabs.forEach((tab, i) => {
            const btn = document.getElementById(`tabBtn${i}`);
            btn.addEventListener('click', () => this.switchTo(i));
        });
    }

    switchTo(index) {
        if (index === this.activeIndex) return;
        this.ctx.animation.stop();

        // 停用当前
        if (this.activeIndex >= 0) {
            this.tabs[this.activeIndex].deactivate();
            document.getElementById(`tabBtn${this.activeIndex}`).classList.remove('active');
        }

        // 激活目标
        this.activeIndex = index;
        this.tabs[index].activate();
        document.getElementById(`tabBtn${index}`).classList.add('active');
        this.ctx.store.setTab(index);
        this.ctx.eventBus.emit('tab:change', index);
    }

    init() {
        this.switchTo(0);
    }
}
