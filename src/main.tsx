import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Button, ConfigProvider, Space, theme } from 'antd'
import Enhance from './enhance.tsx'
import SheshanMountain from './pages/sheshan-mountain/index.tsx'
import YellowRiver from './pages/yellow-river/index.tsx'
import Earthquake from './pages/earthquake/index.tsx'
import SuzhouRiver from './pages/suzhou-river/index.tsx'
import HengduanMountains from './pages/hengduan-mountains/index.tsx'
import SolarSystem from './pages/solar-system/index.tsx'
import SimpleSeismograph from './pages/simple-seismograph/index.tsx'
import EarthConstruction from './pages/earth-construction/index.tsx'
import Solar from './pages/solar-system2/index.tsx'
import BuildMapSetting from './pages/build-map-setting/index.tsx'
import { useEffect } from 'react'
import BuildMapList from './pages/build-map-list/index.tsx'
import BuildMapShow from './pages/build-map-show/index.tsx'
import './index.css'
import '@wangeditor/editor/dist/css/style.css' // 引入 css

export const links = [
  {
    name: '首页',
    path: '/',
    content: '',
    element: (
      <Enhance>
        <Navigate to={'/sheshan-mountain'}></Navigate>
      </Enhance>
    ),
  },
  {
    name: '佘山',
    path: '/sheshan-mountain',
    content: '',
    element: (
      <Enhance>
        <SheshanMountain></SheshanMountain>
      </Enhance>
    ),
  },
  {
    name: '黄河',
    path: '/yellow-river',
    content: '',
    element: (
      <Enhance>
        <YellowRiver></YellowRiver>
      </Enhance>
    ),
  },
  {
    name: '地震',
    path: '/earthquake',
    content: '',
    element: (
      <Enhance>
        <Earthquake></Earthquake>
      </Enhance>
    ),
  },
  {
    name: '苏州河',
    path: '/suzhou-river',
    content: '',
    element: (
      <Enhance>
        <SuzhouRiver></SuzhouRiver>
      </Enhance>
    ),
  },
  {
    name: '横断山',
    path: '/hengduan-mountains',
    content: '',
    element: (
      <Enhance>
        <HengduanMountains></HengduanMountains>
      </Enhance>
    ),
  },
  {
    name: '太阳系',
    path: '/solar-system',
    content: '',
    element: (
      <Enhance>
        <SolarSystem></SolarSystem>
      </Enhance>
    ),
  },
  {
    name: '简易地震仪',
    path: '/simple-seismograph',
    content: '',
    element: (
      <Enhance>
        <SimpleSeismograph></SimpleSeismograph>
      </Enhance>
    ),
  },
  {
    name: '地球的构造',
    path: '/earth-construction',
    content: '',
    element: (
      <Enhance>
        <EarthConstruction></EarthConstruction>
      </Enhance>
    ),
  },
  {
    name: '太阳',
    path: '/solar',
    content: '',
    element: (
      <Enhance>
        <Solar></Solar>
      </Enhance>
    ),
  },
  {
    name: '构建地图',
    path: '/build-map-setting',
    content: '',
    element: (
      <Enhance>
        <BuildMapSetting mapModel='build-edit'></BuildMapSetting>
      </Enhance>
    ),
  },
  {
    name: '构建地图列表页',
    path: '/build-map-list',
    content: '',
    element: (
      <Enhance>
        <BuildMapList></BuildMapList>
      </Enhance>
    ),
  },
  {
    name: '地图详情',
    path: '/build-map-show',
    content: '',
    element: (
      <Enhance>
        <BuildMapShow></BuildMapShow>
      </Enhance>
    ),
  }
]


window.$$prefix = import.meta.env.PROD ? import.meta.env.VITE_APP_GITHUB_PROJECT_PATH : ''


const Config = () => {

  useEffect(() => {

  })

  return <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        // Seed Token，影响范围大
        colorPrimary: '#865bf7',
      },
    }}
  >
    {import.meta.env.PROD ? (
      <HashRouter>
        <Routes>
          {links.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </HashRouter>
    ) : (
      <BrowserRouter>
        <Routes>
          {links.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    )}
  </ConfigProvider>
}

createRoot(document.getElementById('root')!).render(

  <Config></Config>
)
