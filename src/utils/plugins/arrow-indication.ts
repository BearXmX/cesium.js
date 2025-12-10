// @ts-nocheck
import { Viewer, Cartesian3, Cartesian2, SceneTransforms } from 'cesium'

interface options {
  defaultVisible?: boolean
  clickCallback?: () => void
  primaryColor?: string
  labelColor?: string
  rotation?: number
}

class ArrowIndication {
  viewer: Viewer
  position: Cartesian3
  label: string
  container!: HTMLDivElement
  options?: options
  constructor(viewer: Viewer, position: Cartesian3, label: string, options?: options = {}) {
    this.viewer = viewer
    this.position = position
    this.label = label

    this.options = {
      defaultVisible: true,
      primaryColor: '#d19617',
      labelColor: '#000',
      rotation: 0,
      clickCallback: () => {},
      ...options,
    }

    this.createDom(this.options)

    this.addPostRender()
  }

  toggleVisible(visible?: boolean) {
    if (visible === undefined) {
      visible = this.container.style.display !== 'block'
    }

    this.container.style.display = visible ? 'flex' : 'none'

    return visible
  }

  // 添加场景事件
  addPostRender() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this)
  }

  // 场景渲染事件，实时更新标签位置
  postRender() {
    if (!this.container || !this.container.style) return
    if (!this.position) return

    const windowPosition: Cartesian2 | undefined = SceneTransforms.worldToWindowCoordinates(this.viewer.scene, this.position)

    // 如果点不在屏幕内
    if (!windowPosition) {
      /*       this.container.style.display = 'none' */
      return
    }

    const canvasHeight = this.viewer.scene.canvas.height
    this.container.style.bottom = canvasHeight - windowPosition.y + 5 + 'px'
    this.container.style.left = windowPosition.x + 5 + 'px'

    // 距离大于一定高度就隐藏
    /*     this.container.style.display = this.viewer.camera.positionCartographic.height > 4000000 ? 'none' : 'block' */
  }

  // 移除标绘
  public remove() {
    this.viewer.scene.postRender.removeEventListener(this.postRender, this)
    if (this.container.parentElement) {
      this.viewer.cesiumWidget.container.removeChild(this.container)
    }
  }

  // 创建 DOM
  createDom(options: options) {
    this.container = document.createElement('div')

    this.container.style.display = options.defaultVisible ? 'flex' : 'none'

    this.container.classList.add('arrow-indication-container')
    this.container.style.transform = `rotate(${options.rotation}deg)`

    /* 指示器 */
    const arrow = document.createElement('div')
    arrow.classList.add('arrow-indication-arrow-container')
    this.container.appendChild(arrow)

    const arrowHead = document.createElement('div')
    arrowHead.classList.add('arrow-indication-arrow-container-head')
    arrowHead.style.borderRightColor = options.primaryColor
    arrow.appendChild(arrowHead)

    const arrowLine = document.createElement('div')
    arrowLine.classList.add('arrow-indication-arrow-container-line')
    arrowLine.style.backgroundColor = options.primaryColor
    arrow.appendChild(arrowLine)

    /* 文字 */
    const label = document.createElement('div')

    label.classList.add('arrow-indication-label-container')
    /* 
    label.style.transform = `rotate(${options.rotation > 90 && options.rotation < 270 ? 180 : 0}deg)` */

    if (options.rotation > 90 && options.rotation < 180) {
      label.style.writingMode = 'sideways-lr'
      label.style.lineHeight = '16px'
    }

    if (options.rotation >= 180 && options.rotation < 270) {
      label.style.transform = `rotate(180deg)`
    }

    label.style.backgroundColor = options.primaryColor

    label.style.color = options.labelColor

    label.innerHTML = this.label

    if (typeof options.clickCallback === 'function') {
      label.classList.add('arrow-indication-label-container-click')

      label.addEventListener('click', () => {
        options.clickCallback && options.clickCallback()
      })
    }

    this.container.appendChild(label)
    this.viewer.cesiumWidget.container.appendChild(this.container)
  }
}

export default ArrowIndication
