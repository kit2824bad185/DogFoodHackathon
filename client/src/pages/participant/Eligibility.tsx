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

export const Eligibility: FC = () => {
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
        title="Eligibility Verification"
        description="Verify compliance with hackathon regulations, track requirements, and automated integrity checks."
        badge={<StatusBadge status="Pending" />}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant', href: '/participant' },
              { label: 'Eligibility' },
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
              Checking eligibility status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Eligibility Card */}
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/eligibility (Pending)</Badge>}
            >
              <CardTitle>Automated & Manual Compliance Checks</CardTitle>
              <CardDescription>
                Verification results evaluated against official hackathon criteria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="shield"
                title="Eligibility information is not available yet"
                description="Compliance checks will run automatically once your project is submitted. As soon as the eligibility verification service (/api/v1/submissions/:id/eligibility) processes your submission, pass/fail status and rule details will appear here."
              />
            </CardContent>
          </Card>

          {/* Verification Protocol Notice */}
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
              <strong style={{ color: 'var(--text-primary)' }}>Eligibility Protocol:</strong> In accordance with DogFood 2026 rules, all projects must pass rule checks (such as repo completeness, offline build feasibility, and team size limits) before assignment to judges. Any warnings or required remediation steps will be surfaced directly in this panel.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
