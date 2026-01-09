import { Menu, Popover, Select, Tabs } from 'antd'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { links as routes } from './main'

type EnhancePropsType = {
  children: React.ReactNode
}

const Enhance: React.FC<EnhancePropsType> = props => {
  const { } = props

  const navigate = useNavigate()

  useEffect(() => { }, [])

  return (
    <>
      {process.env.NODE_ENV !== 'production' && (
        <Select
          key={window.location.pathname}
          value={window.location.hash.replace('#', '')}
          style={{ width: 120, position: 'absolute', top: '50%', left: 10, zIndex: 2 }}
          options={routes.slice(1).map((item, index) => ({
            value: item.path,
            label: item.name,
          }))}
          onChange={val => {
            navigate(val)
          }}
        />
      )}
      {props.children}
    </>
  )
}

export default Enhance
