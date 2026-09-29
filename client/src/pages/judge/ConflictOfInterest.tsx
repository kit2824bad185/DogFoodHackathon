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
  useToast,
} from '../../components/ui';
import { getHealth } from '../../services';

export const ConflictOfInterest: FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHealth().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirmCOI = () => {
    setIsSubmitting(true);
    // Real call will go to POST /api/v1/assignments/:id/conflict when backend implements it
    getHealth()
      .then(() => {
        setIsReportModalOpen(false);
        toast.info('API Pending', 'Backend COI reporting endpoint (/api/v1/assignments/:id/conflict) is awaiting deployment.');
      })
      .catch((err) => {
        setIsReportModalOpen(false);
        toast.error('Report Failed', err.message || 'Server error.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div>
      <PageHeader
        title="Conflict of Interest (COI)"
        description="Declare affiliations, team ties, or prior knowledge to ensure fair and impartial scoring."
        badge={<Badge variant="warning" size="sm">Integrity Safeguard</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Judge Portal', href: '/judge' },
              { label: 'Conflicts / COI' },
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
              Refresh Status
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="flag"
              onClick={() => setIsReportModalOpen(true)}
            >
              Flag a Conflict
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking conflict logs from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main COI Records Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/conflicts (Pending)</Badge>}
            >
              <CardTitle>Declared Conflicts Roster</CardTitle>
              <CardDescription>
                Submissions flagged for conflict of interest and re-routed for organizer reassignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="flag"
                title="Conflict of interest information is not available yet"
                description="No conflicts of interest have been recorded for your account. If you recognize a participant, mentored a team, or contributed to a project in your assignment queue, please flag it immediately."
                action={
                  <Button
                    variant="outline"
                    leftIcon="flag"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    Report a Conflict of Interest
                  </Button>
                }
              />
            </CardContent>
          </Card>

          {/* Reassignment Protocol Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: 'var(--text-base)' }}>What Happens After Reporting a Conflict?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol
                style={{
                  paddingLeft: 'var(--space-5)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}
              >
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Immediate Queue Removal:</strong> The flagged assignment is instantly pulled from your active evaluation queue.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Organizer Reassignment:</strong> The project is transferred to the organizer review queue, where it is reassigned to an impartial judge with matching track expertise.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Immutable Audit Record:</strong> The conflict declaration and subsequent reassignment are logged to the immutable audit trail for full transparency.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog before submitting COI report */}
      <ConfirmationDialog
        isOpen={isReportModalOpen}
        onCancel={() => setIsReportModalOpen(false)}
        onConfirm={handleConfirmCOI}
        isLoading={isSubmitting}
        title="Report Conflict of Interest?"
        message="Reporting a conflict will remove the project from your scoring queue. The organizers will reassign it to an alternate judge. Do you wish to continue?"
        confirmText="Confirm Conflict"
        variant="warning"
      />
    </div>
  );
};
