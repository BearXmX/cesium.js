import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import type { billboardWidget, lineWidget, settingType, textWidget } from "./constance"
import type { IDomEditor, IToolbarConfig } from '@wangeditor/editor'
import { useEffect, useState } from 'react'

type EditorPropsType = {
  setting: settingType
  item: billboardWidget | textWidget | lineWidget
  index: number
  setSetting: React.Dispatch<React.SetStateAction<settingType>>
}
const EditorWidget: React.FC<EditorPropsType> = (props) => {
  const { item, index, setSetting } = props

  const [editor, setEditor] = useState<IDomEditor | null>(null) // TS 语法

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      // 菜单 key
      'headerSelect',
      // 菜单 key
      'bold',
      'italic',
      'fontSize',
      'color',
      'fullScreen'
    ],
  }

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  return <>
    <Toolbar

      editor={editor}
      defaultConfig={toolbarConfig}
      mode="default"
      style={{ borderBottom: '1px solid #ccc' }}
    />
    <Editor onCreated={setEditor} style={{ height: '300px', overflowX: 'hidden' }} defaultConfig={{
      scroll: true,
    }} value={item.params.content} onChange={(editor) => {
      setSetting(prev => ({
        ...prev,
        mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
          if (widgetIndex === index) {
            const v = widget as billboardWidget
            return { ...widget, params: { ...v.params, content: editor.getHtml()! } }
          }

          return widget
        }),
      }))
    }}></Editor></>
}

export default EditorWidget;