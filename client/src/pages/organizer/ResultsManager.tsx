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
  ConfirmationDialog,
  LoadingSpinner,
  Icon,
  useToast,
} from '../../components/ui';
import { getHealth } from '../../services';

export const ResultsManager: FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHealth().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePublishResults = () => {
    setIsProcessing(true);
    // Real call will go to POST /api/v1/events/:id/publish-results
    getHealth()
      .then(() => {
        setIsPublishModalOpen(false);
        toast.info('API Pending', 'Backend results publication endpoint is awaiting deployment.');
      })
      .catch((err) => {
        setIsPublishModalOpen(false);
        toast.error('Publication Failed', err.message || 'Server error.');
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <div>
      <PageHeader
        title="Results & Leaderboard Management"
        description="Verify normalized standings, resolve ranking ties, and publish official public leaderboards."
        badge={<StatusBadge status="Draft" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Results' },
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
              Refresh Rankings
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="award"
              onClick={() => setIsPublishModalOpen(true)}
            >
              Publish Official Results
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking results status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Results State Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:id/results (Pending)</Badge>}
            >
              <CardTitle>Official Leaderboard Rankings</CardTitle>
              <CardDescription>
                Standings generated from aggregated normalized scores across challenge tracks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="award"
                title="Organizer data is not available yet"
                description="Final normalized rankings have not been computed by the backend (/api/v1/events/:id/results). Once evaluation scores are finalized and normalization is executed, the verified leaderboard will appear here for review before publishing."
              />
            </CardContent>
          </Card>

          {/* Results Lifecycle Protocol Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: 'var(--text-base)' }}>Results Publication Lifecycle</CardTitle>
              <CardDescription>
                State progression safeguarding against premature disclosure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Draft" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Preliminary scores incoming; normalization not yet executed.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Pending" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Normalized standings undergoing organizer review and tie-breaker checks.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Locked" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Final rankings locked and signed off; prepared for public announcement.</div>
                </div>
                <div style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ marginBottom: '6px' }}><StatusBadge status="Published" /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Publicly visible on participant dashboards and public leaderboard.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclosure Safeguard */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <Icon name="shield" size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <strong>Public Isolation:</strong> Results remain strictly concealed from the Public and Participant portals until the backend state transitions to Published.
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog before irreversible publication */}
      <ConfirmationDialog
        isOpen={isPublishModalOpen}
        onCancel={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishResults}
        isLoading={isProcessing}
        title="Publish Official Results?"
        message="Publishing results makes final rankings, track winners, and awarded prizes publicly accessible across all participant and public portals. This action cannot be undone. Are you sure you wish to proceed?"
        confirmText="Confirm & Publish"
        variant="primary"
      />
    </div>
  );
};
