/**
 * 通用工具函数
 */

/** 获取当前选中的 radio 值 */
export function getRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
}

/** 显示/隐藏元素（恢复到 CSS 定义的 display 值） */
export function showEl(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
}

/** sleep Promise */
export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

/** 安全解析 JSON，失败返回 null */
export function tryParseJSON(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

/** 将 LeetCode 数组文本解析为 (value|null) 数组
 *  LeetCode 格式中 null 本身就是合法 JSON 值，直接 parse 即可 */
export function parseLeetCodeArray(line) {
    const arr = JSON.parse(line);
    if (!Array.isArray(arr)) throw new Error('输入必须是数组');
    return arr;
}

/** 获取 textarea 中第一行非空、非注释的行 */
export function getFirstLine(text) {
    const lines = text.split('\n');
    for (const l of lines) {
        const t = l.trim();
        if (t && !t.startsWith('//')) return t;
    }
    return null;
}

/** 事件委托：为容器内匹配 selector 的元素绑定事件 */
export function delegate(container, eventType, selector, handler) {
    container.addEventListener(eventType, (e) => {
        const target = e.target.closest(selector);
        if (target && container.contains(target)) {
            handler(e, target);
        }
    });
}
