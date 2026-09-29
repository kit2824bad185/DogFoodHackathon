import { useState, useEffect, type FC } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { ToastProvider, Badge, Button, Icon, Dropdown, type DropdownItem } from '../components/ui';

export const PublicLayout: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();


  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Events', to: '/events' },
    { label: 'Results', to: '/results' },
    { label: 'Archive', to: '/archive' },
  ];

  const portalMenuItems: (DropdownItem | 'divider')[] = [
    {
      id: 'participant',
      label: 'Participant Portal',
      icon: 'user',
      onClick: () => {
        window.location.href = '/participant';
      },
    },
    {
      id: 'judge',
      label: 'Judge Portal',
      icon: 'award',
      onClick: () => {
        window.location.href = '/judge';
      },
    },
    {
      id: 'organizer',
      label: 'Organizer Command Center',
      icon: 'shield',
      onClick: () => {
        window.location.href = '/organizer';
      },
    },
  ];

  return (
    <ToastProvider>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        {/* Top Navigation Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div
            className="container"
            style={{
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-600)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="award" size={20} />
                </div>
                <span>Dogfood 2026</span>
              </Link>

              <Badge variant="primary" size="sm">
                Hackathon OS
              </Badge>
            </div>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Public Navigation"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}
              className="desktop-nav"
            >
              {navLinks.map((link) => {
                const isActive =
                  link.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`nav-link-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right-Hand Controls: Portal Switcher & Offline Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--status-eligible-text)',
                  backgroundColor: 'var(--status-eligible-bg)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--status-eligible-border)',
                  fontWeight: 500,
                }}
                className="offline-badge-desktop"
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--status-eligible-text)',
                  }}
                />
                100% Offline
              </span>

              {/* Portal Selector Dropdown */}
              <Dropdown
                align="right"
                trigger={
                  <Button variant="secondary" size="sm" rightIcon="chevron-down">
                    Portals
                  </Button>
                }
                items={portalMenuItems}
              />

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="mobile-hamburger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: mobileMenuOpen ? 'var(--bg-subtle)' : 'transparent',
                }}
              >
                <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sidebar-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
            <div className="sidebar-panel">
              <div
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="award" size={20} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    Dogfood 2026
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '6px', color: 'var(--text-muted)' }}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-subtle)',
                    padding: '8px 12px 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Public Navigation
                </span>
                {navLinks.map((link) => {
                  const isActive =
                    link.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(link.to);

                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={`nav-link-item ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  );
                })}

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-3) 0' }} />

                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--text-subtle)',
                    padding: '8px 12px 4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Workspaces
                </span>
                <NavLink to="/participant" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="user" size={16} />
                  <span>Participant Portal</span>
                </NavLink>
                <NavLink to="/judge" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="award" size={16} />
                  <span>Judge Portal</span>
                </NavLink>
                <NavLink to="/organizer" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>
                  <Icon name="shield" size={16} />
                  <span>Organizer Command Center</span>
                </NavLink>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  padding: 'var(--space-4)',
                  borderTop: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--status-eligible-text)',
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--status-eligible-text)',
                    }}
                  />
                  100% Offline System
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main
          className="container"
          style={{
            flex: 1,
            paddingTop: 'var(--space-6)',
            paddingBottom: 'var(--space-10)',
          }}
        >
          <Outlet />
        </main>

        {/* Public Footer */}
        <footer
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-default)',
            padding: 'var(--space-6) 0',
            marginTop: 'auto',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              <span>&copy; 2026 Dogfood Hackathon OS</span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span>Self-Hosted & Offline-First</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Events
              </Link>
              <Link to="/results" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Results
              </Link>
              <Link to="/archive" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Archive
              </Link>
            </div>
          </div>
        </footer>

        <style>{`
          @media (min-width: 768px) {
            .desktop-nav {
              display: flex !important;
            }
            .offline-badge-desktop {
              display: inline-flex !important;
            }
            .mobile-hamburger {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </ToastProvider>
  );
};
