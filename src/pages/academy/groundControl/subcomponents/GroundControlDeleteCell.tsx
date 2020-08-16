import { Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import controlButton from '../../../../commons/ControlButton';

export type DeleteCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeleteAssessment: (id: number) => void;
};

type StateProps = {
  data: AssessmentOverview;
};

const DeleteCell: React.FunctionComponent<DeleteCellProps> = props => {
  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);

  const handleOpenDialog = React.useCallback(() => setDialogState(true), []);
  const handleCloseDialog = React.useCallback(() => setDialogState(false), []);

  const { handleDeleteAssessment, data } = props;

  const handleDelete = React.useCallback(() => {
    const { id } = data;
    handleDeleteAssessment(id);
    handleCloseDialog();
  }, [data, handleCloseDialog, handleDeleteAssessment]);

  return (
    <>
      {controlButton('', IconNames.TRASH, handleOpenDialog)}
      <Dialog
        icon={IconNames.WARNING_SIGN}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Deleting assessment"
        canOutsideClickClose={true}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>
            Are you sure you want to <b>delete</b> the assessment <i>{data.title}</i>?
          </p>
          <p>
            <b>All submissions and their answers will be deleted as well.</b>
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {controlButton('Cancel', IconNames.CROSS, handleCloseDialog, { minimal: false })}
            {controlButton('Confirm', IconNames.TRASH, handleDelete, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteCell;
