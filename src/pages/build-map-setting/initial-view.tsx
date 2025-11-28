import type { cameraFlyParamsType, CommonMapInstanceType } from "@/components/common-map"
import type { settingType } from "./constance"
import { transfromDestination } from "."
import { AimOutlined, CameraOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, DragOutlined, EditOutlined, SaveOutlined, TwitterOutlined } from "@ant-design/icons"
import { Button, Input, type InputRef } from "antd"
import { useEffect, useRef, useState } from "react"

type props = {
  setting: settingType
  mapInstance: React.RefObject<CommonMapInstanceType | null>
  setSetting: React.Dispatch<React.SetStateAction<settingType>>
}


export const InitialViewToolComponent: React.FC<props> = () => {
  return <>
    <h3>初始视角</h3>
    <br />
    <p className="build-map-body-tools-item-description">
      该模块用于设置地图的初始视角，可设置多个视角，依次切换。
    </p>
  </>
}


// 新增：记录拖拽中的索引
type DragState = {
  draggingIndex: number | null
}

export const InitialViewSettingComponent: React.FC<props> = (props) => {
  const { setting, mapInstance, setSetting } = props

  const [dragState, setDragState] = useState<DragState>({ draggingIndex: null })
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const editInputRef = useRef<InputRef>(null)

  // 1. 开始拖拽：绑定到DragOutlined图标
  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString())
    setDragState({ draggingIndex: index })
    // 拖拽图标/父项的样式反馈
    e.currentTarget.style.cursor = "grabbing"
    // 让整个项也有视觉反馈（可选）
    const parentItem = e.currentTarget.closest("div[data-index]") as HTMLDivElement
    if (parentItem) parentItem.style.opacity = "0.2"
  }

  // 2. 拖拽过程：放置区（整个项）处理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = "#484848ff" // 放置区高亮
  }

  // 3. 离开放置区：恢复样式
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = "#383838ff"
  }

  // 4. 放置完成：交换数据
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    const draggingIndex = Number(e.dataTransfer.getData("text/plain"))

    if (draggingIndex === targetIndex) {
      e.currentTarget.style.backgroundColor = "#383838ff"
      return
    }

    const newInitialView = [...setting.initialView]
    const draggedItem = newInitialView[draggingIndex]
    newInitialView.splice(draggingIndex, 1)
    newInitialView.splice(targetIndex, 0, draggedItem)

    setSetting(prev => ({ ...prev, initialView: newInitialView }))
    e.currentTarget.style.backgroundColor = "#383838ff"
  }

  // 5. 拖拽结束：恢复样式（绑定到DragOutlined图标）
  const handleDragEnd = (e: React.DragEvent<HTMLSpanElement>) => {
    e.currentTarget.style.cursor = "grab"
    // 恢复整个项的样式
    const parentItem = e.currentTarget.closest("div[data-index]") as HTMLDivElement
    if (parentItem) parentItem.style.opacity = "1"
    setDragState({ draggingIndex: null })
  }

  useEffect(() => {
    if (editIndex === null) {
      editInputRef.current = null
    }
  }, [editIndex])

  return <div className="initial-view-setting-component">
    <h3>设置初始视角</h3>
    <br />

    <Button type="link" size="small" icon={<CameraOutlined />} style={{ color: 'var(--primary-active-color)' }} onClick={() => {
      setSetting(prev => ({
        ...prev,
        initialView: [
          ...prev.initialView,
          {
            title: `视角${prev.initialView.length + 1}`,
            ...mapInstance.current?.getCameraParams()!
          }
        ]
      }))
    }}>设置当前视角</Button>

    <Button type="link" size="small" icon={<TwitterOutlined />} style={{ color: '#00b96b' }} onClick={() => {
      const initialViewParams: cameraFlyParamsType[] = setting.initialView.map(item => ({
        destination: transfromDestination(item.destination),
        orientation: item.orientation
      }))
      mapInstance.current?.executeFlySequence(initialViewParams)
    }}>漫游所有视角</Button>
    <br />
    <br />

    {setting.initialView.map((item, index) => (
      <div
        className="initial-view-setting-item"
        key={index}
        data-index={index}
        style={{
          backgroundColor: dragState.draggingIndex === index ? "#484848ff" : "#383838ff",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
      >
        <div className="initial-view-setting-item-left">
          {/* 拖拽图标：绑定draggable和拖拽事件 */}
          <span
          >
            <DragOutlined title="拖拽排序" draggable
              className="initial-view-setting-item-drag-icon"
              onDragStart={(e) => {
                setEditIndex(null)
                handleDragStart(e, index)
              }}
              onDragEnd={handleDragEnd} />
          </span>
          <span>
            {editIndex === index ? (
              <Input
                size="small"
                ref={editInputRef}
                style={{ width: 130 }}
                autoFocus
                maxLength={10}
                defaultValue={item.title}
              />
            ) : item.title}
          </span>
        </div>

        <div className="initial-view-setting-item-right" >
          <span className="setting-item-edit" >
            {editIndex === index ? (
              <>
                <CloseOutlined title="取消编辑" onClick={() => {
                  setEditIndex(null)
                }} />
                &nbsp; &nbsp;
                <CheckOutlined title="确认" onClick={() => {
                  const inputValue = editInputRef.current?.input?.value?.trim()
                  if (!inputValue) return // 空值不保存
                  const newInitialView = setting.initialView.map((view, viewIndex) =>
                    viewIndex === editIndex ? { ...view, title: inputValue } : view
                  )
                  setSetting(prev => ({ ...prev, initialView: newInitialView }))
                  setEditIndex(null)
                }} /></>

            ) : (
              <><EditOutlined title="编辑" onClick={() => {
                setEditIndex(index)
              }} /></>
            )}
          </span>
          <span className="setting-item-aim">
            <AimOutlined title="定位" onClick={() => {
              const initialViewParams: cameraFlyParamsType[] = [{
                destination: transfromDestination(item.destination),
                orientation: item.orientation
              }]
              mapInstance.current?.executeFlySequence(initialViewParams)
            }} />
          </span>
          <span className="setting-item-delete">
            <DeleteOutlined title="删除" onClick={() => {
              setEditIndex(null)
              setSetting(prev => ({
                ...prev,
                initialView: prev.initialView.filter((_, i) => i !== index)
              }))
            }} />
          </span>
        </div>
      </div>
    ))}
  </div>
}