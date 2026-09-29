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

export const MyProject: FC = () => {
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
        title="My Project"
        description="Configure your project overview, track alignment, offline demonstration parameters, and code repository."
        badge={<StatusBadge status="Draft" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'My Project' },
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
            Check Project
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Querying project state from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Project Status Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/projects (Pending)</Badge>}
            >
              <CardTitle>Project Profile & Metadata</CardTitle>
              <CardDescription>
                Primary submission entity submitted to judges for scoring and rubric evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file"
                title="Participant data is not available yet"
                description="No active project has been registered for your team yet. Project definition endpoints (/api/v1/teams/:id/projects) will become active once your team is established."
              />
            </CardContent>
          </Card>

          {/* Project Fields Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Project Metadata Blueprint</CardTitle>
              <CardDescription>
                Required deliverables evaluated during blind judging rounds.
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
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Project Name</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Awaiting Registration</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Evaluation Track</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Awaiting Track Assignment</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Local Code Repository</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Not Linked</div>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Demonstration URI / Video</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Not Linked</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="info" size={14} />
                <span>External GitHub / demo URLs may be linked for display, but evaluation is fully offline-ready.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
