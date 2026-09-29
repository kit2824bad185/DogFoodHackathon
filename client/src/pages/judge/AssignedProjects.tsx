import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const AssignedProjects: FC = () => {
  const navigate = useNavigate();
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
        title="Assigned Projects"
        description="Submissions allocated to your judge profile for criteria evaluation and rubric scoring."
        badge={<Badge variant="info" size="sm">Blind Evaluation</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Judge Portal', href: '/judge' },
              { label: 'Assigned Projects' },
            ]}
          />
        }
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
            <Button
              variant="secondary"
              size="sm"
              leftIcon="flag"
              onClick={() => navigate('/judge/conflicts')}
            >
              Report COI
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking assignment queue from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Assignment Queue Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/judges/me/assignments (Pending)</Badge>}
            >
              <CardTitle>Evaluation Roster</CardTitle>
              <CardDescription>
                Assigned submissions for blind review. Once assigned by organizers, you will score each project against rubric criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file-text"
                title="Judge assignment data is not available yet"
                description="No projects have been assigned to your evaluation queue. Once participants submit their projects and the organizers finalize judge assignments (/api/v1/judges/me/assignments), your assignments will be loaded here."
                action={
                  <Button
                    variant="outline"
                    leftIcon="flag"
                    onClick={() => navigate('/judge/conflicts')}
                  >
                    View Conflict of Interest (COI) Guidelines
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Privacy & Blind Evaluation Notice */}
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
              <Icon name="shield" size={18} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Blind Evaluation Privacy Guarantee:</strong> In accordance with DogFood 2026 rules, you will never see which other judges are assigned to the same projects, nor will you see peer scores or feedback. All scores remain confidential until normalization is finalized.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
