import { useState, type FC, type ReactNode, type KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'line' | 'pills';
  className?: string;
}

export const Tabs: FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  variant = 'line',
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTab || (tabs.length > 0 ? tabs[0].id : '')
  );

  const activeId = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleSelect = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);

    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % enabledTabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      const targetTab = enabledTabs[nextIndex];
      handleSelect(targetTab.id);
      const targetElement = document.getElementById(`tab-${targetTab.id}`);
      targetElement?.focus();
    }
  };

  return (
    <div
      role="tablist"
      className={`ui-tabs ui-tabs-${variant} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'pills' ? 'var(--space-2)' : 'var(--space-4)',
        borderBottom: variant === 'line' ? '1px solid var(--border-default)' : 'none',
        padding: variant === 'pills' ? '4px' : '0',
        backgroundColor: variant === 'pills' ? 'var(--bg-subtle)' : 'transparent',
        borderRadius: variant === 'pills' ? 'var(--radius-lg)' : '0',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;

        const lineStyles = {
          borderBottom: isActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
          color: isActive ? 'var(--color-primary-600)' : 'var(--text-muted)',
          backgroundColor: 'transparent',
          padding: '10px 4px',
          marginBottom: '-1px',
        };

        const pillStyles = {
          backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
        };

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => handleSelect(tab.id, tab.disabled)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 500,
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              opacity: tab.disabled ? 0.4 : 1,
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              ...(variant === 'line' ? lineStyles : pillStyles),
            }}
          >
            <span>{tab.label}</span>
            {tab.badge && <span style={{ display: 'inline-flex' }}>{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
