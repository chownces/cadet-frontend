import { Classes, Icon, Tab, TabId, Tabs, Tooltip } from '@blueprintjs/core';
import React from 'react';
import { useSelector } from 'react-redux';

import { OverallState } from '../../application/ApplicationTypes';
import { SideContentTab, SideContentType } from '../../sideContent/SideContentTypes';
import { DebuggerContext, WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import { getDynamicTabs } from './../../sideContent/SideContentHelper';

export type MobileSideContentProps = DispatchProps & StateProps;

type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;

  // TODO: Check if onChange prop is optional, as it is currently optional in desktop version (it is not optional for Playground)
  onChange?: (
    newTabId: SideContentType,
    prevTabId: SideContentType,
    event: React.MouseEvent<HTMLElement>
  ) => void;

  // TODO: Ensure that all the pages currently progagate editorProps to their children, which contains this prop
  handleEditorEval: () => void;
};

type StateProps = {
  animate?: boolean;
  selectedTabId?: SideContentType;
  defaultSelectedTabId?: SideContentType;
  renderActiveTabPanelOnly?: boolean;
  mobileTabs: SideContentTab[];
  workspaceLocation?: WorkspaceLocation;
};

// TODO: Handle resizing bug - TypeError: Cannot read property 'clientHeight' of undefined
// Workspace.tsx line 45
// To reproduce: Occasionally happens when resizing from mobile to desktop

// TODO: NOTE that this component relies on SideContentType
// (currently, we will not be creating a new MobileSideContentType due to high degree of overlap)

// TODO: Remove inline styles when MobileWorkspace is stable enough (try to combine with existing SCSS)

// TODO: draw_data occasionally gives weird array output in Repl on first run. Is ok on subsequent runs. (Source 1)

// TODO: Setting editor breakpoint and running program causes app to break

// TODO: Handle Envt Visualizer overflow on mobile -> its breaking the entire mobile workspace

// TODO: Add the hiding of SideContentTab panel description paragraph as state -> so that it will be consistent
// between desktop and mobile workspaces (note that the current hiding logic breaks on iOS after orientation change)

// TODO: Handle console warning messages

const MobileSideContent: React.FC<MobileSideContentProps> = props => {
  const {
    mobileTabs,
    defaultSelectedTabId,
    selectedTabId,
    handleActiveTabChange,
    onChange
  } = props;

  // TODO: Explore idea of shifting dynamicTabs and debuggerContext up to a common parent component
  const [dynamicTabs, setDynamicTabs] = React.useState(mobileTabs);

  React.useEffect(() => {
    // Set initial sideContentActiveTab for this workspace
    handleActiveTabChange(defaultSelectedTabId ? defaultSelectedTabId : mobileTabs[0].id!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch debuggerContext from store
  const debuggerContext = useSelector(
    (state: OverallState) =>
      props.workspaceLocation && state.workspaces[props.workspaceLocation].debuggerContext
  );

  React.useEffect(() => {
    // TODO: This concatenation may potentially result in mobile 'Run' tab not being the right most tab
    const allActiveTabs = mobileTabs.concat(
      getDynamicTabs(debuggerContext || ({} as DebuggerContext))
    );
    setDynamicTabs(allActiveTabs);
  }, [mobileTabs, debuggerContext]);

  /**
   * Generates an icon id given a TabId.
   * Used to set and remove the 'side-content-tab-alert' style to the tabs.
   */
  const generateIconId = (tabId: TabId) => `${tabId}-icon`;

  const renderedPanels = React.useMemo(() => {
    // TODO: Fix the styling of all the panels (e.g. subst_visualizer, inspector, etc.)
    const renderPanel = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      const tabBody: JSX.Element = workspaceLocation
        ? {
            ...tab.body,
            props: {
              ...tab.body.props,
              workspaceLocation
            }
          }
        : tab.body;

      // TODO: Style the wrapping div
      // TODO: Do something about this conditional spaghetti
      return tab.id === selectedTabId ? (
        selectedTabId === SideContentType.mobileEditor ? (
          tabBody
        ) : selectedTabId === SideContentType.mobileEditorRun ? (
          <div style={{ marginLeft: '0.5rem', marginTop: '0.5rem', height: '100%' }}>{tabBody}</div>
        ) : (
          <div style={{ height: '100%', padding: '10px', backgroundColor: '#2c3e50' }}>
            {tabBody}
          </div>
        )
      ) : (
        <div style={{ display: 'none' }}>{tabBody}</div>
      );
    };

    return dynamicTabs.map(tab => renderPanel(tab, props.workspaceLocation));
  }, [dynamicTabs, props, selectedTabId]);

  const renderedTabs = React.useMemo(() => {
    const renderTab = (tab: SideContentTab, workspaceLocation?: WorkspaceLocation) => {
      const iconSize = 20;
      const tabId = tab.id === undefined ? tab.label : tab.id;
      const tabTitle: JSX.Element = (
        <Tooltip content={tab.label}>
          <div className="side-content-tooltip" id={generateIconId(tabId)}>
            <Icon icon={tab.iconName} iconSize={iconSize} />
          </div>
        </Tooltip>
      );

      return (
        <Tab
          key={tabId}
          id={tabId}
          title={tabTitle}
          disabled={tab.disabled}
          className="side-content-tab"
        />
      );
    };

    return dynamicTabs.map(tab => renderTab(tab, props.workspaceLocation));
  }, [dynamicTabs, props.workspaceLocation]);

  const changeTabsCallback = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ): void => {
      /**
       * Remove the 'side-content-tab-alert' class that causes tabs flash.
       * To be run when tabs are changed.
       * Currently this style is only used for the "Inspector" and "Env Visualizer" tabs.
       */
      const resetAlert = (prevTabId: TabId) => {
        const iconId = generateIconId(prevTabId);
        const icon = document.getElementById(iconId);

        // The new selected tab will still have the "side-content-tab-alert" class, but the CSS hides it
        if (icon) {
          icon.classList.remove('side-content-tab-alert');
        }
      };

      // TODO: Added this next line specifically for evaluating program upon pressing the run tab on mobile
      if (newTabId === SideContentType.mobileEditorRun) {
        props.handleEditorEval();
      }

      handleActiveTabChange(newTabId);
      if (onChange === undefined) {
        resetAlert(prevTabId);
      } else {
        onChange(newTabId, prevTabId, event); // this updates selected tab in Playground
        resetAlert(prevTabId);
      }
    },
    [handleActiveTabChange, onChange, props]
  );

  // TODO: Tabs component id "mobile-side-content" is not styled yet
  return (
    <>
      {renderedPanels}
      <div
        style={{
          height: '60px', // 80px
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Tabs
          id="mobile-side-content"
          onChange={changeTabsCallback}
          defaultSelectedTabId={props.defaultSelectedTabId}
          renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
          selectedTabId={props.selectedTabId}
          className={Classes.DARK}
        >
          {renderedTabs}
        </Tabs>
      </div>
    </>
  );
};

export default MobileSideContent;
