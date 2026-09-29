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
  EmptyState,
  LoadingSpinner,
  Icon,
} from '../../components/ui';
import { getHealth } from '../../services';

export const AuditLogViewer: FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getHealth().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Immutable Audit Trail"
        description="Tamper-evident system log tracking administrative state changes, scoring updates, and security events."
        badge={<Badge variant="neutral" size="sm">Compliance Log</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Audit Trail' },
            ]}
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon="refresh"
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true);
              getHealth().finally(() => setIsLoading(false));
            }}
          >
            Refresh Log
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
              Checking audit trail status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/audit-logs (Pending)</Badge>}
            >
              <CardTitle>System Audit Event Records</CardTitle>
              <CardDescription>
                Chronological ledger showing timestamp, actor, action, target entity, and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="clock"
                title="Audit records are not available yet"
                description="No system audit records have been returned from the backend (/api/v1/audit-logs). Every administrative action, eligibility override, score submission, and configuration update will be permanently logged here once backend services are connected."
              />
            </CardContent>
          </Card>

          {/* Immutability & Security Notice: Strict rule - no edit or delete controls allowed */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderLeft: '4px solid var(--color-primary-600)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <Icon name="shield" size={20} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Append-Only Ledger Policy:</strong> Audit logs are strictly immutable and permanent. The frontend intentionally provides no edit or delete controls to ensure audit integrity and compliance with hackathon regulatory standards.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
