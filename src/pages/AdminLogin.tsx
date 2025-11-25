import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import ThreeBackground from '../components/ThreeBackground';
import { api } from '../lib/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await api.post<{ success: boolean; token?: string; user?: any; message?: string }>('/api/auth/login', values);
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        message.success('Login successful!');
        navigate('/admin/dashboard');
      } else {
        message.error(data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to connect to server');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      <ThreeBackground />

      <Card 
        className="glass-strong"
        style={{ 
          width: '100%', 
          maxWidth: 450,
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 48 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="gradient-text" style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
            ADMIN ACCESS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#8b5cf6' }} />} 
              placeholder="Username" 
              data-testid="input-username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#8b5cf6' }} />} 
              placeholder="Password" 
              data-testid="input-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                border: 'none',
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              }}
              data-testid="button-login"
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          <p>Default credentials: admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}
