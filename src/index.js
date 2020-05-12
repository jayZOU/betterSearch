import { isRealNode, isSetClassName, checkClassName, searchSubStr, formatTextNode, regExpescape } from './utils'

//选中的class name
const currentSelectClass = '__better-search-current-select'
//标记id
let markId = 0

class BetterSearch {
    constructor(opt) {
        //搜索区域
        this.domContainer = opt.domContainer || null
        this.dom = null
        //搜索关键词
        this.keyword = ''
        //黑名单
        this.blackClassName = []
        //命中关键词所在的DOM和整个文本，便于后续跨标签匹配
        this.searchDom = {
            text: '',
            data: {}
        }
        //命中总数
        this.count = 0
        //命中dom
        this.domList = []
        //当前命中的索引
        this.searchIndex = -1
        //横向滚动条
        this.overflowXDom = []
        //纵向滚动条
        this.overflowYDom = []

        //插入默认的style
        const css = `.${currentSelectClass}{background: #FF9632 !important;}`
        let style = document.createElement('style')
        style.appendChild(document.createTextNode(css))
        document.head.appendChild(style)
    }
    search(keyword) {
        if(!this.domContainer || !keyword) return
        this.clear()
        this.keyword = keyword.trim()
        const dom = document.querySelector(this.domContainer)
        this.dom = dom

        //深度优先处理待搜索的dom
        this.formatDom(dom, this.keyword)

        //处理跨标签搜索
        const poi = searchSubStr(this.searchDom.text, this.keyword)

        for (let i = 0; i < poi.length; i++) {
            const start = poi[i]
            const end = poi[i] + this.keyword.length - 1
            const key = Object.keys(this.searchDom.data)
            const target = []
            for (let j = 0; j < key.length; j++) {
                const itemPoi = key[j].split('-')
                //超过边界直接过滤
                if (itemPoi[1] < start || itemPoi[0] > end) continue
                //单一标签内
                if (itemPoi[0] <= start && itemPoi[1] >= end) {
                    target.push(this.searchDom.data[key[j]])
                    break
                }
                target.push(this.searchDom.data[key[j]])
            }
            if (target.length < 2) {
                //只命中一个节点，没有跨标签
                const el = target[0]
                this.markDom(el, this.keyword, true)
            } else {
                //合并多个标签的文本，计算起始文本位置和终止文本位置
                let text = ''
                let keywordLength = this.keyword.length
                target.forEach(item => {
                    text += item.parentNode.innerText
                })
                let start = text.indexOf(this.keyword)
                //开始染色,只需要处理头和尾标签的特殊染色位置，其余的全量染色
                for (let k = 0; k < target.length; k++) {
                    let text = ''
                    if (k === 0) {
                        //头部
                        text = target[k].parentNode.innerText.slice(start)
                        keywordLength = keywordLength - text.length
                        this.markDom(target[k], text, false)
                    } else if (k === target.length - 1) {
                        //尾部
                        text = target[k].parentNode.innerText.slice(0, keywordLength)
                        this.markDom(target[k], text, false)
                    } else {
                        keywordLength = keywordLength - target[k].parentNode.innerText.length
                        this.markDom(target[k], target[k].parentNode.innerText, false)
                    }
                }
            }
        }

        this.domList = this.getDomList()
        this.count = this.domList.length
        this.down()
    }
    //重置搜索数据
    clear() {
        this.count = 0
        this.searchIndex = -1
        const dom = document.querySelector(this.domContainer)
        this.rmMdrkDom(dom)
        this.domList = []
        this.searchDom = {
            text: '',
            data: {}
        }
        markId = 0
    }
    //下一个
    down() {
        if(this.searchIndex > this.count) return
        ++this.searchIndex
        if (this.searchIndex >= this.count) {
            this.searchIndex = 0
            this.removeSelectClass(this.domList[this.domList.length - 1])
        }
        this.resetAllSelectClass()
        this.goNode(this.searchIndex)
    }
    //上一个
    up() {
        if(this.searchIndex < 0) return
        --this.searchIndex
        if (this.searchIndex < 0) {
            this.searchIndex = this.domList.length - 1
            this.removeSelectClass(this.domList[0])
        }
        this.resetAllSelectClass()
        this.goNode(this.searchIndex)
    }
    //清除所有高亮节点
    resetAllSelectClass() {
        const that = this
        this.domList.forEach(list => {
            that.removeSelectClass(list)
        })
    }
    //删除高亮的class
    removeSelectClass(dom) {
        dom.forEach(item => {
            item.classList.remove(currentSelectClass)
        })
    }
    //跳转到目标dom
    goNode(index) {
        const that = this
        this.domList[index].forEach(list => {
            const parentNodeList = that.getParentNodeList(list)
            const item = list.getBoundingClientRect()
            let overflowX = null
            let overflowY = null
            for(let pn of parentNodeList) {
                const indexY = that.overflowYDom.indexOf(pn)
                const indexX = that.overflowXDom.indexOf(pn)
                if(indexY > -1) {
                    //存在纵向滚动
                    overflowY = that.overflowYDom[indexY]
                    break
                }
                if(indexX > -1) {
                    //存在横向滚动
                    overflowX = that.overflowXDom[indexX]
                    break
                }
            }
            if(overflowY) {
                const wrapY = overflowY.getBoundingClientRect()
                const itemTop = item.top + overflowY.scrollTop
                //纵向距离
                let offsetTop = itemTop - wrapY.top - 60
                //纵向定位
                overflowY.scrollTo(0, offsetTop ? offsetTop : 0)
            }

            // const wrapX = overflowX.getBoundingClientRect()
            // const itemTop = item.top + that.srcoll.scrollTop
            // const wrapTop = wrap.top
            // //纵向距离
            // let offsetTop = itemTop - wrapTop - 60
            // //横向定位
            // const overflowXIndex = list.getAttribute('overflow-x-index') * 1
            // const offsetLeft = item.x - wrap.x
            // if (overflowXIndex > -1) {
            //     if (offsetLeft > wrap.width) {
            //         that.overflowXDom[overflowXIndex].scrollTo(offsetLeft - wrap.width + 60, 0)
            //     } else {
            //         that.overflowXDom[overflowXIndex].scrollTo(0, 0)
            //     }
            // }
            // //纵向定位
            // that.srcoll.scrollTo(0, offsetTop ? offsetTop : 0)
            //染色
            that.addSelectClass([list])
        })
    }
    //获取所有父级节点
    getParentNodeList(el) {
        const parentNodeList = []
        let currentDom = el
        parentNodeList.push(el)
        while (!currentDom.isEqualNode(this.dom)) {

            parentNodeList.push(currentDom.parentNode)
            currentDom = currentDom.parentNode
        }
        return parentNodeList
    }
    //高亮染色
    addSelectClass(dom) {
        dom.forEach(item => {
            item.classList.add(currentSelectClass)
        })
    }
    //取消高亮
    rmMdrkDom(el) {
        const highlightSpans = el.querySelectorAll('mark.search-highlight')
        highlightSpans.forEach(el => {
            // 找到所有.highlight并遍历
            if (!el.parentNode) return
            const template = el.parentNode.querySelector('template[search-highlight]')
            if (!template) return
            // 找到父节点中的template，将自己内容替换为template内容
            el.parentNode.innerHTML = el.parentNode.querySelector('template[search-highlight]').innerHTML
        })
    }
    //获取dom分组
    getDomList() {
        const markList = document.querySelectorAll('mark.search-highlight')
        let list = {}
        markList.forEach(item => {
            const id = item.getAttribute('mark-id')
            if (!list[id]) list[id] = []
            list[id].push(item)
        })
        return Object.values(list)
    }
    //DOM染色
    markDom(el, value, isSame) {
        if (!el.parentNode || !value) return
        //如果父级下有多个子节点的话，说明该文本不是单独标签包含，需要处理下
        if (el.parentNode.childNodes.length > 1) {
            el = formatTextNode(el)
        }
        const reg = new RegExp(regExpescape(value), 'ig')
        const highlightList = el.data.match(reg) // 得出文本节点匹配到的字符串数组
        if (!highlightList) return
        const splitTextList = el.data.split(reg) // 分割多次匹配
        // 遍历分割的匹配数组，将匹配出的字符串加上.highlight并依次插入DOM, 同时给为匹配的template用于后续恢复
        el.parentNode.innerHTML = splitTextList.reduce(
            (html, splitText, i) => {
                const text =
                    html +
                    splitText +
                    (i < splitTextList.length - 1
                        ? `<mark class="search-highlight" mark-id="${markId}">${highlightList[i]}</mark>`
                        : `<template search-highlight>${el.data}</template>`)
                if (isSame) markId++
                return text
            },
            ''
        )
    }
    formatDom(el, value) {
        const childList = el.childNodes
        if (!childList.length || !value.length) return // 无子节点或无查询值，则不进行下列操作
        childList.forEach(el => {
            // 遍历其内子节点
            if (el.nodeType === 1 || el.nodeType === 3) {
                //页面内存在滚动节点的话，需要记录
                if (isRealNode(el)) {
                    if(el.scrollHeight > el.clientHeight) {
                        //纵向滚动条
                        this.overflowYDom.push(el)
                    }
                    if(el.scrollWidth > el.clientWidth) {
                        //横向滚动条
                        this.overflowXDom.push(el)
                    }
                }
                if (
                    isRealNode(el) && // 如果是元素节点
                    checkClassName(el, this.blackClassName) &&
                    !/(script|style|template)/i.test(el.tagName)
                ) {
                    // 并且元素标签不是script或style或template等特殊元素
                    this.formatDom(el, value) // 那么就继续遍历(递归)该元素节点
                } else if (el.nodeType === 3) {
                    // 如果是文本节点
                    for (let j = 0; j < value.length; j++) {
                        if (el.data.indexOf(value[j]) > -1) {
                            const start = this.searchDom.text.length
                            this.searchDom.text = this.searchDom.text + el.parentNode.innerText
                            this.searchDom.data[`${start}-${this.searchDom.text.length - 1}`] = el
                            break
                        }
                    }
                }
            }
        })
    }
}

export default BetterSearch