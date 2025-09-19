
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Button, ConfigProvider, Space, theme } from 'antd'
import App from './App.tsx'
import Enhance from './enhance.tsx'
import Sheshan from './pages/sheshan/index.tsx'
import YellowRiver from './pages/yellow-river/index.tsx'
import Earthquake from './pages/earthquake/index.tsx'
import SuzhouRiver from './pages/suzhou-river/index.tsx'
import './index.css'


export const links = [
  {
    name: '首页',
    path: '/',
    content: '',
    element: (
      <Enhance>
        <Navigate to={'/sheshan'}></Navigate>
      </Enhance>
    ),
  },
  {
    name: '佘山',
    path: '/sheshan',
    content: '',
    element: (
      <Enhance>
        <Sheshan></Sheshan>
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
]

window.$$prefix = import.meta.env.PROD ? import.meta.env.VITE_APP_GITHUB_PROJECT_PATH : ''

createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        // Seed Token，影响范围大
        colorPrimary: '#865bf7',
      },
    }}
  >
    {
      import.meta.env.PROD ? <HashRouter>
        <Routes>
          {links.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </HashRouter> : <BrowserRouter>
        <Routes>
          {links.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    }

  </ConfigProvider>
)
