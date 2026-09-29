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

export const SubmissionsManager: FC = () => {
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
        title="Submissions Queue"
        description="Monitor submission pipeline states, track deadline adherence, and manage evaluation readiness."
        badge={<Badge variant="neutral" size="sm">Submission Desk</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Submissions' },
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
            Refresh Queue
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking submission states from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:id/submissions (Pending)</Badge>}
            >
              <CardTitle>Track Submissions</CardTitle>
              <CardDescription>
                Submissions moving through Draft ➔ Submitted ➔ Locked lifecycle stages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file-text"
                title="Organizer data is not available yet"
                description="No submission records have been returned from the backend (/api/v1/events/:id/submissions). As participants submit their deliverables, submission timestamps and readiness flags will appear here."
              />
            </CardContent>
          </Card>

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
            <Icon name="lock" size={18} style={{ color: 'var(--status-locked-text)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <strong>Locking Protocol:</strong> Submissions are automatically locked upon judging commencement. Administrative overrides are recorded in the audit trail.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
