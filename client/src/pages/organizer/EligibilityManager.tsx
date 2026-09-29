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
  LoadingSpinner,
} from '../../components/ui';
import { getHealth } from '../../services';

export const EligibilityManager: FC = () => {
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
        description="Audit automated rule validation checks and manage manual eligibility overrides."
        badge={<Badge variant="neutral" size="sm">Compliance Control</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
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
            Refresh Rules
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent style={{ padding: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking eligibility verification status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/eligibility (Pending)</Badge>}
            >
              <CardTitle>Compliance Evaluation Queue</CardTitle>
              <CardDescription>
                Project verification status across automated checks and manual organizer approval gates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="shield"
                title="Organizer data is not available yet"
                description="No eligibility verification records have been loaded from the backend (/api/v1/eligibility). When submissions arrive, rule evaluations (Eligible, Not Eligible, Pending) and details will stream here."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
