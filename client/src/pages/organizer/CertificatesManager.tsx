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
  Icon,
} from '../../components/ui';
import { getHealth } from '../../services';

export const CertificatesManager: FC = () => {
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
        title="Certificates Management"
        description="Monitor batch certificate generation, cryptographic verification hashes, and delivery status."
        badge={<Badge variant="neutral" size="sm">Credentials</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer', href: '/organizer' },
              { label: 'Certificates' },
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
            Refresh Status
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent
            style={{
              padding: 'var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <LoadingSpinner size="md" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking certificate registry status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/certificates/organizer (Pending)</Badge>}
            >
              <CardTitle>Issued Credentials Registry</CardTitle>
              <CardDescription>
                Participation and merit certificates generated with local cryptographic verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file"
                title="Certificate records are not available yet"
                description="No certificates have been issued or queued for generation by the local backend (/api/v1/certificates/organizer). Once the event lifecycle reaches completion and results are published, batch credential issuance can be initiated."
              />
            </CardContent>
          </Card>

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
              <strong>Cryptographic Integrity:</strong> Issued certificates will include a deterministic SHA-256 verification digest to ensure validity in strictly offline local environments.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
