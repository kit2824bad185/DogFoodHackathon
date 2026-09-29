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

export const Submission: FC = () => {
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
        title="Project Submission"
        description="Formalize and submit your team project to evaluation tracks before the judging deadline."
        badge={<StatusBadge status="Draft" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'Submission' },
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
              Querying submission state from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Submission State Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/submissions (Pending)</Badge>}
            >
              <CardTitle>Track Submission Status</CardTitle>
              <CardDescription>
                Formal submission linking your project to criteria rubrics and assigned judges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file-text"
                title="Participant data is not available yet"
                description="No active submission package has been generated for your account. The project submission endpoints (/api/v1/projects/:id/submissions) will activate once event submissions open."
              />
            </CardContent>
          </Card>

          {/* Submission Lifecycle Stages Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Workflow Lifecycle</CardTitle>
              <CardDescription>
                States enforced by the backend submission state machine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Draft" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Initial editing state; metadata and links can be updated freely.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Pending" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Validation checks in progress; awaiting automated eligibility verification.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Submitted" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Formally logged and locked for judge assignments.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Locked" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Evaluation commenced; modifications locked to preserve judging integrity.</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon name="lock" size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Final submissions will require explicit user confirmation. Once locked by the backend, edits require organizer administrative action.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
