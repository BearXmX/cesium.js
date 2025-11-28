import type { CommonMapInstanceType } from "@/components/common-map"
import type { settingType } from "./constance"
import { Form, Input, Radio } from "antd"

type props = {
  setting: settingType
  mapInstance: React.RefObject<CommonMapInstanceType | null>
  setSetting: React.Dispatch<React.SetStateAction<settingType>>
}


export const PageMetadataToolComponent: React.FC<props> = () => {
  return <>
    <h3>地图元数据</h3>
    <br />
    <p className="build-map-body-tools-item-description">
      该模块用于设置地图的标题、描述信息、封面等信息。
    </p>
  </>
}

export const PageMetadataSettingComponent: React.FC<props> = (props) => {
  const { setting, mapInstance, setSetting } = props
  const { mapMetadata } = setting

  return <>
    <h3>设置地图元数据</h3>
    <br />
    <div className="map-metadata-setting-container">
      <Form>
        <Form.Item label="标题">
          <Input maxLength={10} value={mapMetadata.title} onChange={(e) => {
            setSetting({
              ...setting,
              mapMetadata: {
                ...mapMetadata,
                title: e.target.value
              }
            })


          }}></Input>
        </Form.Item>
        <Form.Item label="描述">
          <Input.TextArea showCount maxLength={200} value={mapMetadata.desciption} rows={8} onChange={(e) => {
            setSetting({
              ...setting,
              mapMetadata: {
                ...mapMetadata,
                desciption: e.target.value
              }
            })
          }}></Input.TextArea>
        </Form.Item>
        <Form.Item label="封面" labelCol={{ span: 24 }}>
          <div className="map-metadata-cover-item map-metadata-cover-item-active">
            <img className="map-metadata-cover-item-text-img" src="https://q3.itc.cn/images01/20251004/6b6104cb287743fa82808c060ab22f83.png" alt="" />
            <div className="map-metadata-cover-item-text">默认封面</div>
          </div>
        </Form.Item>
      </Form>
    </div>

  </>
}