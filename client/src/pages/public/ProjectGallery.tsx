import { useState, useEffect, useMemo, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Input,
  Select,
  Pagination,
} from '../../components/ui';
import { getPublicProjects, getHealth, type Project } from '../../services';

export const ProjectGallery: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const eventIdentifier = slug || 'event';

  useEffect(() => {
    let mounted = true;

    getPublicProjects(eventIdentifier)
      .then((data) => {
        if (!mounted) return;
        setProjects(data);
      })
      .catch(() => {
        getHealth().finally(() => {
          if (mounted) {
            setProjects([]);
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
  }, [eventIdentifier]);

  // Derived filter tracks
  const trackOptions = useMemo(() => {
    const tracks = new Set<string>();
    projects.forEach((p) => {
      if (p.track) tracks.add(p.track);
    });
    return [
      { label: 'All Tracks', value: 'all' },
      ...Array.from(tracks).map((t) => ({ label: t, value: t })),
    ];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrack = selectedTrack === 'all' || p.track === selectedTrack;
      return matchesSearch && matchesTrack;
    });
  }, [projects, searchQuery, selectedTrack]);

  // Paginated view
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title="Public Project Gallery"
        description={`Showcase of submissions for ${eventIdentifier}. Discover team creations across challenge tracks.`}
        badge={<Badge variant="primary" size="sm">Public Showcase</Badge>}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              { label: eventIdentifier, href: `/events/${eventIdentifier}` },
              { label: 'Project Gallery' },
            ]}
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon="arrow-left"
            onClick={() => navigate(`/events/${eventIdentifier}`)}
          >
            Back to Event
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
              Loading public project showcase...
            </span>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardHeader
            actions={<Badge variant="neutral">Service: /api/v1/events/:slug/projects (Pending)</Badge>}
          >
            <CardTitle>Project Directory</CardTitle>
            <CardDescription>
              Publicly disclosed projects submitted during the hackathon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon="file"
              title="No public projects have been published yet"
              description="Submissions for this event are either still in progress, undergoing blind judging rounds, or awaiting public release by event organizers. Once results are published, project showcases will appear here."
              action={
                <Button
                  variant="outline"
                  leftIcon="arrow-left"
                  onClick={() => navigate(`/events/${eventIdentifier}`)}
                >
                  Return to Event Details
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Controls: Search and Filter */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: '1 1 280px', maxWidth: '400px' }}>
              <Input
                placeholder="Search projects by title or keywords..."
                leftIcon="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            {trackOptions.length > 1 && (
              <div style={{ width: '200px' }}>
                <Select
                  options={trackOptions}
                  value={selectedTrack}
                  onChange={(e) => {
                    setSelectedTrack(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No projects match your search criteria.
                </span>
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
              {paginatedProjects.map((p) => (
                <Card
                  key={p.id}
                  hoverable
                  onClick={() => navigate(`/events/${eventIdentifier}/projects/${p.id}`)}
                >
                  <CardHeader
                    actions={<Badge variant="neutral" size="sm">{p.track}</Badge>}
                  >
                    <CardTitle>{p.title}</CardTitle>
                    {p.teamName && (
                      <CardDescription>By {p.teamName}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: 'var(--space-4)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        View Project →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProjects.length > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredProjects.length / itemsPerPage)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
