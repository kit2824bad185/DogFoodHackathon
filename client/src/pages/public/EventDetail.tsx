import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { getEventBySlugOrId, getHealth, type HackathonEvent } from '../../services';

export const EventDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [event, setEvent] = useState<HackathonEvent | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!slug) {
      return () => {
        mounted = false;
      };
    }

    getEventBySlugOrId(slug)
      .then((data) => {
        if (!mounted) return;
        setEvent(data || null);
      })
      .catch(() => {
        // Fallback: check general health
        getHealth().finally(() => {
          if (mounted) {
            setEvent(null);
            setIsLoading(false);
          }
        });
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const eventIdentifier = slug || 'event';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title={event?.name || `Event: ${eventIdentifier}`}
        description={event?.description || 'Public event overview, challenge tracks, and submission schedule.'}
        badge={
          <Badge variant={event?.status === 'Published' ? 'success' : 'neutral'} size="sm">
            {event?.status || 'Public Portal'}
          </Badge>
        }
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              { label: event?.name || eventIdentifier },
            ]}
          />
        }
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon="file"
              onClick={() => navigate(`/events/${eventIdentifier}/projects`)}
            >
              Project Gallery
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon="user"
              onClick={() => navigate('/participant')}
            >
              Participant Portal
            </Button>
          </div>
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
              Loading event details from local backend...
            </span>
          </CardContent>
        </Card>
      ) : !event ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Service: /api/v1/events/:slug (Pending)</Badge>}
            >
              <CardTitle>Event Specification</CardTitle>
              <CardDescription>
                Public timetable, tracks, and official rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="calendar"
                title="Event details are not available yet"
                description={`No public event record was found for identifier "${eventIdentifier}" from the local backend (/api/v1/events/${eventIdentifier}). Once the event is created and seeded in SQLite, public schedules and challenge tracks will stream here.`}
                action={
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button
                      variant="outline"
                      leftIcon="arrow-left"
                      onClick={() => navigate('/events')}
                    >
                      All Events
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon="file"
                      onClick={() => navigate(`/events/${eventIdentifier}/projects`)}
                    >
                      View Projects
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Privacy Guarantee Note */}
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
              <strong>Public Access Mode:</strong> This view discloses only public event guidelines and active challenge tracks. Confidential judge assignments, scores, and unannounced results are strictly concealed.
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Key Dates Card */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Timelines</CardTitle>
              <CardDescription>Critical milestones for registrations and project deliverables.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Start Date</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{event.startDate || 'TBA'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>End Date</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{event.endDate || 'TBA'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Registration Deadline</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{event.registrationDeadline || 'TBA'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Submission Cutoff</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{event.submissionDeadline || 'TBA'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracks Section */}
          {event.tracks && event.tracks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Challenge Tracks</CardTitle>
                <CardDescription>Select a focus area for your hackathon submission.</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
                  {event.tracks.map((trk) => (
                    <div
                      key={trk.id}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{trk.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{trk.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation to Public Gallery */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Public Project Gallery</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Explore projects created for this event.</div>
            </div>
            <Link to={`/events/${eventIdentifier}/projects`}>
              <Button variant="outline" size="sm" rightIcon="arrow-right">
                Explore Gallery
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
