import { Link } from 'react-router-dom';
import { Button, Card, Tag } from 'antd';
import { LockOutlined, GithubOutlined, LinkedinOutlined, TwitterOutlined } from '@ant-design/icons';
import ThreeBackground from '../components/ThreeBackground';

export default function Home() {
  const projects = [
    { title: 'Point Cloud Processor', category: 'Point Cloud', tech: ['C++', 'PCL', 'OpenGL'] },
    { title: 'Real-time Analytics Dashboard', category: 'Web', tech: ['React', 'WebSocket', 'D3.js'] },
    { title: 'Enterprise API Gateway', category: 'C#', tech: ['ASP.NET', 'Redis', 'Docker'] },
    { title: 'Cloud Infrastructure Automation', category: 'DevOps', tech: ['Terraform', 'AWS', 'Kubernetes'] },
    { title: 'LiDAR Data Processing Pipeline', category: 'Point Cloud', tech: ['Python', 'PDAL', 'PostgreSQL'] },
    { title: 'Microservices Framework', category: 'C#', tech: ['.NET Core', 'RabbitMQ', 'gRPC'] },
  ];

  const skills = [
    { name: 'Point Cloud Technologies', level: 95 },
    { name: 'Web Development', level: 90 },
    { name: 'C# / .NET', level: 88 },
    { name: 'DevOps & Cloud', level: 85 },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <ThreeBackground />

      {/* Hidden Admin Login Button */}
      <Link to="/admin/login" style={{ position: 'fixed', top: 20, right: 20, zIndex: 50 }}>
        <Button
          type="text"
          icon={<LockOutlined />}
          className="glass pulse-border"
          style={{ color: '#a855f7', borderRadius: 8 }}
          data-testid="button-hidden-admin"
        />
      </Link>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '0 24px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 1200 }}>
          <h1 
            className="animate-glow gradient-text"
            style={{
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 24,
            }}
          >
            DEVELOPER PORTFOLIO
          </h1>

          <p style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', color: '#c4b5fd', marginBottom: 16 }}>
            Point Cloud • WebGL • C# / .NET • DevOps
          </p>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)', color: '#94a3b8', maxWidth: 800, margin: '0 auto 48px' }}>
            Crafting immersive 3D experiences and scalable web solutions
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              type="primary" 
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                border: 'none',
                height: 50,
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
              data-testid="button-view-projects"
            >
              View Projects
            </Button>
            <Button 
              size="large"
              className="glass"
              style={{
                color: '#06b6d4',
                borderColor: 'rgba(6, 182, 212, 0.5)',
                height: 50,
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
              data-testid="button-contact"
            >
              Contact
            </Button>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(180deg, transparent, rgba(13, 13, 26, 0.5), transparent)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="gradient-text" style={{ fontSize: 48, textAlign: 'center', marginBottom: 48, textTransform: 'uppercase' }}>
            Technical Expertise
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {skills.map((skill, i) => (
              <Card 
                key={i}
                className="glass"
                bodyStyle={{ padding: 24 }}
                data-testid={`card-skill-${i}`}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{skill.name}</span>
                    <span style={{ color: '#06b6d4', fontWeight: 700 }}>{skill.level}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(139, 92, 246, 0.2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${skill.level}%`, 
                        background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                        transition: 'width 1s ease-out',
                      }} 
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="gradient-text" style={{ fontSize: 48, textAlign: 'center', marginBottom: 48, textTransform: 'uppercase' }}>
            Featured Projects
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {projects.map((project, i) => (
              <Card
                key={i}
                className="glass"
                hoverable
                bodyStyle={{ padding: 24 }}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                data-testid={`card-project-${i}`}
              >
                <Tag color={project.category === 'Point Cloud' ? 'purple' : project.category === 'Web' ? 'cyan' : project.category === 'C#' ? 'magenta' : 'blue'}>
                  {project.category}
                </Tag>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '16px 0 12px', color: '#e0e0e0' }}>
                  {project.title}
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {project.tech.map((tech, j) => (
                    <Tag key={j} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c4b5fd' }}>
                      {tech}
                    </Tag>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <Card className="glass-strong" bodyStyle={{ padding: 48 }}>
            <h2 className="gradient-text" style={{ fontSize: 36, marginBottom: 24 }}>
              Let's Connect
            </h2>
            <p style={{ fontSize: 18, color: '#94a3b8', marginBottom: 32 }}>
              Interested in collaborating on cutting-edge 3D projects or web applications?
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button icon={<GithubOutlined />} size="large" className="glass" data-testid="button-github">
                GitHub
              </Button>
              <Button icon={<LinkedinOutlined />} size="large" className="glass" data-testid="button-linkedin">
                LinkedIn
              </Button>
              <Button icon={<TwitterOutlined />} size="large" className="glass" data-testid="button-twitter">
                Twitter
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '32px 24px', 
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        textAlign: 'center',
        color: '#64748b',
      }}>
        <p>© 2024 Developer Portfolio. Built with Vite, React, ElysiaJS, and Three.js.</p>
      </footer>
    </div>
  );
}
