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

export const JudgeHistory: FC = () => {
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
        title="Evaluation History"
        description="Historical log of finalized rubric scores and evaluations submitted during this hackathon."
        badge={<Badge variant="neutral" size="sm">Audit Log</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Judge Portal', href: '/judge' },
              { label: 'Evaluation History' },
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
            Refresh History
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Retrieving evaluation history from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main History Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/judges/me/history (Pending)</Badge>}
            >
              <CardTitle>Finalized Scoring Log</CardTitle>
              <CardDescription>
                Locked criteria evaluations submitted by your authenticated judge session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="clock"
                title="No completed evaluations recorded yet"
                description="Once you complete rubric scoring and confirm final submissions on assigned projects, an immutable log of your finalized submissions will be recorded here."
              />
            </CardContent>
          </Card>

          {/* Strict Role Isolation Notice */}
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
              <strong>Strict Role Isolation:</strong> This history log displays only evaluations submitted directly under your judge credentials. Evaluation records and scores from other judges are strictly inaccessible.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
