import { useState, useEffect, type FC, type ReactNode } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  ToastProvider,
  Button,
  Icon,
  Dropdown,
  type IconName,
  type DropdownItem,
} from '../components/ui';

export interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  badge?: ReactNode;
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  items: NavItem[];
}

export interface SidebarLayoutProps {
  portalName: string;
  portalBadge: ReactNode;
  portalHomeUrl: string;
  navSections: NavSection[];
  banner?: ReactNode;
}

export const SidebarLayout: FC<SidebarLayoutProps> = ({
  portalName,
  portalBadge,
  portalHomeUrl,
  navSections,
  banner,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const location = useLocation();


  // Handle Escape key to close mobile drawer
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

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const portalMenuItems: (DropdownItem | 'divider')[] = [
    {
      id: 'public',
      label: 'Public Overview',
      icon: 'external-link',
      onClick: () => {
        window.location.href = '/';
      },
    },
    'divider',
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

  const renderNavContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to={portalHomeUrl}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: 'var(--text-base)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="award" size={16} />
          </div>
          <span>Dogfood 2026</span>
        </Link>

        {portalBadge}
      </div>

      {/* Navigation Sections */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4) var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {navSections.map((section, sIdx) => {
          const sectionKey = section.title || `section-${sIdx}`;
          const isCollapsed = Boolean(section.collapsible && collapsedSections[sectionKey]);

          return (
            <div key={sectionKey} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.title && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: section.collapsible ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => {
                    if (section.collapsible) {
                      toggleSection(sectionKey);
                    }
                  }}
                >
                  <span>{section.title}</span>
                  {section.collapsible && (
                    <Icon
                      name={isCollapsed ? 'chevron-right' : 'chevron-down'}
                      size={12}
                      style={{ color: 'var(--text-subtle)' }}
                    />
                  )}
                </div>
              )}

              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.to
                      : location.pathname === item.to ||
                        (item.to !== portalHomeUrl && location.pathname.startsWith(item.to));

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`nav-link-item ${isActive ? 'active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon name={item.icon} size={16} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && <span>{item.badge}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer Link */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <Icon name="arrow-left" size={14} />
          <span>Return to Public Hub</span>
        </Link>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
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
          100% Offline Mode
        </span>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="sidebar-layout">
        {/* Desktop Fixed Sidebar */}
        <aside className="sidebar-desktop" aria-label={`${portalName} Navigation`}>
          {renderNavContent()}
        </aside>

        {/* Mobile Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="sidebar-mobile-drawer" role="dialog" aria-modal="true" aria-label="Portal Navigation">
            <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
            <div className="sidebar-panel">
              {renderNavContent()}
            </div>
          </div>
        )}

        {/* Right-Hand Content Area */}
        <div className="sidebar-content-area">
          {/* Top Bar */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              height: '60px',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Mobile hamburger button */}
              <button
                type="button"
                aria-label="Open sidebar menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(true)}
                className="mobile-sidebar-toggle"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Icon name="menu" size={20} />
              </button>

              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                }}
              >
                {portalName}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Dropdown
                align="right"
                trigger={
                  <Button variant="outline" size="sm" rightIcon="chevron-down">
                    Switch Portal
                  </Button>
                }
                items={portalMenuItems}
              />
            </div>
          </header>

          {/* Optional Privacy/Alert Banner */}
          {banner && <div style={{ borderBottom: '1px solid var(--border-default)' }}>{banner}</div>}

          {/* Main Outlet */}
          <main
            style={{
              flex: 1,
              padding: 'var(--space-6)',
              maxWidth: '1280px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Outlet />
          </main>
        </div>

        <style>{`
          @media (min-width: 1024px) {
            .mobile-sidebar-toggle {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </ToastProvider>
  );
};
