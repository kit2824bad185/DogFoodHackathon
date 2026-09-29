import type { FC, ReactNode } from 'react';
import { PageHeader, Card, CardContent, EmptyState, Breadcrumb, Button } from '../components/ui';
import type { IconName } from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

export interface PortalPlaceholderProps {
  title: string;
  description: string;
  portalName: string;
  portalHomeUrl: string;
  icon?: IconName;
  badge?: ReactNode;
  breadcrumbs?: { label: ReactNode; href?: string }[];
}

export const PortalPlaceholder: FC<PortalPlaceholderProps> = ({
  title,
  description,
  portalName,
  portalHomeUrl,
  icon = 'file-text',
  badge,
  breadcrumbs,
}) => {
  const navigate = useNavigate();

  const defaultBreadcrumbs = breadcrumbs || [
    { label: 'Dogfood 2026', href: '/' },
    { label: portalName, href: portalHomeUrl },
    { label: title },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        badge={badge}
        breadcrumbs={<Breadcrumb items={defaultBreadcrumbs} />}
      />

      <Card>
        <CardContent style={{ padding: 'var(--space-6)' }}>
          <EmptyState
            icon={icon}
            title={`${title} Module`}
            description={`${description} This view is scaffolded with the production layout and navigation foundation. Full domain workflows will be activated in the respective implementation phases.`}
            action={
              <Button
                variant="outline"
                leftIcon="arrow-left"
                onClick={() => navigate(portalHomeUrl)}
              >
                Return to {portalName}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};
