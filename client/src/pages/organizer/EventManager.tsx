import { useState, useEffect, type FC } from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatusBadge,
  Badge,
  Button,
  Breadcrumb,
  EmptyState,
  LoadingSpinner,
  Icon,
} from '../../components/ui';
import { getHealth } from '../../services';

export const EventManager: FC = () => {
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
        title="Event Configuration & State Machine"
        description="Configure event lifecycle states, schedule windows, tracks, and prize categories."
        badge={<StatusBadge status="Draft" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Event Configuration' },
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
            Check Status
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Querying event configuration from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Event State Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events (Pending)</Badge>}
            >
              <CardTitle>Active Event Entity</CardTitle>
              <CardDescription>
                Core event record controlling registration opening, submission cutoff, and judging transition.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="calendar"
                title="Organizer data is not available yet"
                description="No event records have been retrieved from the local backend (/api/v1/events). Once an event entity is seeded in SQLite or created by organizers, its lifecycle state machine, deadlines, and tracks will appear here."
              />
            </CardContent>
          </Card>

          {/* Event State Machine Protocol Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: 'var(--text-base)' }}>Event State Machine Lifecycle</CardTitle>
              <CardDescription>
                Sequential state transitions enforced strictly by backend validation logic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Draft" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Event setup, track definitions, and rubrics configuration.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Pending" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Registration open for participants and team creation.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="In Progress" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Active hacking period; teams building and submitting projects.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Locked" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Submissions closed; blind judge evaluation & normalization.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Published" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Results declared, certificates issued, and event archived.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offline Security Box */}
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
              <strong>Transition Enforcement:</strong> State changes (such as advancing from Active Hacking to Judging) are validated against deadline timestamps and cannot be arbitrarily forced without admin audit override.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
