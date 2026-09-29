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
  ConfirmationDialog,
  LoadingSpinner,
  Icon,
  useToast,
} from '../../components/ui';
import { getHealth } from '../../services';

export const NormalizationManager: FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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

  const handleRunNormalization = () => {
    setIsProcessing(true);
    // Real call will go to POST /api/v1/events/:id/normalize when backend implements it
    getHealth()
      .then(() => {
        setIsConfirmOpen(false);
        toast.info('API Pending', 'Backend normalization engine (/api/v1/events/:id/normalize) is awaiting deployment.');
      })
      .catch((err) => {
        setIsConfirmOpen(false);
        toast.error('Execution Failed', err.message || 'Server error.');
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <div>
      <PageHeader
        title="Statistical Normalization Engine"
        description="Deterministic Z-score normalization leveling judge scoring bias and aggregating final placements."
        badge={<Badge variant="neutral" size="sm">Statistical Engine</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Normalization' },
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
              Refresh Engine
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="refresh"
              onClick={() => setIsConfirmOpen(true)}
            >
              Run Normalization
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking normalization engine status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Engine Status Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:id/normalize (Pending)</Badge>}
            >
              <CardTitle>Z-Score Normalization Pipeline</CardTitle>
              <CardDescription>
                Deterministic mathematical model computing judge mean (μ), standard deviation (σ), and normalized z-scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="refresh"
                title="Organizer data is not available yet"
                description="The normalization engine is awaiting completion of active judging rounds. Once all assigned judges submit finalized scores, organizers can execute the deterministic normalization pipeline to produce official rankings."
                action={
                  <Button
                    variant="primary"
                    leftIcon="refresh"
                    onClick={() => setIsConfirmOpen(true)}
                  >
                    Trigger Normalization Run
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Mathematical Integrity Rules Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: 'var(--text-base)' }}>Mathematical Integrity Protocol</CardTitle>
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
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Formula: Z = (X - μ) / σ
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
                    Raw score X is calibrated against each judge's scoring mean (μ) and standard deviation (σ) to eliminate harsh/lenient judge bias.
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Single Source of Truth
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
                    Normalization is executed strictly server-side inside the SQLite engine. The frontend never computes independent or conflicting scoring calculations.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offline Security Box */}
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
              <strong>Reproducibility:</strong> Normalization outputs are deterministic and reproducible. Given the same set of raw scores, the engine generates identical rankings.
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog before running normalization */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleRunNormalization}
        isLoading={isProcessing}
        title="Execute Normalization Run?"
        message="Running normalization recalculates mean, standard deviation, and aggregated project rankings across all tracks. Do you wish to execute the algorithm now?"
        confirmText="Execute Algorithm"
        variant="primary"
      />
    </div>
  );
};
