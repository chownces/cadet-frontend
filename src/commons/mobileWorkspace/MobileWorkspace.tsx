import { Dialog } from '@blueprintjs/core';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import { useMediaQuery } from 'react-responsive';
import { Prompt } from 'react-router';

import Editor, { EditorProps } from '../editor/Editor';
import McqChooser, { McqChooserProps } from '../mcqChooser/McqChooser';
import Repl, { ReplProps } from '../repl/Repl';
import MobileSideContent, { MobileSideContentProps } from './mobileSideContent/MobileSideContent';

export type MobileWorkspaceProps = StateProps;

type StateProps = {
  // Either editorProps or mcqProps must be provided

  // TODO: Check what is editorProps and mcqChooserProps doing
  // ControlBar props
  editorProps?: EditorProps;
  customEditor?: JSX.Element; // NOTE: So far only used in Sourcecast and Sourcereel
  hasUnsavedChanges?: boolean; // Not used in Playground - check in the future
  mcqProps?: McqChooserProps; // Not used in Playground - check in the future
  replProps: ReplProps;
  mobileSideContentProps: MobileSideContentProps;
};

const MobileWorkspace: React.FC<MobileWorkspaceProps> = props => {
  const isIOS = /iPhone|iPod/.test(navigator.platform);

  // TODO: This is not detecting orientation change when phone text is set to LARGE (Oneplus 6T)
  // Thus callback is not called too
  // Reason: We changed the meta viewport, which somehow affected react-responsive's calculation of orientation change
  // (lines 56-60)
  const isPortrait = useMediaQuery({ orientation: 'portrait' });

  /**
   * Handle Android users' viewport height to prevent UI distortions when soft keyboard is up
   */
  React.useEffect(() => {
    // Whenever orientation changes to landscape, force the soft keyboard down first
    if (!isPortrait) {
      editorRef.current!.editor.blur();
    }

    if (isPortrait && !isIOS) {
      // TODO: The following lines causes bugs in react-responsive (unable to detect
      // orientation change in some browser dimensions)
      document.documentElement.style.setProperty('overflow', 'auto');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'height=' + window.innerHeight + 'px, width=device-width'
      );
    } else if (!isPortrait && !isIOS) {
      // Reset the above CSS when browser is in landscape
      document.documentElement.style.setProperty('overflow', 'hidden');
      const metaViewport = document.querySelector('meta[name=viewport]');
      metaViewport!.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
      );
    }
  }, [isPortrait, isIOS]);

  const editorRef = React.useRef<ReactAce>(null);

  const createWorkspaceInput = () => {
    if (props.customEditor) {
      return props.customEditor;
    } else if (props.editorProps) {
      return <Editor {...props.editorProps} ref={editorRef} />;
    } else {
      return <McqChooser {...props.mcqProps!} />;
    }
  };

  const createReplOutput = () => {
    return <Repl {...props.replProps} />;
  };

  const createEditorProps = {
    createWorkspaceInput: createWorkspaceInput,
    createReplOutput: createReplOutput
  };

  return (
    <div className="workspace">
      {props.hasUnsavedChanges ? (
        <Prompt
          message={'You have changes that may not be saved. Are you sure you want to leave?'}
        />
      ) : null}

      <Dialog
        isOpen={!isPortrait}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        isCloseButtonShown={false}
        title="Please turn back to portrait orientation!"
      />

      {/* TODO: Update CSS for mobile workspace-parent remove flex: row, overflow:hidden, etc. */}

      <MobileSideContent {...props.mobileSideContentProps} {...createEditorProps} />
    </div>
  );
};

export default MobileWorkspace;
