import * as Cesium from 'cesium'

export type EventType = {
  onCompleted?: (fixedPositions?: Cesium.Cartesian3[]) => void
  onCancel?: () => void
  onShowFinishEntity?: () => void
}
