
// 导入图标资源
import dragIcon from '@/assets/svg/draw-drag-icon.svg'
import scrollUpIcon from '@/assets/svg/draw-scroll-up-icon.svg'
import scrollDownIcon from '@/assets/svg/draw-scroll-down-icon.svg'

const dragEvent = (dragHandle: HTMLDivElement) => {
  const moveTarget = document.querySelector('.lil-gui.root') as HTMLDivElement
  if (!dragHandle || !moveTarget) {
    console.warn('拖拽手柄或目标元素不存在')
    return
  }

  // 确保目标元素定位方式
  if (!['fixed', 'absolute'].includes(getComputedStyle(moveTarget).position)) {
    moveTarget.style.position = 'fixed'
  }
  // 初始化right为15px
  if (!moveTarget.style.right) {
    moveTarget.style.right = '15px'
  }

  // 拖拽状态管理（避免重复触发）
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialRight = 0
  let initialTop = 0
  let targetWidth = 0

  // ===== 核心优化1：精准获取单触摸点坐标（过滤多手指）=====
  const getEventPos = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      // 仅取第一个触摸点，过滤多手指干扰
      if (e.touches.length !== 1) return null
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
    return { x: e.clientX, y: e.clientY }
  }

  // ===== 核心优化2：全链路阻止默认行为 + 高优先级处理 =====
  const handleMove = (e: MouseEvent | TouchEvent) => {
    // 非拖拽状态/无有效触摸点，直接返回
    if (!isDragging) return
    const pos = getEventPos(e)
    if (!pos) return

    // 强制阻止所有默认行为（解决滚动冲突）
    // 加try-catch兼容部分浏览器passive属性导致的报错
    try {
      e.preventDefault()
      e.stopPropagation() // 阻止事件冒泡到父元素（避免触发其他触摸逻辑）
    } catch (err) {
      console.warn('阻止默认行为失败:', err)
    }

    const { x: currentX, y: currentY } = pos
    const offsetX = currentX - startX
    const offsetY = currentY - startY

    // X轴right逻辑（不变）
    let newRight = initialRight - offsetX
    newRight = Math.max(0, newRight)
    const maxRight = window.innerWidth - targetWidth
    newRight = Math.min(maxRight, newRight)

    // Y轴top逻辑（0 ≤ top ≤ 视口高度-40px）
    let newTop = initialTop + offsetY
    const maxTop = window.innerHeight - 40
    newTop = Math.max(0, Math.min(maxTop, newTop))

    // 直接赋值，减少重绘延迟（优化跟手性）
    moveTarget.style.right = `${newRight}px`
    moveTarget.style.top = `${newTop}px`
  }

  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    // 重置拖拽状态
    isDragging = false
    // 解绑事件时指定passive: false（匹配绑定参数）
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('mouseup', handleEnd)
    // @ts-ignore
    window.removeEventListener('touchmove', handleMove, { passive: false })
    window.removeEventListener('touchend', handleEnd)
    window.removeEventListener('touchcancel', handleEnd) // 新增：处理触摸中断（如来电、弹窗）
  }

  const handleStart = (e: MouseEvent | TouchEvent) => {
    const pos = getEventPos(e)
    if (!pos) return

    // 标记为拖拽状态
    isDragging = true
    startX = pos.x
    startY = pos.y

    const rect = moveTarget.getBoundingClientRect()
    initialRight = window.innerWidth - rect.right
    initialTop = rect.top
    targetWidth = rect.width

    // ===== 核心优化3：事件绑定指定passive: false（确保preventDefault生效）=====
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    // 关键：touchmove绑定指定passive: false，允许阻止默认行为
    window.addEventListener('touchmove', handleMove, {
      passive: false,
      capture: true, // 捕获阶段触发，优先级更高
    })
    window.addEventListener('touchend', handleEnd)
    window.addEventListener('touchcancel', handleEnd) // 处理触摸意外中断

    // 初始触摸时就阻止默认行为（避免首次触摸触发滚动）
    try {
      e.preventDefault()
      e.stopPropagation()
    } catch (err) { }
  }

  // ===== 核心优化4：拖拽手柄事件绑定优化 =====
  // 触摸事件绑定指定passive: false，确保preventDefault生效
  dragHandle.addEventListener('mousedown', handleStart)
  dragHandle.addEventListener('touchstart', handleStart, {
    passive: false,
    capture: true,
  })

  // 销毁函数（增强版）
  return () => {
    isDragging = false
    // 解绑所有事件
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('mouseup', handleEnd)
    // @ts-ignore
    window.removeEventListener('touchmove', handleMove, { passive: false })
    window.removeEventListener('touchend', handleEnd)
    window.removeEventListener('touchcancel', handleEnd)
    // 解绑手柄事件
    dragHandle.removeEventListener('mousedown', handleStart)
    // @ts-ignore
    dragHandle.removeEventListener('touchstart', handleStart, { passive: false })
  }
}

export const createExtraDom = (destroy: boolean = false) => {
  if (destroy) {
    document.querySelector('.gui-container-extra-dom')?.remove()
    return
  }

  if (!document.querySelector('.gui-container-extra-dom')) {
    const extraDom = document.createElement('div')
    document.querySelector('.lil-gui.root')?.appendChild(extraDom)
    extraDom.className = 'gui-container-extra-dom'

    // 滚动状态管理（优化：用let + 实时计算，避免初始值错误）
    let scrollTop = 0
    // 缓存滚动目标元素（避免重复查询DOM）
    const scrollTarget = document.querySelector('.lil-gui.root > .children') as HTMLElement | null

    // 核心：获取滚动容器的最大可滚动高度（兼容可视区域高度，避免滚动到空白）
    const getMaxScrollTop = () => {
      if (!scrollTarget) return 0
      // 最大滚动高度 = 内容总高度 - 容器可视高度（精准边界）
      return Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight)
    }

    // 初始化最大滚动高度
    let maxScrollTop = getMaxScrollTop()

    // 2. 创建向上滚动按钮
    const scrollUp = document.createElement('div')
    scrollUp.title = '向上滚动'
    scrollUp.className = 'gui-container-extra-dom-scroll-up'
    scrollUp.innerHTML = `<img src=${scrollUpIcon} alt="向上滚动" />`
    scrollUp.addEventListener('click', () => {
      if (!scrollTarget) return // 容错：无滚动目标时不执行

      // 优化：基于当前实际滚动位置计算，而非缓存值（避免偏差）
      const currentScrollTop = scrollTarget.scrollTop
      scrollTop = Math.max(0, currentScrollTop - 100) // 极值限制：最小为0
      scrollTarget.scrollTo({
        top: scrollTop,
        behavior: 'smooth' // 可选：平滑滚动，提升体验
      })
    })
    extraDom.appendChild(scrollUp)

    // 3. 创建向下滚动按钮
    const scrollDown = document.createElement('div')
    scrollDown.title = '向下滚动'
    scrollDown.className = 'gui-container-extra-dom-scroll-down'
    scrollDown.innerHTML = `<img src=${scrollDownIcon} alt="向下滚动" />`
    scrollDown.addEventListener('click', () => {
      if (!scrollTarget) return // 容错：无滚动目标时不执行

      maxScrollTop = getMaxScrollTop() // 实时更新最大滚动高度（防止内容动态变化）
      const currentScrollTop = scrollTarget.scrollTop
      scrollTop = Math.min(maxScrollTop, currentScrollTop + 100) // 极值限制：最大为maxScrollTop
      scrollTarget.scrollTo({
        top: scrollTop,
        behavior: 'smooth' // 可选：平滑滚动
      })
    })
    extraDom.appendChild(scrollDown)

    // ===== 核心优化：监听鼠标/滚轮滚动，同步更新scrollTop =====
    const handleScrollSync = () => {
      if (!scrollTarget) return
      // 实时同步scrollTop为容器当前的滚动位置
      scrollTop = scrollTarget.scrollTop
      // 同步更新最大滚动高度（应对内容动态变化，比如lil-gui新增面板）
      maxScrollTop = getMaxScrollTop()
    }

    // 绑定滚动监听（兼容PC滚轮 + 移动端触摸滚动）
    if (scrollTarget) {
      // passive: true 提升滚动性能
      scrollTarget.addEventListener('scroll', handleScrollSync, { passive: true })

      // 额外：监听窗口大小变化（lil-gui容器尺寸变化时更新最大滚动高度）
      window.addEventListener('resize', () => {
        maxScrollTop = getMaxScrollTop()
      })

      // 初始化：同步一次初始滚动位置
      handleScrollSync()
    }

    const drag = document.createElement('div')
    drag.title = '拖拽控制器'
    drag.className = 'gui-container-extra-dom-drag'
    drag.innerHTML = `<img src=${dragIcon} alt="" />`
    extraDom.appendChild(drag)
    dragEvent(drag)
  }
}