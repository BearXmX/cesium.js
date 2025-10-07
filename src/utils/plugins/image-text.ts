import { Viewer, Cartesian3, Cartesian2, SceneTransforms } from 'cesium'
interface options {
  defaultVisible?: boolean
}

class ImageText {
  viewer: Viewer
  position: Cartesian3
  image: string
  content: string
  container!: HTMLDivElement | null
  options?: options

  constructor(viewer: Viewer, position: Cartesian3, image: string, content: string, options: options = {}) {
    this.viewer = viewer
    this.position = position
    this.content = content
    this.image = image
    this.container = null

    this.options = {
      defaultVisible: true,
      ...options,
    }

    this.createDom(this.options)

    this.addPostRender()
  }
  toggleVisible(visible?: boolean) {
    if (visible === undefined) {
      visible = this.container!.style.display !== 'block'
    }

    this.container!.style.display = visible ? 'block' : 'none'

    return visible
  }
  // 创建 DOM
  createDom(options: options) {
    this.container = document.createElement('div')

    this.container.style.display = options.defaultVisible ? 'block' : 'none'

    this.container.classList.add('point-image-text-container')

    /* 内容 */
    const content = document.createElement('div')

    content.classList.add('point-image-text-container-content')

    this.container.appendChild(content)

    /* 图片 */
    const image = document.createElement('img')
    image.src = this.image
    image.classList.add('point-image-text-container-image')
    content.appendChild(image)

    /* 文字 */
    const text = document.createElement('div')
    text.classList.add('point-image-text-container-text')
    text.innerHTML = this.content

    content.appendChild(text)

    /* 指示线条 */
    const indication = document.createElement('div')

    indication.classList.add('point-image-text-container-indication')

    this.container.appendChild(indication)

    const radius = document.createElement('div')
    radius.classList.add('point-image-text-container-indication-radius')
    indication.appendChild(radius)

    /* 添加关闭按钮 */
    const close = document.createElement('div')
    close.classList.add('point-image-text-close')
    close.addEventListener('click', () => {
      this.container!.style.display = 'none'
    })

    this.container.appendChild(close)

    this.viewer.cesiumWidget.container.appendChild(this.container)
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
    this.container.style.bottom = canvasHeight - windowPosition.y + 40 + 'px'
    this.container.style.left = windowPosition.x + 'px'

    // 距离大于一定高度就隐藏
    /*     this.container.style.display = this.viewer.camera.positionCartographic.height > 4000000 ? 'none' : 'block' */
  }

  // 移除标绘
  public remove() {
    this.viewer.scene.postRender.removeEventListener(this.postRender, this)
    if (this.container!.parentElement) {
      this.viewer.cesiumWidget.container.removeChild(this.container!)
    }
  }
}

export default ImageText
