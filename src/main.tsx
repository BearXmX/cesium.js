
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Button, ConfigProvider, Space, theme } from 'antd'
import App from './App.tsx'
import Enhance from './enhance.tsx'
import YellowRiver from './pages/yellow-river/index.tsx'
import './index.css'
import Earthquake from './pages/earthquake/index.tsx'


export const links = [
  {
    name: '等高线',
    path: '/',
    content: '',
    element: (
      <Enhance>
        <App></App>
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
