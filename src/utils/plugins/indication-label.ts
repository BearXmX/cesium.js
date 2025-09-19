// @ts-nocheck
import { Viewer, Cartesian3, Cartesian2, SceneTransforms } from 'cesium'

class IndicationLabel {
  private viewer: Viewer
  private position: Cartesian3
  private label: string
  private container!: HTMLDivElement

  constructor(viewer: Viewer, position: Cartesian3, label: string) {
    this.viewer = viewer
    this.position = position
    this.label = label
    this.createDom()
    this.addPostRender()
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
    this.container.style.bottom = canvasHeight - windowPosition.y + 10 + 'px'

    const elWidth = this.container.offsetWidth
    this.container.style.left = windowPosition.x - elWidth / 2 + 'px'

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
  private createDom() {
    this.container = document.createElement('div')
    this.container.classList.add('is-shulie')

    const labelEl = document.createElement('div')
    labelEl.innerHTML = this.label
    labelEl.classList.add('is-shulie-item')
    this.container.appendChild(labelEl)

    const line = document.createElement('div')
    line.classList.add('pre-topCard-list-item-line')
    this.container.appendChild(line)

    const circle = document.createElement('div')
    circle.classList.add('pre-topCard-list-item-circle')
    this.container.appendChild(circle)

    this.viewer.cesiumWidget.container.appendChild(this.container)
  }
}

export default IndicationLabel
