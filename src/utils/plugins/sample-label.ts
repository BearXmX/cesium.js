// @ts-nocheck
import { Viewer, Cartesian3, Cartesian2, SceneTransforms } from 'cesium'

interface options {
  defaultVisible?: boolean
  clickCallback?: () => void
}

class SampleLabel {
  private viewer: Viewer
  private position: Cartesian3
  private label: string
  private container!: HTMLDivElement

  constructor(viewer: Viewer, position: Cartesian3, label: string, options?: options = { defaultVisible: true }) {
    this.viewer = viewer
    this.position = position
    this.label = label
    this.createDom(options)
    this.addPostRender()
  }

  toggleVisible(visible?: boolean) {
    if (visible === undefined) {
      visible = this.container.style.display !== 'block'
    }

    this.container.style.display = visible ? 'block' : 'none'

    return visible
  }

  // 添加场景事件
  private addPostRender() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this)
  }

  // 场景渲染事件，实时更新标签位置
  private postRender() {
    if (!this.container || !this.container.style) return
    if (!this.position) return

    const windowPosition: Cartesian2 | undefined = SceneTransforms.worldToWindowCoordinates(this.viewer.scene, this.position)

    // 如果点不在屏幕内
    if (!windowPosition) {
      this.container.style.display = 'none'
      return
    }

    const canvasHeight = this.viewer.scene.canvas.height
    this.container.style.bottom = canvasHeight - windowPosition.y + 40 + 'px'
    this.container.style.left = windowPosition.x + 20 + 'px'

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
  private createDom(options: options) {
    this.container = document.createElement('div')

    this.container.style.display = options.defaultVisible ? 'block' : 'none'

    this.container.classList.add('point-sample-label-container')

    let label = document.createElement('div')
    label.classList.add('point-sample-label-text')
    label.innerHTML = this.label

    label.addEventListener('click', () => {
      options.clickCallback && options.clickCallback()
    })

    // 添加关闭按钮
    let close = document.createElement('div')
    close.classList.add('point-sample-label-close')
    close.addEventListener('click', () => {
      this.container.style.display = 'none'
    })

    this.container.appendChild(close)

    this.container.appendChild(label)
    this.viewer.cesiumWidget.container.appendChild(this.container)
  }
}

export default SampleLabel
