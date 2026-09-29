import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const JudgeDashboard: FC = () => {
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

  return (
    <div>
      <PageHeader
        title="Judge Dashboard"
        description="Command center for assigned project reviews, rubric scoring, and evaluation progress."
        badge={<Badge variant="info" size="sm">Blind Evaluation Active</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Judge Portal' },
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
              Check System
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="file-text"
              onClick={() => navigate('/judge/assignments')}
            >
              Assigned Projects
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
              Checking judge service availability from local backend...
            </span>
          </CardContent>
        </Card>
      ) : serverOnline ? (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--color-primary-600)',
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
            <Icon name="shield" size={16} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Local Evaluation Engine Connected</span>
            <span style={{ color: 'var(--text-muted)' }}>— Assignment matrix awaiting organizer distribution.</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>100% Offline Mode</span>
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

      {/* Metrics Row: Truthful Pending States Without Hardcoded Fake Numbers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <Card>
          <CardContent style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Assigned
              </span>
              <div style={{ color: 'var(--color-primary-600)' }}>
                <Icon name="file-text" size={18} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              —
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Awaiting backend distribution
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                In Progress
              </span>
              <div style={{ color: 'var(--status-pending-text)' }}>
                <Icon name="clock" size={18} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              —
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Draft scores saved
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Completed
              </span>
              <div style={{ color: 'var(--status-eligible-text)' }}>
                <Icon name="check-circle" size={18} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              —
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Finalized & locked
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Conflicts / COI
              </span>
              <div style={{ color: 'var(--status-conflict-text)' }}>
                <Icon name="flag" size={18} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              —
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Flagged affiliations
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Empty State Notice */}
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        <CardHeader
          actions={<StatusBadge status="Pending" />}
        >
          <CardTitle>Evaluation Queue</CardTitle>
          <CardDescription>
            Submissions assigned to your judge profile for criteria evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="award"
            title="Judge assignment data is not available yet"
            description="No submissions have been assigned to your evaluation queue by the organizers. Once submission eligibility is verified and assignments are published by the backend (/api/v1/judges/me/assignments), your project review queue will appear here."
            action={
              <Button
                variant="primary"
                leftIcon="file-text"
                onClick={() => navigate('/judge/assignments')}
              >
                Go to Assigned Projects
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Blind Evaluation Security Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: 'var(--text-base)' }}>Judging Protocol & Privacy Safeguards</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div style={{ color: 'var(--color-primary-600)', marginTop: '2px' }}>
              <Icon name="shield" size={20} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Integrity Enforcement:</strong> Under DogFood 2026 Hackathon OS guidelines, judge assignments use strict blind evaluation. You will only see the projects explicitly assigned to your queue. Scores, feedback, and notes from other judges are completely masked to prevent peer anchoring bias and protect mathematical normalization.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
