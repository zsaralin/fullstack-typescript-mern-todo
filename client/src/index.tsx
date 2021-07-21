import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

ReactDOM.render(
    <React.StrictMode>
        <App />
        <script src = "/socket.io/socket.io.js"></script>

        <script>
            const socket = io();
        </script>
    </React.StrictMode>,
    document.getElementById('root'),
)
