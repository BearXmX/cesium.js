
import React, { useState, useEffect } from 'react'
import './index.less'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { settingType } from '../build-map-setting/constance'

type BuildMapListPropsType = {

}

const BuildMapList: React.FC<BuildMapListPropsType> = (props) => {

  const { } = props

  const [state, setState] = useState<settingType[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    const setting = JSON.parse(localStorage.getItem('build-map-list') || '[]')

    const list = (Array.isArray(setting) ? setting : []) as settingType[]

    setState(list)
  }, [])

  return <div className='teacher-page-container'>
    <div className='teacher-page-header'></div>
    <div className='teacher-page-body'>

      <div className='build-map-list-tools'>
        <Button type='primary' icon={<PlusOutlined />} onClick={() => {
          navigate('/build-map-setting')
        }}>新建地图</Button>
      </div>
      <div className='build-map-list-content'>
        {
          state.map((item, index) => {
            return <div className='build-map-item' key={index} onClick={() => {
              navigate(`/build-map-show?id=${item.mapMetadata.id}`)
            }}>
              <div className='build-map-item-actions'>
                <span onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/build-map-setting?id=${item.mapMetadata.id}`)
                }}>修改</span>
              </div>
              <div className='build-map-item-cover'>
                <img src={item.mapMetadata.cover} alt="" style={{ width: '100%', height: 200 }} />
              </div>
              <div className='build-map-item-title'>
                <span>{item.mapMetadata.title}</span>
              </div>
              <div className='build-map-item-description'>
                <span>{item.mapMetadata.desciption}</span>
              </div>
            </div>
          })
        }
      </div>

    </div>
  </div>

}

export default BuildMapList