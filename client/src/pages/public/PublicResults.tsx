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
import { getPublicResults, getHealth, type PublicResultsResponse } from '../../services';

export const PublicResults: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [resultsData, setResultsData] = useState<PublicResultsResponse | null>(null);

  const loadResults = (isMounted: () => boolean) => {
    getPublicResults()
      .then((data) => {
        if (!isMounted()) return;
        if (data?.isPublished) {
          setResultsData(data);
        } else {
          setResultsData(null);
        }
      })
      .catch(() => {
        // Fallback health check
        getHealth().finally(() => {
          if (isMounted()) {
            setResultsData(null);
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
    loadResults(() => true);
  };

  useEffect(() => {
    let mounted = true;
    loadResults(() => mounted);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title="Public Hackathon Results & Standings"
        description="Official leaderboard, prize allocations, and category winners confirmed by event organizers."
        badge={<Badge variant="primary" size="sm">Official Standings</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
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
            onClick={handleManualRefresh}
          >
            Refresh Standings
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
              Checking publication status from local backend...
            </span>
          </CardContent>
        </Card>
      ) : !resultsData || !resultsData.isPublished || !resultsData.standings || resultsData.standings.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Status: Unpublished</Badge>}
            >
              <CardTitle>Official Leaderboard & Honors</CardTitle>
              <CardDescription>
                Standings derived from normalized scores and organizer review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="award"
                title="Results have not been published yet"
                description="Evaluation rounds and score normalization are either still actively underway or undergoing organizer certification. Official standings will appear here immediately once organizers formally publish results."
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
              <strong>Fair Play Protection:</strong> Raw scoring distributions, individual judge identities, and interim draft rankings are never exposed in public leaderboards.
            </span>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader
            actions={
              <Badge variant="success" size="sm">
                Published {resultsData.publishedAt ? new Date(resultsData.publishedAt).toLocaleDateString() : ''}
              </Badge>
            }
          >
            <CardTitle>{resultsData.eventName || 'Official Standings'}</CardTitle>
            <CardDescription>Final placements awarded across challenge tracks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-default)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 16px' }}>Rank</th>
                    <th style={{ padding: '12px 16px' }}>Project</th>
                    <th style={{ padding: '12px 16px' }}>Team</th>
                    <th style={{ padding: '12px 16px' }}>Track</th>
                    <th style={{ padding: '12px 16px' }}>Award</th>
                    {resultsData.standings[0]?.finalScore !== undefined && (
                      <th style={{ padding: '12px 16px' }}>Final Score</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {resultsData.standings.map((st) => (
                    <tr
                      key={st.projectName + st.rank}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: st.rank <= 3 ? 'var(--bg-subtle)' : undefined,
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        {st.rank === 1 ? '🥇 1st' : st.rank === 2 ? '🥈 2nd' : st.rank === 3 ? '🥉 3rd' : `#${st.rank}`}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {st.projectName}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {st.teamName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant="neutral" size="sm">{st.track}</Badge>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {st.award ? (
                          <Badge variant="success" size="sm">{st.award}</Badge>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      {st.finalScore !== undefined && (
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          {st.finalScore.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
