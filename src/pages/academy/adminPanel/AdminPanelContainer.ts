import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  deleteUserCourseRegistration,
  fetchAdminPanelCourseRegistrations,
  fetchAssessmentConfigs,
  fetchCourseConfig,
  updateAssessmentConfigs,
  updateCourseConfig,
  updateUserRole
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import AdminPanel, { DispatchProps, StateProps } from './AdminPanel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  crId: state.session.crId,
  courseName: state.session.courseName,
  courseShortName: state.session.courseShortName,
  viewable: state.session.viewable,
  enableGame: state.session.enableGame,
  enableAchievements: state.session.enableAchievements,
  enableSourcecast: state.session.enableSourcecast,
  sourceChapter: state.session.sourceChapter,
  sourceVariant: state.session.sourceVariant,
  moduleHelpText: state.session.moduleHelpText,
  assessmentTypes: state.session.assessmentTypes,
  assessmentConfigurations: state.session.assessmentConfigurations,
  userCourseRegistrations: state.session.userCourseRegistrations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchCourseConfiguration: fetchCourseConfig,
      handleFetchAssessmentConfigs: fetchAssessmentConfigs,
      handleFetchUserCourseRegistrations: fetchAdminPanelCourseRegistrations,
      handleUpdateCourseConfig: updateCourseConfig,
      handleUpdateAssessmentConfigs: updateAssessmentConfigs,
      handleUpdateUserRole: updateUserRole,
      handleDeleteUserFromCourse: deleteUserCourseRegistration
    },
    dispatch
  );

const AdminPanelContainer = connect(mapStateToProps, mapDispatchToProps)(AdminPanel);

export default AdminPanelContainer;
