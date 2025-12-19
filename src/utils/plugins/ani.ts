import * as Cesium from 'cesium'

// 类型定义
type EasingFunction = (t: number) => number

type AnimationState = {
  pathPoints: Cesium.Cartesian3[]
  segmentDistances: number[]
  totalDistance: number
  startTime: number
  totalDuration: number
  easing: EasingFunction
  state: 'pending' | 'running' | 'finished' | 'paused'
  loop: boolean
  reverseOnComplete: boolean
  onComplete?: () => void

  // 暂停相关字段
  pausedAtTime?: number // 暂停时已经过去的时间
  pausedProgress?: number // 暂停时的进度
  pauseStartTime?: number // 暂停开始的时间点
}

type AnimationOptions = {
  loop?: boolean
  reverseOnComplete?: boolean
  onComplete?: () => void
  conflictStrategy?: 'replace' | 'ignore' | 'queue' | 'stop-current'
}

type PointInput = [number, number, number?] | { x: number; y: number; z?: number } | Cesium.Cartesian3

/**
 * 完整的动画管理器 - 修复状态转换逻辑
 */
class FixedPathAnimationManager {
  private viewer: Cesium.Viewer
  private animations: Map<Cesium.Entity, AnimationState>
  private animationQueue: Map<
    Cesium.Entity,
    Array<{
      points: PointInput[]
      totalDuration: number
      easingFunc: EasingFunction | null
      options: AnimationOptions
    }>
  >
  private isAnimating: boolean
  private rafId: number | null
  private activeAnimations: number = 0

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
    this.animations = new Map()
    this.animationQueue = new Map()
    this.isAnimating = false
    this.rafId = null
  }

  /**
   * 检查实体是否正在执行动画
   */
  isEntityAnimating(entity: Cesium.Entity): boolean {
    const animState = this.animations.get(entity)
    return !!(animState && (animState.state === 'running' || animState.state === 'pending'))
  }

  /**
   * 获取实体的动画状态
   */
  getEntityAnimationState(entity: Cesium.Entity): {
    isAnimating: boolean
    state: string
    canPause: boolean
    canResume: boolean
    progress?: number
    remainingTime?: number
  } {
    const animState = this.animations.get(entity)

    if (!animState) {
      return {
        isAnimating: false,
        state: 'none',
        canPause: false,
        canResume: false,
      }
    }

    const now = performance.now()
    const elapsed = now - animState.startTime
    const progress = Math.min(elapsed / animState.totalDuration, 1)

    return {
      isAnimating: animState.state === 'running' || animState.state === 'pending',
      state: animState.state,
      canPause: animState.state === 'running', // 只有运行中的才能暂停
      canResume: animState.state === 'paused', // 只有暂停中的才能恢复
      progress,
      remainingTime: animState.totalDuration - elapsed,
    }
  }

  /**
   * 添加移动动画 - 带有冲突处理
   */
  addMoveAnimation(
    entity: Cesium.Entity,
    points: PointInput[],
    totalDuration: number,
    easingFunc: EasingFunction | null = null,
    options: AnimationOptions = {}
  ): this {
    // 参数校验
    if (!Array.isArray(points) || points.length < 2) {
      console.error('路径点至少需要2个')
      return this
    }

    // 检查实体是否已经在动画中
    const isCurrentlyAnimating = this.isEntityAnimating(entity)
    const conflictStrategy = options.conflictStrategy || 'ignore' // 默认替换策略

    // 根据冲突策略处理
    switch (conflictStrategy) {
      case 'ignore':
        if (isCurrentlyAnimating) {
          console.warn(`实体 ${entity.id || '无名实体'} 已有动画进行中，忽略新动画`)
          return this
        }
        break

      case 'queue':
        if (isCurrentlyAnimating) {
          console.log(`实体 ${entity.id || '无名实体'} 已有动画，新动画加入队列`)
          this.addToQueue(entity, points, totalDuration, easingFunc, options)
          return this
        }
        break

      case 'stop-current':
        if (isCurrentlyAnimating) {
          console.log(`实体 ${entity.id || '无名实体'} 已有动画，停止当前动画`)
          this.removeEntityAnimation(entity)
        }
        break

      case 'replace':
      default:
        // 默认行为：如果有动画，先移除
        if (this.animations.has(entity)) {
          this.removeEntityAnimation(entity)
        }
        break
    }

    // 转换所有点为Cartesian3
    const cartesianPoints = points.map(p => this.toCartesian3(p))

    // 计算距离
    const segmentDistances: number[] = []
    let totalDistance = 0

    for (let i = 0; i < cartesianPoints.length - 1; i++) {
      const dist = Cesium.Cartesian3.distance(cartesianPoints[i], cartesianPoints[i + 1])
      segmentDistances.push(dist)
      totalDistance += dist
    }

    // 创建动画状态对象
    const animState: AnimationState = {
      pathPoints: cartesianPoints,
      segmentDistances,
      totalDistance,
      startTime: performance.now(),
      totalDuration: totalDuration * 1000,
      easing: easingFunc || this.linearEasing,
      state: 'running',
      loop: options.loop || false,
      reverseOnComplete: options.reverseOnComplete || false,
      onComplete: () => {
        // 动画完成后，检查队列中是否有下一个动画
        this.checkAndPlayNextInQueue(entity)

        // 执行用户回调
        if (options.onComplete) {
          options.onComplete()
        }
      },
    }

    // 使用优化后的CallbackProperty
    // @ts-ignore
    entity.position = this.createOptimizedCallback(animState)

    // 存储动画
    this.animations.set(entity, animState)
    this.activeAnimations++

    // 如果有动画了，启动循环（如果还没启动）
    if (!this.isAnimating && this.activeAnimations > 0) {
      this.startAnimationLoop()
    }

    console.log(`为实体 ${entity.id || '无名实体'} 添加动画，策略: ${conflictStrategy}, 当前活跃动画: ${this.activeAnimations}`)
    return this
  }

  /**
   * 暂停指定实体的动画 - 修正：只有运行中的才能暂停
   */
  pauseEntityAnimation(entity: Cesium.Entity): boolean {
    const animState = this.animations.get(entity)
    if (!animState) {
      console.warn(`实体 ${entity.id || '无名实体'} 没有动画`)
      return false
    }

    if (animState.state !== 'running') {
      console.warn(`实体 ${entity.id || '无名实体'} 不在运行状态，当前状态: ${animState.state}，不能暂停`)
      return false
    }

    const now = performance.now()
    const elapsed = now - animState.startTime

    // 记录暂停状态
    animState.state = 'paused'
    animState.pausedAtTime = elapsed
    animState.pausedProgress = Math.min(elapsed / animState.totalDuration, 1)
    animState.pauseStartTime = now

    console.log(`暂停实体 ${entity.id || '无名实体'} 的动画，已进行: ${(elapsed / 1000).toFixed(1)}秒`)

    return true
  }

  /**
   * 恢复指定实体的动画 - 修正：只有暂停中的才能恢复
   */
  resumeEntityAnimation(entity: Cesium.Entity): boolean {
    const animState = this.animations.get(entity)
    if (!animState) {
      console.warn(`实体 ${entity.id || '无名实体'} 没有动画`)
      return false
    }

    if (animState.state !== 'paused') {
      console.warn(`实体 ${entity.id || '无名实体'} 不在暂停状态，当前状态: ${animState.state}，不能恢复`)
      return false
    }

    const now = performance.now()

    // 计算暂停了多久
    const pauseDuration = animState.pauseStartTime ? now - animState.pauseStartTime : 0

    // 调整开始时间，使得动画从暂停点继续
    animState.startTime = now - (animState.pausedAtTime || 0)

    // 恢复状态
    animState.state = 'running'
    delete animState.pausedAtTime
    delete animState.pausedProgress
    delete animState.pauseStartTime

    console.log(`恢复实体 ${entity.id || '无名实体'} 的动画，暂停了: ${(pauseDuration / 1000).toFixed(1)}秒`)

    return true
  }

  /**
   * 切换指定实体的暂停/恢复状态
   */
  toggleEntityAnimation(entity: Cesium.Entity): boolean {
    const animState = this.animations.get(entity)
    if (!animState) return false

    if (animState.state === 'running') {
      return this.pauseEntityAnimation(entity)
    } else if (animState.state === 'paused') {
      return this.resumeEntityAnimation(entity)
    }

    console.warn(`实体 ${entity.id || '无名实体'} 状态为 ${animState.state}，不能切换`)
    return false
  }

  /**
   * 暂停所有正在运行的动画 - 修正：只暂停运行中的
   */
  pauseAll(): number {
    let pausedCount = 0
    this.animations.forEach((animState, entity) => {
      if (animState.state === 'running') {
        if (this.pauseEntityAnimation(entity)) {
          pausedCount++
        }
      } else {
        console.log(`实体 ${entity.id || '无名实体'} 状态为 ${animState.state}，跳过暂停`)
      }
    })

    console.log(`已暂停 ${pausedCount} 个运行中的实体动画`)
    return pausedCount
  }

  /**
   * 恢复所有暂停中的动画 - 修正：只恢复暂停中的
   */
  resumeAll(): number {
    let resumedCount = 0
    this.animations.forEach((animState, entity) => {
      if (animState.state === 'paused') {
        if (this.resumeEntityAnimation(entity)) {
          resumedCount++
        }
      } else {
        console.log(`实体 ${entity.id || '无名实体'} 状态为 ${animState.state}，跳过恢复`)
      }
    })

    // 如果恢复了动画，确保动画循环在运行
    if (resumedCount > 0 && !this.isAnimating) {
      this.startAnimationLoop()
    }

    console.log(`已恢复 ${resumedCount} 个暂停中的实体动画`)
    return resumedCount
  }

  /**
   * 停止所有动画
   */
  stopAllAnimations(): void {
    console.log(`停止所有动画，共 ${this.animations.size} 个实体`)

    this.animations.forEach((animState, entity) => {
      // 将位置固定为当前位置
      const currentPos = entity.position?.getValue(Cesium.JulianDate.now())
      if (currentPos) {
        // @ts-ignore
        entity.position = new Cesium.ConstantProperty(currentPos)
      }
    })

    // 清空所有
    this.animations.clear()
    this.animationQueue.clear()
    this.activeAnimations = 0
    this.stopAnimationLoop()
  }

  /**
   * 移除单个实体的动画（保留当前位置）
   */
  removeEntityAnimation(entity: Cesium.Entity): boolean {
    if (!this.animations.has(entity)) {
      console.warn(`实体 ${entity.id || '无名实体'} 没有动画`)
      return false
    }

    const animState = this.animations.get(entity)!

    // 获取当前位置
    const currentPos = entity.position?.getValue(Cesium.JulianDate.now())
    if (currentPos) {
      // @ts-ignore
      entity.position = new Cesium.ConstantProperty(currentPos)
    }

    // 清理队列
    if (this.animationQueue.has(entity)) {
      this.animationQueue.delete(entity)
    }

    this.animations.delete(entity)
    this.activeAnimations = Math.max(0, this.activeAnimations - 1)

    console.log(`移除实体 ${entity.id || '无名实体'} 的动画，剩余活跃动画: ${this.activeAnimations}`)

    // 如果没有活跃动画了，停止循环
    if (this.activeAnimations === 0) {
      this.stopAnimationLoop()
    }

    return true
  }

  /**
   * 创建优化的CallbackProperty（支持暂停）
   */
  private createOptimizedCallback(animState: AnimationState): Cesium.CallbackProperty {
    // 预先计算好位置数组，避免每帧重复计算
    const {
      /*  pathPoints, segmentDistances, totalDistance  */
    } = animState

    // 缓存上次计算结果
    let lastProgress = -1
    let lastResult = new Cesium.Cartesian3()
    let isAnimationFinished = false
    let finalPosition: Cesium.Cartesian3 | null = null

    return new Cesium.CallbackProperty((_, result?: Cesium.Cartesian3) => {
      // 如果动画已经完成，直接返回最终位置
      if (isAnimationFinished && finalPosition) {
        return finalPosition
      }

      // 如果动画已暂停，返回暂停时的位置
      if (animState.state === 'paused' && animState.pausedProgress !== undefined) {
        return this.calculatePosition(animState, animState.pausedProgress, result || new Cesium.Cartesian3())
      }

      // 使用performance.now而不是time参数，保持独立
      const now = performance.now()
      let elapsed = now - animState.startTime

      // 处理循环
      if (animState.loop && animState.totalDuration > 0) {
        elapsed = elapsed % animState.totalDuration
      }

      // 计算进度
      let progress = Math.min(elapsed / animState.totalDuration, 1)

      // 如果进度没变化，返回缓存结果
      if (Math.abs(progress - lastProgress) < 0.0001 && progress !== 1) {
        return lastResult
      }

      lastProgress = progress

      // 应用缓动
      progress = animState.easing(progress)

      // 计算位置
      const position = this.calculatePosition(animState, progress, result || new Cesium.Cartesian3())

      // 缓存结果
      if (position && position !== result) {
        Cesium.Cartesian3.clone(position, lastResult)
      } else if (position) {
        lastResult = position
      }

      // 检查动画完成（非循环动画）
      if (progress >= 1 && animState.state === 'running' && !animState.loop) {
        isAnimationFinished = true
        finalPosition = position ? Cesium.Cartesian3.clone(position) : null
        animState.state = 'finished'

        // 延迟触发完成回调，避免在渲染循环中执行复杂逻辑
        setTimeout(() => {
          if (animState.onComplete) {
            animState.onComplete()
          }
        }, 0)
      }

      return position
    }, false)
  }

  /**
   * 计算位置
   */
  private calculatePosition(animState: AnimationState, progress: number, result: Cesium.Cartesian3): Cesium.Cartesian3 {
    const { pathPoints, segmentDistances, totalDistance } = animState

    // 确保进度在0-1之间
    const clampedProgress = Math.max(0, Math.min(1, progress))

    if (clampedProgress <= 0) return pathPoints[0]
    if (clampedProgress >= 1) return pathPoints[pathPoints.length - 1]

    if (pathPoints.length === 2) {
      // 两点直线
      return Cesium.Cartesian3.lerp(pathPoints[0], pathPoints[1], clampedProgress, result)
    }

    // 多点路径
    const targetDistance = clampedProgress * totalDistance
    let accumulatedDist = 0

    for (let i = 0; i < segmentDistances.length; i++) {
      const segmentDist = segmentDistances[i]

      if (accumulatedDist + segmentDist >= targetDistance) {
        const segmentProgress = (targetDistance - accumulatedDist) / segmentDist
        return Cesium.Cartesian3.lerp(pathPoints[i], pathPoints[i + 1], segmentProgress, result)
      }

      accumulatedDist += segmentDist
    }

    // 默认返回终点
    return pathPoints[pathPoints.length - 1]
  }

  /**
   * 启动动画循环
   */
  private startAnimationLoop(): void {
    if (this.isAnimating) return

    this.isAnimating = true
    console.log('启动动画循环')

    const animate = (currentTime: number): void => {
      if (!this.isAnimating) return

      // 只有在有活跃动画时才请求渲染
      if (this.activeAnimations > 0) {
        this.viewer.scene.requestRender()
      }

      // 检查是否需要继续循环
      if (this.activeAnimations > 0) {
        this.rafId = requestAnimationFrame(animate)
      } else {
        // 没有活跃动画，停止循环
        this.stopAnimationLoop()
      }
    }

    this.rafId = requestAnimationFrame(animate)
  }

  /**
   * 停止动画循环
   */
  private stopAnimationLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.isAnimating = false
    console.log('停止动画循环')
  }

  /**
   * 添加动画到队列
   */
  private addToQueue(
    entity: Cesium.Entity,
    points: PointInput[],
    totalDuration: number,
    easingFunc: EasingFunction | null,
    options: AnimationOptions
  ): void {
    if (!this.animationQueue.has(entity)) {
      this.animationQueue.set(entity, [])
    }

    const queue = this.animationQueue.get(entity)!
    queue.push({
      points,
      totalDuration,
      easingFunc,
      options: {
        ...options,
        // 队列中的动画继承队列行为
        conflictStrategy: options.conflictStrategy || 'queue',
      },
    })

    console.log(`实体 ${entity.id || '无名实体'} 动画队列长度: ${queue.length}`)
  }

  /**
   * 检查并播放下一个队列中的动画
   */
  private checkAndPlayNextInQueue(entity: Cesium.Entity): void {
    if (!this.animationQueue.has(entity)) return

    const queue = this.animationQueue.get(entity)!
    if (queue.length === 0) return

    // 取出队列中的第一个动画
    const nextAnim = queue.shift()!

    console.log(`从队列中取出下一个动画，剩余队列长度: ${queue.length}`)

    // 播放下一个动画
    this.addMoveAnimation(entity, nextAnim.points, nextAnim.totalDuration, nextAnim.easingFunc, nextAnim.options)
  }

  /**
   * 清空实体的动画队列
   */
  clearAnimationQueue(entity: Cesium.Entity): number {
    if (!this.animationQueue.has(entity)) {
      return 0
    }

    const queue = this.animationQueue.get(entity)!
    const queueSize = queue.length
    queue.length = 0
    this.animationQueue.delete(entity)

    console.log(`清空实体 ${entity.id || '无名实体'} 的动画队列，共 ${queueSize} 个动画`)
    return queueSize
  }

  /**
   * 获取实体的动画队列信息
   */
  getAnimationQueueInfo(entity: Cesium.Entity): { queueLength: number; nextAnimations: any[] } {
    if (!this.animationQueue.has(entity)) {
      return { queueLength: 0, nextAnimations: [] }
    }

    const queue = this.animationQueue.get(entity)!
    return {
      queueLength: queue.length,
      nextAnimations: queue.slice(0, 5), // 返回前5个动画信息
    }
  }

  /**
   * 转换输入点为Cartesian3
   */
  private toCartesian3(point: PointInput): Cesium.Cartesian3 {
    if (Array.isArray(point)) {
      return Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2] || 0)
    } else if ('x' in point && 'y' in point) {
      return new Cesium.Cartesian3(point.x, point.y, point.z || 0)
    }
    // @ts-ignore
    return point.clone ? point.clone() : point
  }

  /**
   * 线性缓动函数
   */
  private linearEasing(t: number): number {
    return t
  }

  /**
   * 获取所有动画状态统计
   */
  getAnimationsSummary(): {
    total: number
    running: number
    paused: number
    finished: number
    pending: number
  } {
    const summary = {
      total: 0,
      running: 0,
      paused: 0,
      finished: 0,
      pending: 0,
    }

    this.animations.forEach(animState => {
      summary.total++
      switch (animState.state) {
        case 'running':
          summary.running++
          break
        case 'paused':
          summary.paused++
          break
        case 'finished':
          summary.finished++
          break
        case 'pending':
          summary.pending++
          break
      }
    })

    return summary
  }

  /**
   * 获取可以暂停的实体列表
   */
  getPausableEntities(): Cesium.Entity[] {
    const entities: Cesium.Entity[] = []
    this.animations.forEach((animState, entity) => {
      if (animState.state === 'running') {
        entities.push(entity)
      }
    })
    return entities
  }

  /**
   * 获取可以恢复的实体列表
   */
  getResumableEntities(): Cesium.Entity[] {
    const entities: Cesium.Entity[] = []
    this.animations.forEach((animState, entity) => {
      if (animState.state === 'paused') {
        entities.push(entity)
      }
    })
    return entities
  }

  // 静态缓动函数
  static readonly Easing = {
    linear: (t: number): number => t,
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => --t * t * t + 1,
    easeInOutCubic: (t: number): number => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  } as const

  // 冲突策略常量
  static readonly ConflictStrategy = {
    REPLACE: 'replace' as const,
    IGNORE: 'ignore' as const,
    QUEUE: 'queue' as const,
    STOP_CURRENT: 'stop-current' as const,
  } as const
}

export default FixedPathAnimationManager
