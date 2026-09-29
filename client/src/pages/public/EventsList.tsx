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
import { getEvents, getHealth, type HackathonEvent } from '../../services';

export const EventsList: FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  const loadEvents = (isMounted: () => boolean) => {
    getEvents()
      .then((data) => {
        if (!isMounted()) return;
        setServerOnline(true);
        setEvents(data);
      })
      .catch(() => {
        // Fallback probe to /health to discern server state
        getHealth()
          .then(() => {
            if (!isMounted()) return;
            setServerOnline(true);
            setEvents([]);
          })
          .catch(() => {
            if (!isMounted()) return;
            setServerOnline(false);
            setEvents([]);
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
    loadEvents(() => true);
  };

  useEffect(() => {
    let mounted = true;
    loadEvents(() => mounted);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title="Public Hackathon Events"
        description="Browse active, upcoming, and completed hackathons hosted on the DogFood OS platform."
        badge={<Badge variant="primary" size="sm">Public Directory</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events' },
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
            Refresh Events
          </Button>
        }
      />

      {/* Connectivity & Offline Banner */}
      {serverOnline === false && (
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
          <span>Local API server is currently unreachable. Make sure the Node.js backend is running on port 3000.</span>
        </div>
      )}

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
              Loading public hackathon events...
            </span>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader
            actions={<Badge variant="neutral">Status: Offline SQLite</Badge>}
          >
            <CardTitle>Active & Upcoming Events</CardTitle>
            <CardDescription>
              Public event schedules, registration deadlines, and challenge track rosters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="calendar"
              title="Public events are not available yet"
              description="No public events are currently active or published by the local backend (/api/v1/events). Once organizers publish an event, its schedule, tracks, and submission links will appear here."
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
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {events.map((evt) => (
            <Card key={evt.id || evt.slug} hoverable onClick={() => navigate(`/events/${evt.slug || evt.id}`)}>
              <CardHeader
                actions={<Badge variant="success" size="sm">{evt.status || 'Active'}</Badge>}
              >
                <CardTitle>{evt.name}</CardTitle>
                <CardDescription>{evt.description || 'Public university hackathon.'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Registration:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{evt.registrationStatus || 'Open'}</strong>
                  </div>
                  {evt.trackCount !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Challenge Tracks:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{evt.trackCount} Tracks</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Timeline:</span>
                    <span>{evt.startDate || 'TBA'} ➔ {evt.endDate || 'TBA'}</span>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                    View Event Details →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
