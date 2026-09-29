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

export const ScoresStream: FC = () => {
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
        title="Scores Stream & Review Progress"
        description="Monitor incoming criteria evaluations, verify review completeness, and track scoring velocity."
        badge={<Badge variant="neutral" size="sm">Scoring Progress</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Scores Stream' },
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
            Refresh Feed
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking scoring stream from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/scores/organizer (Pending)</Badge>}
            >
              <CardTitle>Incoming Evaluations Feed</CardTitle>
              <CardDescription>
                Real-time review progress across tracks and assigned projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="check-circle"
                title="Organizer data is not available yet"
                description="No score submissions have been registered by evaluating judges. When judges submit criterion scores and lock evaluations, completion percentages and submission timestamps will populate here."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
