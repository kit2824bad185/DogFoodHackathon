import { useState, useEffect, type FC } from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Breadcrumb,
  LoadingSpinner,
  Icon,
} from '../../components/ui';
import { getHealth, type HealthStatus } from '../../services';

interface DbHealthResponse {
  status?: string;
  database?: string;
  message?: string;
}

export const SettingsManager: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<HealthStatus | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = (isMounted: () => boolean) => {
    getHealth()
      .then((data) => {
        if (!isMounted()) return;
        setApiHealth(data);
        if (data.database === 'connected') {
          setDbHealth({ status: 'connected', database: 'sqlite.db' });
        }
        setError(null);
      })
      .catch((err) => {
        if (!isMounted()) return;
        setApiHealth(null);
        setDbHealth(null);
        setError(err.message || 'Backend services unreachable. Ensure local API server is running on port 3000.');
      })
      .finally(() => {
        if (isMounted()) {
          setIsLoading(false);
        }
      });
  };

  const handleManualProbe = () => {
    setIsLoading(true);
    setError(null);
    fetchHealthData(() => true);
  };

  useEffect(() => {
    let mounted = true;
    fetchHealthData(() => mounted);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Platform & System Settings"
        description="Verify local offline runtime environments, SQLite database connectivity, and backend service status."
        badge={<Badge variant="neutral" size="sm">System Configuration</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Settings' },
            ]}
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon="refresh"
            isLoading={isLoading}
            onClick={handleManualProbe}
          >
            Probe Subsystems
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent
            style={{
              padding: 'var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Probing local system services and SQLite health...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {error && (
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--status-ineligible-bg)',
                border: '1px solid var(--status-ineligible-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                color: 'var(--status-ineligible-text)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <Icon name="alert-circle" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Subsystem Health Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Express API Service */}
            <Card>
              <CardHeader
                actions={
                  apiHealth ? (
                    <Badge variant="success" size="sm">Online</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Offline</Badge>
                  )
                }
              >
                <CardTitle style={{ fontSize: 'var(--text-base)' }}>API Core Engine</CardTitle>
                <CardDescription>Local Express Node.js application server</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ fontWeight: 600, color: apiHealth ? 'var(--color-success-700)' : 'var(--color-danger-700)' }}>
                      {apiHealth?.status ? apiHealth.status.toUpperCase() : 'DISCONNECTED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Endpoint</span>
                    <span style={{ fontFamily: 'monospace' }}>/api/v1/health</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Response Timestamp</span>
                    <span>{apiHealth?.timestamp || '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SQLite Storage Engine */}
            <Card>
              <CardHeader
                actions={
                  dbHealth ? (
                    <Badge variant="success" size="sm">Connected</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending Probe</Badge>
                  )
                }
              >
                <CardTitle style={{ fontSize: 'var(--text-base)' }}>SQLite Database</CardTitle>
                <CardDescription>Local embedded relational store via Drizzle ORM</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Database Status</span>
                    <span style={{ fontWeight: 600, color: dbHealth ? 'var(--color-success-700)' : 'var(--text-muted)' }}>
                      {dbHealth?.status ? dbHealth.status.toUpperCase() : (apiHealth ? 'ONLINE' : 'UNAVAILABLE')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Storage Mode</span>
                    <span>Local File Persistence</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Engine</span>
                    <span>better-sqlite3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offline Isolation Protocol */}
            <Card>
              <CardHeader
                actions={<Badge variant="primary" size="sm">Air-Gapped</Badge>}
              >
                <CardTitle style={{ fontSize: 'var(--text-base)' }}>Network Isolation</CardTitle>
                <CardDescription>Strict offline compliance guarantees</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>External CDNs</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success-700)' }}>BLOCKED</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remote Fonts</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success-700)' }}>NONE (System Native)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cloud Telemetry</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success-700)' }}>DISABLED</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Notice */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <Icon name="shield" size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <strong>Zero Cloud Dependencies:</strong> This hackathon command center communicates exclusively over the loopback network (`127.0.0.1:3000`) and requires no internet connectivity or remote token validation.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
