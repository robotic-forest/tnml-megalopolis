import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Mainframe from './Mainframe.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Mainframe />
  </StrictMode>,
)
