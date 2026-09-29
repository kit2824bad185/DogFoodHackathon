import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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

export const AssignmentDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHealth().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    // When backend endpoint POST /api/v1/assignments/:id/scores is available, call it here
    getHealth()
      .then(() => {
        setIsSubmitModalOpen(false);
        toast.info('API Pending', 'Backend score submission endpoint (/api/v1/assignments/:id/scores) is awaiting deployment.');
      })
      .catch((err) => {
        setIsSubmitModalOpen(false);
        toast.error('Submission Failed', err.message || 'Server unreachable.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <PageHeader
        title={`Assignment Evaluation #${id || ''}`}
        description="Blind rubric evaluation workspace for assigned project submission."
        badge={<Badge variant="info" size="sm">Blind Evaluation</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Judge Portal', href: '/judge' },
              { label: 'Assigned Projects', href: '/judge/assignments' },
              { label: `Assignment #${id || ''}` },
            ]}
          />
        }
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon="arrow-left"
              onClick={() => navigate('/judge/assignments')}
            >
              Back to Queue
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="flag"
              onClick={() => navigate('/judge/conflicts')}
            >
              Report Conflict
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Loading assignment details from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Assignment Notice Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/assignments/:id (Pending)</Badge>}
            >
              <CardTitle>Project Assignment Details</CardTitle>
              <CardDescription>
                Project submission metadata provided to judges for criteria evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file-text"
                title="Judge assignment data is not available yet"
                description={`Assignment #${id} is not currently populated by the local backend. Once organizers generate and publish assignments (/api/v1/assignments/${id}), the project brief, repository references, and rubric scoring criteria will load here.`}
                action={
                  <Button
                    variant="outline"
                    leftIcon="arrow-left"
                    onClick={() => navigate('/judge/assignments')}
                  >
                    Return to Assignment List
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Scoring Protocol & Rubric Architecture Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rubric Scoring Protocol</CardTitle>
              <CardDescription>
                Mathematical integrity rules governing criteria scoring and locking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Granular Criterion Scoring
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
                    Each criterion defines a weighted scale. Scores are validated strictly against the minimum/maximum bounds specified by the backend rubric.
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Draft vs. Final Locking
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
                    Draft scores can be saved and revised iteratively. Final score submission permanently locks the evaluation to preserve judging auditability.
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Z-Score Normalization
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>
                    Raw scores are fed into a statistical normalization engine to balance harsh vs. lenient grading. Individual raw scores are never displayed publicly.
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  onClick={() => toast.info('Draft Scoring', 'Draft saving will activate once the backend rubric is loaded.')}
                >
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  Submit Final Score
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Privacy Box */}
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
              <strong>Blind Review Protection:</strong> Scores and comments submitted on this assignment remain strictly confidential to your account until normalized results are finalized.
            </span>
          </div>
        </div>
      )}

      {/* Final Submission Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleFinalSubmit}
        isLoading={isSubmitting}
        title="Submit Final Evaluation?"
        message="Are you sure you want to finalize this score? Once submitted, the backend permanently locks this assignment to preserve judging audit integrity."
        confirmText="Confirm & Lock Score"
        variant="primary"
      />
    </div>
  );
};
