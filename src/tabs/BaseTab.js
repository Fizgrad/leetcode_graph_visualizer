/**
 * BaseTab — 所有 Tab 的基类
 * 提供 activate/deactivate 模板方法和 render/reset 钩子
 */
export class BaseTab {
    /**
     * @param {object} ctx — 共享上下文 { renderer, store, eventBus, animation }
     * @param {number} index — Tab 索引
     * @param {string} contentId — Tab 内容元素 id
     */
    constructor(ctx, index, contentId) {
        this.ctx = ctx;
        this.index = index;
        this.contentId = contentId;
        this.contentEl = document.getElementById(contentId);
    }

    /** 激活当前 Tab */
    activate() {
        if (!this.contentEl) return;
        this.contentEl.classList.add('active');
        this.onActivate();
    }

    /** 停用当前 Tab */
    deactivate() {
        if (!this.contentEl) return;
        this.contentEl.classList.remove('active');
        this.onDeactivate();
    }

    /** 子类重写：激活时的逻辑 */
    onActivate() {}

    /** 子类重写：停用时的逻辑 */
    onDeactivate() {}

    /** 子类重写：渲染内容 */
    render() {}

    /** 子类重写：重置状态（清空数据、错误信息等），供全局「清空」按钮调用 */
    reset() {}
}
