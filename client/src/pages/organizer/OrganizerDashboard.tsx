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
  type IconName,
} from '../../components/ui';
import { getHealth } from '../../services';

interface MetricDef {
  label: string;
  category: string;
  icon: IconName;
  path: string;
}

export const OrganizerDashboard: FC = () => {
  const navigate = useNavigate();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getHealth()
      .then(() => {
        if (active) {
          setServerOnline(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setServerOnline(false);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const metricCards: MetricDef[] = [
    { label: 'Participants', category: 'Enrollment', icon: 'user', path: '/organizer/participants' },
    { label: 'Teams', category: 'Formation', icon: 'users', path: '/organizer/teams' },
    { label: 'Projects', category: 'Development', icon: 'file', path: '/organizer/projects' },
    { label: 'Eligible', category: 'Verification', icon: 'shield', path: '/organizer/eligibility' },
    { label: 'Submissions', category: 'Turn-in', icon: 'file-text', path: '/organizer/submissions' },
    { label: 'Judging Progress', category: 'Evaluation', icon: 'award', path: '/organizer/scores' },
    { label: 'COI Declarations', category: 'Integrity', icon: 'flag', path: '/organizer/coi' },
    { label: 'Pending Reviews', category: 'Assignments', icon: 'clock', path: '/organizer/assignments' },
  ];

  return (
    <div>
      <PageHeader
        title="Organizer Command Center"
        description="Comprehensive administrative control room for event operations, participant rosters, judging rubrics, and normalization."
        badge={<Badge variant="danger" size="sm">Admin Role</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Organizer Command Center' },
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
                getHealth()
                  .then(() => setServerOnline(true))
                  .catch(() => setServerOnline(false))
                  .finally(() => setIsLoading(false));
              }}
            >
              Refresh Engine
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="calendar"
              onClick={() => navigate('/organizer/event')}
            >
              Event Controls
            </Button>
          </div>
        }
      />

      {/* Backend Status Notification */}
      {isLoading ? (
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <CardContent style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="sm" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking organizer service engine status...
            </span>
          </CardContent>
        </Card>
      ) : serverOnline ? (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--status-rejected-border)',
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
            <Icon name="shield" size={16} style={{ color: 'var(--status-rejected-border)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Command Engine Connected</span>
            <span style={{ color: 'var(--text-muted)' }}>— SQLite database online; domain services awaiting migration seeding.</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>100% Offline Platform</span>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 16px',
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
          <span>Local server is currently unreachable. Make sure the Node.js API server is running on port 3000.</span>
        </div>
      )}

      {/* 8 Metric Cards: Real Pending Indicators Without Hardcoded Fake Numbers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {metricCards.map((m) => (
          <Card key={m.label} hoverable onClick={() => navigate(m.path)}>
            <CardContent style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {m.label}
                </span>
                <div style={{ color: 'var(--color-primary-600)' }}>
                  <Icon name={m.icon} size={18} />
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                —
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {m.category}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 500 }}>
                  Manage →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Empty State: Truthful Metrics Absence */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <CardHeader
          actions={<Badge variant="neutral">Status: Pending Migration</Badge>}
        >
          <CardTitle>System Telemetry & Operational Metrics</CardTitle>
          <CardDescription>
            Live rollup of active event participation, submission deadlines, and scoring throughput.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="award"
            title="Organizer metrics are not available yet"
            description="The administrative database does not currently contain active event registrations, submission records, or judge assignment batches. As domain services are populated by backend migrations and participant activity, real-time counters and evaluation percentages will stream here."
            action={
              <Button
                variant="primary"
                leftIcon="calendar"
                onClick={() => navigate('/organizer/event')}
              >
                Go to Event Configuration
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};
