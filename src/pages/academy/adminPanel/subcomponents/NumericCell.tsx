import { NumericInput } from '@blueprintjs/core';
import React from 'react';
import { AssessmentConfiguration } from 'src/commons/assessment/AssessmentTypes';

export type IsGradedCellProps = OwnProps;

type OwnProps = {
  data: AssessmentConfiguration;
  field: AssessmentConfigNumericField;
  rowIndex: number;
  setStateHandler: (index: number, value: number) => void;
};

export enum AssessmentConfigNumericField {
  EARLY_XP = 'EARLY_XP',
  HOURS_BEFORE_DECAY = 'HOURS_BEFORE_DECAY',
  DECAY_RATE = 'DECAY_RATE'
}

const NumericCell: React.FC<IsGradedCellProps> = props => {
  const { data } = props;

  const changeHandler = React.useCallback(
    (value: number) => {
      props.setStateHandler(props.rowIndex, value);
    },
    [props]
  );

  return props.field === AssessmentConfigNumericField.EARLY_XP ? (
    <NumericInput
      value={data.earlySubmissionXp}
      min={0}
      clampValueOnBlur
      onValueChange={changeHandler}
    />
  ) : props.field === AssessmentConfigNumericField.HOURS_BEFORE_DECAY ? (
    <NumericInput
      value={data.hoursBeforeEarlyXpDecay}
      min={0}
      clampValueOnBlur
      onValueChange={changeHandler}
    />
  ) : props.field === AssessmentConfigNumericField.DECAY_RATE ? (
    <NumericInput
      value={data.decayRatePointsPerHour}
      min={0}
      clampValueOnBlur
      onValueChange={changeHandler}
    />
  ) : null;
};
export default NumericCell;
