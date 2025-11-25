import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Table, Button, Modal, Form, Input, Switch, message, Statistic, Space } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { api } from '../lib/api';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchPosts();
    }
  }, [navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Post[]>('/api/admin/posts');
      setPosts(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch posts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    message.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue(post);
    setModalVisible(true);
  };

  const handleDeletePost = async (id: number) => {
    try {
      await api.delete(`/api/admin/posts/${id}`);
      message.success('Post deleted successfully');
      fetchPosts();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete post');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPost) {
        await api.put(`/api/admin/posts/${editingPost.id}`, values);
        message.success('Post updated successfully');
      } else {
        await api.post('/api/admin/posts', values);
        message.success('Post created successfully');
      }
      setModalVisible(false);
      fetchPosts();
    } catch (error: any) {
      message.error(error.message || 'Failed to save post');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Published', 
      dataIndex: 'published', 
      key: 'published',
      render: (published: boolean) => (
        <span style={{ color: published ? '#06b6d4' : '#64748b' }}>
          {published ? 'Yes' : 'No'}
        </span>
      ),
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Post) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditPost(record)}
            data-testid={`button-edit-${record.id}`}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            size="small" 
            onClick={() => handleDeletePost(record.id)}
            data-testid={`button-delete-${record.id}`}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250} 
        style={{ 
          background: 'rgba(19, 19, 26, 0.95)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div style={{ 
          padding: '24px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <h2 className="gradient-text" style={{ fontSize: 24, margin: 0 }}>
            ADMIN PANEL
          </h2>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          style={{ background: 'transparent', border: 'none' }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'posts',
              icon: <FileTextOutlined />,
              label: 'Posts',
            },
            {
              key: 'social',
              icon: <ShareAltOutlined />,
              label: 'Social Feeds',
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: 'rgba(19, 19, 26, 0.95)', 
          borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ color: '#e0e0e0', fontSize: 20, margin: 0 }}>
            {selectedMenu === 'dashboard' ? 'Dashboard' : selectedMenu === 'posts' ? 'Manage Posts' : 'Social Feeds'}
          </h1>
        </Header>

        <Content style={{ padding: 24, background: '#0a0a0f' }}>
          {selectedMenu === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 24 }}>
                <Card className="glass">
                  <Statistic 
                    title="Total Posts" 
                    value={posts.length} 
                    valueStyle={{ color: '#a855f7' }}
                  />
                </Card>
                <Card className="glass">
                  <Statistic 
                    title="Published" 
                    value={posts.filter(p => p.published).length} 
                    valueStyle={{ color: '#06b6d4' }}
                  />
                </Card>
                <Card className="glass">
                  <Statistic 
                    title="Drafts" 
                    value={posts.filter(p => !p.published).length} 
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Card>
              </div>

              <Card className="glass" title="Recent Activity">
                <p style={{ color: '#94a3b8' }}>Welcome to your admin dashboard!</p>
              </Card>
            </div>
          )}

          {selectedMenu === 'posts' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreatePost}
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', border: 'none' }}
                  data-testid="button-new-post"
                >
                  New Post
                </Button>
              </div>

              <Card className="glass">
                <Table 
                  dataSource={posts} 
                  columns={columns} 
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </div>
          )}

          {selectedMenu === 'social' && (
            <Card className="glass">
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 48 }}>
                Social media feed integration coming soon...
              </p>
            </Card>
          )}
        </Content>
      </Layout>

      <Modal
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input data-testid="input-post-title" />
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <TextArea rows={8} data-testid="input-post-content" />
          </Form.Item>

          <Form.Item name="published" label="Published" valuePropName="checked" initialValue={false}>
            <Switch data-testid="switch-published" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" data-testid="button-save-post">
                {editingPost ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
