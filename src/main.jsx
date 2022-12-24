import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Frontend/App.jsx'
import './Frontend/Common/Styling/app.scss'
import '@powerws/uikit/styling'

ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
      <App className={'App'}/>
   </React.StrictMode>
)
