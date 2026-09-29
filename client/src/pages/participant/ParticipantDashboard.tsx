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
  type IconName,
} from '../../components/ui';
import { getHealth } from '../../services';

interface JourneyStep {
  title: string;
  description: string;
  path: string;
  icon: IconName;
  status: string;
}

export const ParticipantDashboard: FC = () => {
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

  const journeySteps: JourneyStep[] = [
    {
      title: 'Registration',
      description: 'Your participant profile and track enrollment status.',
      path: '/participant/registration',
      icon: 'user',
      status: 'Pending',
    },
    {
      title: 'Team Formation',
      description: 'Create a team, invite collaborators, or join with a code.',
      path: '/participant/team',
      icon: 'users',
      status: 'Pending',
    },
    {
      title: 'Project Setup',
      description: 'Project title, description, and repository links.',
      path: '/participant/project',
      icon: 'file',
      status: 'Pending',
    },
    {
      title: 'Submission',
      description: 'Final submission to evaluation tracks before the deadline.',
      path: '/participant/submission',
      icon: 'file-text',
      status: 'Pending',
    },
    {
      title: 'Eligibility',
      description: 'Verification checks and rule compliance confirmation.',
      path: '/participant/eligibility',
      icon: 'shield',
      status: 'Pending',
    },
    {
      title: 'Results',
      description: 'Official awards and public leaderboard standings.',
      path: '/participant/results',
      icon: 'award',
      status: 'Pending',
    },
    {
      title: 'Certificate',
      description: 'Official verified participation certificate.',
      path: '/participant/certificate',
      icon: 'file',
      status: 'Pending',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Participant Dashboard"
        description="Track your end-to-end hackathon progress, milestones, and deliverables."
        badge={<Badge variant="primary" size="sm">Participant Portal</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Dogfood 2026', href: '/' },
              { label: 'Participant' },
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
              getHealth()
                .then(() => setServerOnline(true))
                .catch(() => setServerOnline(false))
                .finally(() => setIsLoading(false));
            }}
          >
            Check Connectivity
          </Button>
        }
      />

      {/* Backend Status Banner */}
      {isLoading ? (
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <CardContent style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <LoadingSpinner size="sm" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Checking local backend availability...
            </span>
          </CardContent>
        </Card>
      ) : serverOnline ? (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--status-eligible-text)',
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
            <Icon name="check-circle" size={16} style={{ color: 'var(--status-eligible-text)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Local Backend Active</span>
            <span style={{ color: 'var(--text-muted)' }}>— Participant data services awaiting session link.</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Offline Mode: Active</span>
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

      {/* Primary Status Notice: No fake data */}
      <Card style={{ marginBottom: 'var(--space-8)' }}>
        <CardHeader>
          <CardTitle>Participant Milestone Journey</CardTitle>
          <CardDescription>
            The stages of your hackathon participation from initial registration to final certification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="award"
            title="Participant data is not available yet"
            description="No active registration or team data has been received from the backend for this session. As soon as the registration API is populated by the platform services, your journey status will automatically synchronize."
          />
        </CardContent>
      </Card>

      {/* Journey Stages Grid */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          Workspace Milestones
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {journeySteps.map((step, idx) => (
          <Card key={step.title} hoverable onClick={() => navigate(step.path)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={step.icon} size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  STEP 0{idx + 1}
                </span>
                <StatusBadge status={step.status} />
              </div>
            </div>

            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)', marginBottom: 'var(--space-4)' }}>
              {step.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 500 }}>
              <span>View section</span>
              <Icon name="chevron-right" size={14} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
