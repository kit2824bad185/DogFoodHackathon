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

export const Results: FC = () => {
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
        title="Hackathon Results"
        description="Official published outcomes, track placements, and awarded prizes."
        badge={<StatusBadge status="Pending" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'Results' },
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
            Check Publication Status
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking results publication status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Results State Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Status: Unreleased</Badge>}
            >
              <CardTitle>Official Leaderboard & Awards</CardTitle>
              <CardDescription>
                Verified standings published after completion of blind scoring and Z-score normalization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="award"
                title="Results have not been published yet"
                description="Evaluation is either currently underway or awaiting normalization confirmation by organizers. As soon as final results are officially signed off and published (/api/v1/events/:id/results), your team's placement and awards will appear here."
              />
            </CardContent>
          </Card>

          {/* Privacy & Integrity Disclosure */}
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
              <strong style={{ color: 'var(--text-primary)' }}>Judging Confidentiality:</strong> In accordance with strict hackathon integrity standards, individual judge names, raw criterion scores, and internal statistical normalization calculations are kept confidential. Only officially sanctioned final rankings and awards will be released.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
