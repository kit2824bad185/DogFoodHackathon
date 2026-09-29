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

export const CoiResolutions: FC = () => {
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
        title="Conflict of Interest (COI) Resolutions"
        description="Review conflict declarations submitted by judges and reassign flagged submissions to alternate evaluators."
        badge={<Badge variant="warning" size="sm">Review Queue</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'COI Resolutions' },
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
              Checking COI declarations from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/conflicts/organizer (Pending)</Badge>}
            >
              <CardTitle>Flagged Affiliations Roster</CardTitle>
              <CardDescription>
                Submissions removed from initial judging queues awaiting reassignment by organizers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="flag"
                title="Organizer data is not available yet"
                description="No conflicts of interest have been reported by judges. When a judge flags a project due to mentorship, prior affiliation, or personal knowledge, it will appear here for review and reassignment."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
