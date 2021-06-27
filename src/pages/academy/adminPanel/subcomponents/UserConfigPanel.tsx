import { H2 } from '@blueprintjs/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AdminPanelCourseRegistration } from 'src/commons/application/types/SessionTypes';

import DeleteUserCell from './DeleteUserCell';
import RolesCell from './RolesCell';

export type UserConfigPanelProps = OwnProps;

type OwnProps = {
  crId?: number;
  userCourseRegistrations?: AdminPanelCourseRegistration[];
  handleUpdateUserRole: (crId: number, role: Role) => void;
  handleDeleteUserFromCourse: (crId: number) => void;
};

/**
 * Only admins can access this panel.
 * - Admins cannot be deleted
 * - An admin cannot downgrade himself to a non-admin role (only
 *   other admins can do so, to prevent a scenario where there are
 *   no admins left in a course)
 */
const UserConfigPanel: React.FC<UserConfigPanelProps> = props => {
  const gridApi = React.useRef<GridApi>();

  const userCourseRegistrations = props.userCourseRegistrations?.map(e => {
    if (!e.name) {
      return {
        ...e,
        name: '(user has yet to log in)'
      };
    }
    return e;
  });

  const columnDefs = [
    {
      headerName: 'Name',
      field: 'name',
      sort: 'asc'
    },
    {
      headerName: 'Username',
      field: 'username'
    },
    {
      headerName: 'Role',
      field: 'role',
      cellRendererFramework: RolesCell,
      cellRendererParams: {
        crId: props.crId,
        handleUpdateUserRole: props.handleUpdateUserRole
      },
      width: 110
    },
    {
      headerName: 'Delete User',
      field: 'deleteRow',
      cellRendererFramework: DeleteUserCell,
      cellRendererParams: {
        handleDeleteUserFromCourse: props.handleDeleteUserFromCourse
      },
      width: 120,
      filter: false,
      resizable: false
    }
  ];

  const defaultColumnDefs = {
    filter: true,
    resizable: true,
    sortable: true
  };

  const onGridReady = (params: GridReadyEvent) => {
    gridApi.current = params.api;
  };

  const grid = (
    <div className="Grid ag-grid-parent ag-theme-balham">
      <AgGridReact
        domLayout={'autoHeight'}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDefs}
        onGridReady={onGridReady}
        onGridSizeChanged={() => gridApi.current?.sizeColumnsToFit()}
        rowData={userCourseRegistrations}
        rowHeight={36}
        suppressCellSelection={true}
        suppressMovableColumns={true}
        suppressPaginationPanel={true}
      />
    </div>
  );

  return (
    <div>
      <H2>Users</H2>
      {grid}
    </div>
  );
};

export default UserConfigPanel;
