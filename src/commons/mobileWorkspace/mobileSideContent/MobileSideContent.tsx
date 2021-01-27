import { Classes, Icon, Tab, TabId, Tabs, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import React from 'react';
import { DraggableEvent } from 'react-draggable';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { OverallState } from '../../application/ApplicationTypes';
import { SideContentTab, SideContentType } from '../../sideContent/SideContentTypes';
import { DebuggerContext, WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import { getDynamicTabs } from './../../sideContent/SideContentHelper';
import DraggableRepl from './DraggableRepl'
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

type OwnProps = {
  createWorkspaceInput: () => JSX.Element;
  createReplOutput: () => JSX.Element;
};  

// TODO: Handle resizing bug - TypeError: Cannot read property 'clientHeight' of undefined
// Workspace.tsx line 45
// To reproduce: Occasionally happens when resizing from mobile to desktop

// TODO: Discuss whether to shift this entire file into MobileWorkspace.tsx
// Pros: There's little logic going on inside MobileWorkspace.tsx currently. Separating this out is unnecessary
// Cons: File structure will differ from desktop version

// TODO: NOTE that this component relies on SideContentType
// (currently, we will not be creating a new MobileSideContentType due to high degree of overlap)

// TODO: Remove inline styles when MobileWorkspace is stable enough (try to combine with existing SCSS)

// TODO: Currently passing createWorkspaceInput and createReplOutput prop weirdly through 'OwnProps'

// styled-components
const EditorPanel = styled.div`
  width: 100vw;
  height: 100%;
  z-index: 1;
`;

const SelectedPanel = styled.div`
  height: 100%;
  padding: 10px; 
  backgroundColor: #2c3e50;
`;

const UnSelectedPanel = styled.div`
  display: none;
`;

const TabsContainer = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  background-color: #182026;
  position: fixed;
  bottom: 0;
  box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.3), 0 -10px 20px rgba(0, 0, 0, 0.2);
`;

const MobileSideContent: React.FC<MobileSideContentProps & OwnProps> = props => {
  const {
    mobileTabs,
    defaultSelectedTabId,
    selectedTabId,
    handleActiveTabChange,
    onChange
  } = props;

  // TODO: Explore idea of shifting dynamicTabs and debuggerContext up to a common parent component
  const [dynamicTabs, setDynamicTabs] = React.useState(mobileTabs);
  const [dragPosition, setDragPosition] = React.useState({x:0, y:0});

  const handleShowRepl = () => {
    setDragPosition({x: 0, y: -300});
  };

  const handleHideRepl = () => {
    setDragPosition({x: 0, y: 0});
  };

  const onDrag = (e: DraggableEvent, position: {x:number,y:number}): void => {
    setDragPosition(position);
  };
  
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

      return tab.id === selectedTabId ? (
        <SelectedPanel key={tab.id}>{tabBody}</SelectedPanel>
      ) : (
        <UnSelectedPanel key={tab.id}>{tabBody}</UnSelectedPanel>
      );
    };

    const renderEditorPanel =
      selectedTabId === SideContentType.mobileEditor || selectedTabId === SideContentType.mobileEditorRun ? (
        <EditorPanel key={'editor'}>
          {props.createWorkspaceInput()}
        </EditorPanel>
      ) : (
        <UnSelectedPanel key={'editor'}>{props.createWorkspaceInput()}</UnSelectedPanel>
      );

    // TODO: draggable here
    const renderReplPanel = (
      <DraggableRepl 
        key={'repl'}
        position={dragPosition} 
        onDrag={onDrag} 
        createReplOutput={props.createReplOutput}
      />);

    return [
      renderEditorPanel,
      ...dynamicTabs.map(tab => renderPanel(tab, props.workspaceLocation)),
      renderReplPanel 
    ];
  }, [dynamicTabs, props, selectedTabId, dragPosition]);

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
        handleShowRepl();
      } else {
        handleHideRepl();
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

  // TODO: Refactor into Playground together with createWorkspaceInput() and createReplOutput()
  const generateIcon = (icon: IconName, label: string, id: SideContentType) => (
    <Tooltip content={label}>
      <div className="side-content-tooltip" id={generateIconId(id)}>
        <Icon icon={icon} iconSize={20} />
      </div>
    </Tooltip>
  );

  // TODO: Tabs component id "mobile-side-content" is not styled yet
  return (
    <>
      {renderedPanels}
      <TabsContainer>
        <Tabs
          id="mobile-side-content"
          onChange={changeTabsCallback}
          defaultSelectedTabId={props.defaultSelectedTabId}
          renderActiveTabPanelOnly={props.renderActiveTabPanelOnly}
          selectedTabId={props.selectedTabId}
          className={Classes.DARK}
        >
          <Tab
            id={SideContentType.mobileEditor}
            title={generateIcon(IconNames.EDIT, 'EDITOR', SideContentType.mobileEditor)}
            className="side-content-tab"
          />
          {renderedTabs}
          <Tab
            id={SideContentType.mobileEditorRun}
            title={generateIcon(IconNames.PLAY, 'RUN', SideContentType.mobileEditorRun)}
            className="side-content-tab"
          />
        </Tabs>
      </TabsContainer>
    </>
  );
};

export default MobileSideContent;
