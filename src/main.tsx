import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Button, ConfigProvider, Space, theme } from 'antd'

import App from './App.tsx'
import './index.css'


export const links = [
  {
    name: '',
    path: '/',
    content: '',
    element: (
      <>
        <App key={'/'}></App>
      </>
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
