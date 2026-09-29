import { useEffect, useState, type FC } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getHealth, type HealthStatus } from '../services';
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
  Icon,
} from '../components/ui';

export const Home: FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const probeHealth = (isMounted: () => boolean) => {
    getHealth()
      .then((data) => {
        if (!isMounted()) return;
        setHealth(data);
      })
      .catch((err) => {
        if (!isMounted()) return;
        setHealthError(err.message || 'Failed to connect to local backend');
        setHealth(null);
      })
      .finally(() => {
        if (isMounted()) {
          setIsLoadingHealth(false);
        }
      });
  };

  const handleManualRefresh = () => {
    setIsLoadingHealth(true);
    setHealthError(null);
    probeHealth(() => true);
  };

  useEffect(() => {
    let mounted = true;
    probeHealth(() => mounted);
    return () => {
      mounted = false;
    };
  }, []);

  const publicTracks = [
    {
      title: 'Systems & Offline Architecture',
      description: 'Air-gapped applications, local-first data sync, embedded SQLite optimizations, and deterministic computation.',
      icon: 'shield' as const,
    },
    {
      title: 'Edge & Embedded Intelligence',
      description: 'On-device machine learning, local CPU transcription, lightweight models without external API calls.',
      icon: 'settings' as const,
    },
    {
      title: 'Developer Productivity & Infrastructure',
      description: 'Local tooling, zero-dependency test frameworks, sandboxed compilers, and developer utilities.',
      icon: 'file-text' as const,
    },
    {
      title: 'Open Innovation & Campus Utilities',
      description: 'Self-hosted student services, decentralized communication, and community coordination tools.',
      icon: 'users' as const,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Hero Header */}
      <PageHeader
        title="DogFood 2026 Hackathon OS"
        description="A local-first, self-hosted hackathon operating system built for complete offline resilience, blind evaluation, and deterministic score normalization."
        badge={<StatusBadge status={health ? 'Active' : healthError ? 'Error' : 'Pending'} />}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon="refresh"
              isLoading={isLoadingHealth}
              onClick={handleManualRefresh}
            >
              System Health
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="calendar"
              onClick={() => navigate('/events')}
            >
              Explore Events
            </Button>
          </div>
        }
      />

      {/* Backend Engine Status Banner */}
      {health ? (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--color-success-600)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
            <Icon name="check-circle" size={16} style={{ color: 'var(--color-success-600)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Local API Engine Online</span>
            <span style={{ color: 'var(--text-muted)' }}>— Operating in 100% offline local loopback mode.</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            port 3000 • SQLite
          </span>
        </div>
      ) : healthError ? (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--status-ineligible-bg)',
            border: '1px solid var(--status-ineligible-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-sm)',
            color: 'var(--status-ineligible-text)',
          }}
        >
          <Icon name="alert-circle" size={16} />
          <span>Local server is disconnected. Ensure the Node.js backend is running on port 3000.</span>
        </div>
      ) : null}

      {/* Public Information Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <Card hoverable onClick={() => navigate('/events')}>
          <CardHeader actions={<Badge variant="primary" size="sm">Directory</Badge>}>
            <CardTitle style={{ fontSize: 'var(--text-base)' }}>Hackathon Events</CardTitle>
            <CardDescription>Timelines, registration deadlines, and event tracks.</CardDescription>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Browse active & upcoming events →
            </span>
          </CardContent>
        </Card>

        <Card hoverable onClick={() => navigate('/results')}>
          <CardHeader actions={<Badge variant="neutral" size="sm">Official</Badge>}>
            <CardTitle style={{ fontSize: 'var(--text-base)' }}>Results & Leaderboard</CardTitle>
            <CardDescription>Verified standings, honor awards, and normalized scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              View published results →
            </span>
          </CardContent>
        </Card>

        <Card hoverable onClick={() => navigate('/archive')}>
          <CardHeader actions={<Badge variant="neutral" size="sm">Historical</Badge>}>
            <CardTitle style={{ fontSize: 'var(--text-base)' }}>Event Archive</CardTitle>
            <CardDescription>Historical project catalog and past winners record.</CardDescription>
          </CardHeader>
          <CardContent>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              Explore historical archives →
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Tracks Section */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <CardHeader
          actions={<Badge variant="neutral">DogFood 2026</Badge>}
        >
          <CardTitle>Challenge Tracks</CardTitle>
          <CardDescription>
            Engineered tracks focusing on robust offline software, edge computing, and developer infrastructure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {publicTracks.map((trk) => (
              <div
                key={trk.title}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary-600)' }}>
                  <Icon name={trk.icon} size={18} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {trk.title}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {trk.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Portal Navigation Hub */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <CardHeader>
          <CardTitle>Authorized Portal Access</CardTitle>
          <CardDescription>
            Direct access to authenticated workspaces for hackathon participants, judging panels, and event directors.
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
            <div
              style={{
                padding: '16px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon name="user" size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Participant Portal</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                  Manage team rosters, edit project descriptions, submit deliverables, and track eligibility compliance.
                </p>
              </div>
              <Link to="/participant">
                <Button variant="outline" size="sm" style={{ width: '100%' }}>
                  Enter Participant Desk →
                </Button>
              </Link>
            </div>

            <div
              style={{
                padding: '16px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon name="award" size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Judge Portal</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                  Blind review queues, criteria scoring rubrics, conflict of interest declarations, and locked evaluations.
                </p>
              </div>
              <Link to="/judge">
                <Button variant="outline" size="sm" style={{ width: '100%' }}>
                  Enter Judge Portal →
                </Button>
              </Link>
            </div>

            <div
              style={{
                padding: '16px',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon name="shield" size={18} style={{ color: 'var(--color-primary-600)' }} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Organizer Command Center</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                  Event lifecycle state machine, judge assignments, Z-score normalization, awards, and immutable audit logs.
                </p>
              </div>
              <Link to="/organizer">
                <Button variant="outline" size="sm" style={{ width: '100%' }}>
                  Enter Command Center →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
