import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './index.css';

const gamingTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#a855f7',
    colorSuccess: '#06b6d4',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#06b6d4',
    colorBgBase: '#0a0a0f',
    colorBgContainer: '#13131a',
    colorBorder: '#8b5cf6',
    borderRadius: 8,
    fontFamily: "'Rajdhani', 'Inter', sans-serif",
  },
  components: {
    Button: {
      primaryColor: '#fff',
      algorithm: true,
    },
    Card: {
      colorBgContainer: 'rgba(19, 19, 26, 0.8)',
      colorBorderSecondary: 'rgba(139, 92, 246, 0.3)',
    },
    Input: {
      colorBgContainer: 'rgba(15, 15, 25, 0.9)',
      colorBorder: 'rgba(139, 92, 246, 0.4)',
      activeBorderColor: '#a855f7',
      hoverBorderColor: '#c084fc',
    },
    Table: {
      colorBgContainer: 'rgba(19, 19, 26, 0.6)',
      headerBg: 'rgba(139, 92, 246, 0.1)',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={gamingTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
