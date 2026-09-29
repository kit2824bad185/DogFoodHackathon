import { useState, useEffect, type FC } from 'react';
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
  Icon,
} from '../../components/ui';
import { getPublicProjectDetail, getHealth, type Project } from '../../services';

export const ProjectDetail: FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const eventIdentifier = slug || 'event';
  const projectIdentifier = id || 'project';

  useEffect(() => {
    let mounted = true;

    getPublicProjectDetail(eventIdentifier, projectIdentifier)
      .then((data) => {
        if (!mounted) return;
        setProject(data || null);
      })
      .catch(() => {
        getHealth().finally(() => {
          if (mounted) {
            setProject(null);
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
  }, [eventIdentifier, projectIdentifier]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <PageHeader
        title={project?.title || `Project #${projectIdentifier}`}
        description={project?.description ? 'Public project specifications and demonstration resources.' : 'Public showcase details.'}
        badge={project?.track ? <Badge variant="primary" size="sm">{project.track}</Badge> : undefined}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' },
              { label: eventIdentifier, href: `/events/${eventIdentifier}` },
              { label: 'Gallery', href: `/events/${eventIdentifier}/projects` },
              { label: project?.title || projectIdentifier },
            ]}
          />
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon="arrow-left"
            onClick={() => navigate(`/events/${eventIdentifier}/projects`)}
          >
            Gallery
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
              Loading public project details...
            </span>
          </CardContent>
        </Card>
      ) : !project ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader
              actions={<Badge variant="neutral">Status: Unpublished</Badge>}
            >
              <CardTitle>Project Profile</CardTitle>
              <CardDescription>
                Public project deliverable and overview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon="file"
                title="Project record is not available yet"
                description={`Project ID "${projectIdentifier}" could not be retrieved from the backend (/api/v1/events/${eventIdentifier}/projects/${projectIdentifier}). If this project is currently in draft or under blind review, details remain restricted until organizers publish final results.`}
                action={
                  <Button
                    variant="outline"
                    leftIcon="arrow-left"
                    onClick={() => navigate(`/events/${eventIdentifier}/projects`)}
                  >
                    Back to Gallery
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
              <strong>Blind Review Protection:</strong> Evaluator notes, criteria ratings, and raw judge scores are strictly hidden from public views to protect judging integrity.
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              {project.teamName && (
                <CardDescription>Developed by team <strong>{project.teamName}</strong></CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {project.description}
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="neutral" size="sm">{tech}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demonstration & Repository Links */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Resources</CardTitle>
              <CardDescription>Public links provided by the team for evaluation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {project.repoUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="file-text" size={16} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Source Code Repository</span>
                    </div>
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', textDecoration: 'underline' }}
                    >
                      {project.repoUrl}
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    No public repository link disclosed.
                  </div>
                )}

                {project.demoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="external-link" size={16} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Local Demo Server</span>
                    </div>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', textDecoration: 'underline' }}
                    >
                      {project.demoUrl}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
