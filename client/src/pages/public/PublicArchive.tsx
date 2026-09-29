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
import { getPublicArchive, getHealth, type ArchiveRecord } from '../../services';

export const PublicArchive: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);

  const loadArchives = (isMounted: () => boolean) => {
    getPublicArchive()
      .then((data) => {
        if (!isMounted()) return;
        setArchives(data);
      })
      .catch(() => {
        getHealth().finally(() => {
          if (isMounted()) {
            setArchives([]);
            setIsLoading(false);
          }
        });
      })
      .finally(() => {
        if (isMounted()) {
          setIsLoading(false);
        }
      });
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    loadArchives(() => true);
  };

  useEffect(() => {
    let mounted = true;
    loadArchives(() => mounted);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title="Hackathon Historical Archive"
        description="Explore past hackathon editions, published winning submissions, and historical event records."
        badge={<Badge variant="neutral" size="sm">Historical Registry</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Archive' },
            ]}
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon="refresh"
            isLoading={isLoading}
            onClick={handleManualRefresh}
          >
            Refresh Archive
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
              Checking archive registry from local backend...
            </span>
          </CardContent>
        </Card>
      ) : archives.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/archive (Pending)</Badge>}
            >
              <CardTitle>Historical Editions</CardTitle>
              <CardDescription>
                Frozen datasets and records from previous hackathon seasons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="download"
                title="No archived hackathons are available yet"
                description="DogFood 2026 is the inaugural edition of the Hackathon OS platform. When the active season reaches final completion and results are preserved by organizers, historical summaries and project retrospectives will be cataloged here."
                action={
                  <Button
                    variant="outline"
                    leftIcon="arrow-left"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                }
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
              <strong>Public Access Guarantee:</strong> Historical archives never disclose internal communications, private notes, or unreleased participant records.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {archives.map((arc) => (
            <Card key={arc.id || arc.name} hoverable>
              <CardHeader
                actions={<Badge variant="neutral" size="sm">{arc.year}</Badge>}
              >
                <CardTitle>{arc.name}</CardTitle>
                {arc.winnerProject && (
                  <CardDescription>Grand Winner: {arc.winnerProject} ({arc.winningTeam})</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span>{arc.trackCount} Tracks</span>
                  <span>{arc.projectCount} Submissions</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
