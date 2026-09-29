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

export const MyTeam: FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getHealth().finally(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="My Team"
        description="Manage your team roster, coordinate roles, and handle member invitations."
        badge={<StatusBadge status="Draft" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'My Team' },
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
            Refresh Roster
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking team membership status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Team Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/teams (Pending)</Badge>}
            >
              <CardTitle>Team Roster & Membership</CardTitle>
              <CardDescription>
                Collaborators assigned to your submission unit for this hackathon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="users"
                title="Participant data is not available yet"
                description="You are not currently affiliated with a team, or the team management endpoint (/api/v1/events/:id/teams) is awaiting deployment on the local backend. Once team formation is enabled, you will be able to create a team or join with an invite code."
              />
            </CardContent>
          </Card>

          {/* Team Formation Rules & Privacy Security Box */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: 'var(--text-base)' }}>Team Formation Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul
                  style={{
                    paddingLeft: 'var(--space-4)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0,
                  }}
                >
                  <li>Maximum 4 members permitted per submission team.</li>
                  <li>All team members must be registered participants in the active event.</li>
                  <li>Teams can generate a private join code to admit collaborators.</li>
                  <li>Members may belong to at most one project team per hackathon track.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle style={{ fontSize: 'var(--text-base)' }}>Privacy & Data Isolation</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                  <Icon name="shield" size={16} style={{ color: 'var(--color-primary-600)', marginTop: '2px' }} />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', margin: 0 }}>
                    In accordance with hackathon integrity guidelines, you will only have visibility into your own team’s roster and private invitation tokens. Rosters of competing teams remain isolated until project showcase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
