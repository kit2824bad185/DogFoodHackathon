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

export const MyRegistration: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHealth()
      .then(() => {
        if (mounted) {
          setServerConnected(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setServerConnected(false);
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
        title="My Registration"
        description="View and verify your official event enrollment, track assignment, and participation status."
        badge={<StatusBadge status="Pending" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'My Registration' },
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
              getHealth()
                .then(() => setServerConnected(true))
                .catch(() => setServerConnected(false))
                .finally(() => setIsLoading(false));
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
              Checking registration availability from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Registration Status Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/registrations (Pending)</Badge>}
            >
              <CardTitle>Registration Enrollment Details</CardTitle>
              <CardDescription>
                Official record linking your account to the current hackathon season.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="user"
                title="Participant data is not available yet"
                description={
                  serverConnected
                    ? 'No registration record has been received from the backend for this session. The registration endpoints (/api/v1/events/:id/register) are awaiting backend deployment.'
                    : 'The local backend server is unreachable. Please ensure the Express API server is active on port 3000.'
                }
              />
            </CardContent>
          </Card>

          {/* Registration Fields Specification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Schema Specification</CardTitle>
              <CardDescription>
                Fields managed by the hackathon registration engine once activated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigned Event</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Awaiting Event Assignment</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Primary Track</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Awaiting Track Selection</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Registration Status</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Unconfirmed (Pending Backend)</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Eligibility Baseline</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Pending Review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Important Milestones Note */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ color: 'var(--color-primary-600)', marginTop: '2px' }}>
              <Icon name="info" size={18} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Registration Window Notice:</strong> When registration opens on the local backend, you will be able to review important dates, confirm your contact details, select challenge tracks, and submit team affiliations directly from this panel.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
