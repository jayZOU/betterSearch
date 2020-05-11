//是否属于真实可渲染的节点
const isRealNode = function (node) {
    return node.nodeType === 1 && getComputedStyle(node).display != 'none' && node.tagName !== 'svg'
}
//是否存在某个class
const isSetClassName = function(node, name) {
    return node.className.indexOf(name) > -1
}
//校验class是否存在黑名单内
const checkClassName = function(el, blackClassName) {
    return (
        el.classList &&
        !blackClassName.filter(item => {
            try {
                let has = el.className.indexOf(item) > -1
                return has
            } catch (error) {
                return false
            }
            // return el.className.indexOf(item) > -1
        }).length
    )
}
//查询keyword子串出现在dom所属位置
const searchSubStr = function(str, subStr) {
    let arr = []
    let index = str.indexOf(subStr)
    while (index > -1) {
        arr.push(index)
        index = str.indexOf(subStr, index + 1)
    }
    return arr
}
//处理异常的文本节点
const formatTextNode = function(el) {
    const parentNode = el.parentNode
    const afterNode = parentNode.childNodes[Array.apply(null, parentNode.childNodes).indexOf(el) - 1]
    const targetNode = parentNode.removeChild(el)
    let span = document.createElement('span')
    span.appendChild(targetNode)
    if (afterNode) {
        parentNode.appendChild(span)
        afterNode.after(span)
    } else {
        parentNode.prepend(span)
    }
    return targetNode
}
const regExpescape = function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}
export {
    isRealNode,
    isSetClassName,
    checkClassName,
    searchSubStr,
    formatTextNode,
    regExpescape
}