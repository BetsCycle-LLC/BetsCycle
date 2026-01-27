import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/auth/use-auth';
import { fetchAdminPlayers } from 'src/services/player-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

type UserTabValue = 'players' | 'affiliates' | 'stakers' | 'banned';

const USER_TABS: Array<{ value: UserTabValue; label: string }> = [
  { value: 'players', label: 'Players' },
  { value: 'affiliates', label: 'Affiliate Partners' },
  { value: 'stakers', label: 'Stakers' },
  { value: 'banned', label: 'Banned Users' },
];

const TAB_LABEL_COLORS: Record<UserTabValue, 'default' | 'info' | 'success' | 'warning' | 'error'> =
  {
    players: 'info',
    affiliates: 'warning',
    stakers: 'success',
    banned: 'error',
  };

const getUserType = (user: UserProps, index: number): UserTabValue => {
  if (user.status === 'banned') {
    return 'banned';
  }

  const cycle: UserTabValue[] = ['players', 'affiliates', 'stakers'];
  return cycle[index % cycle.length];
};

export function UserView() {
  const table = useTable();
  const { token } = useAuth();

  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState<UserTabValue>('players');
  const [players, setPlayers] = useState<UserProps[]>([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);

  const mockUsersWithType = useMemo(
    () =>
      _users.map((user, index) => ({
        ...user,
        userType: getUserType(user, index),
      })),
    []
  );

  useEffect(() => {
    if (activeTab !== 'players' || !token || playersLoaded || playersLoading) {
      return;
    }

    setPlayersLoading(true);

    fetchAdminPlayers(token, 'active')
      .then((response) => {
        const mappedPlayers: UserProps[] = response.players.map((player) => {
          const firstName = player.personalInfo?.firstName?.trim();
          const lastName = player.personalInfo?.lastName?.trim();
          const name =
            [firstName, lastName].filter(Boolean).join(' ') || player.username || player.email;

          return {
            id: player.id,
            name,
            email: player.email,
            phoneNumber: player.personalInfo?.phoneNumber,
            country: player.personalInfo?.country ?? '-',
            role: player.playerType === 'staking' ? 'Staker' : 'Player',
            isVerified: player.verification?.emailVerified ?? false,
            avatarUrl: player.avatar ?? '',
            status: player.status ?? 'active',
          };
        });

        setPlayers(mappedPlayers);
        setPlayersLoaded(true);
      })
      .catch(() => {
        setPlayersLoaded(true);
      })
      .finally(() => {
        setPlayersLoading(false);
      });
  }, [activeTab, token, playersLoaded, playersLoading]);

  const usersInTab = useMemo(
    () =>
      activeTab === 'players'
        ? players
        : mockUsersWithType.filter((user) => user.userType === activeTab),
    [mockUsersWithType, activeTab, players]
  );

  const tabCounts = useMemo(
    () =>
      USER_TABS.reduce(
        (acc, tab) => {
          acc[tab.value] =
            tab.value === 'players'
              ? players.length
              : mockUsersWithType.filter((user) => user.userType === tab.value).length;
          return acc;
        },
        {} as Record<UserTabValue, number>
      ),
    [mockUsersWithType, players]
  );

  const roleOptions = useMemo(
    () => ['all', ...Array.from(new Set(usersInTab.map((user) => user.role)))],
    [usersInTab]
  );

  const dataFiltered: UserProps[] = applyFilter({
    inputData: usersInTab,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterRole,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          All Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Add user
        </Button>
      </Box>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, value: UserTabValue) => {
            setActiveTab(value);
            setFilterRole('all');
            table.onResetPage();
            table.onResetSelected();
          }}
          sx={{ px: 2, bgcolor: 'background.neutral' }}
        >
          {USER_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
                  <Box component="span">{tab.label}</Box>
                  <Label color={TAB_LABEL_COLORS[tab.value]} variant="soft">
                    {tabCounts[tab.value] ?? 0}
                  </Label>
                </Box>
              }
            />
          ))}
        </Tabs>

        <Divider />

        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          filterRole={filterRole}
          roleOptions={roleOptions}
          onFilterRole={(event) => {
            setFilterRole(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'phoneNumber', label: 'Phone number' },
                  { id: 'country', label: 'Country' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Verified', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onResetSelected = useCallback(() => {
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    onResetSelected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
