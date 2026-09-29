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

export const TeamsManager: FC = () => {
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
        title="Teams Management"
        description="Inspect formed teams, verify membership capacities, and audit project associations."
        badge={<Badge variant="neutral" size="sm">Team Roster</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Teams' },
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
            Refresh Teams
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Querying team records from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:id/teams (Pending)</Badge>}
            >
              <CardTitle>Formed Teams Directory</CardTitle>
              <CardDescription>
                Units registered for the hackathon with active member rosters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="users"
                title="Organizer data is not available yet"
                description="No teams have been retrieved from the local backend (/api/v1/events/:id/teams). As participants create and assemble teams, their membership lists and project associations will be displayed here."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
