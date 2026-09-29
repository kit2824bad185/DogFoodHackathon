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
} from '../../components/ui';
import { getHealth } from '../../services';

export const JudgesManager: FC = () => {
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
        title="Judges Directory"
        description="Manage the evaluating judge pool, assign track expertise, and monitor review loads."
        badge={<Badge variant="neutral" size="sm">Evaluation Pool</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Judges' },
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
            Refresh Pool
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking judge accounts from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:id/judges (Pending)</Badge>}
            >
              <CardTitle>Evaluating Judges Pool</CardTitle>
              <CardDescription>
                Authorized evaluators onboarded to review and score hackathon submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="users"
                title="Organizer data is not available yet"
                description="No judge records have been loaded from the backend (/api/v1/events/:id/judges). When judges are assigned to the active event, their roster and capacity metrics will appear here."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
