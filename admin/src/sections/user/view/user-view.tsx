import { useRef, useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import AvatarEditor from 'react-avatar-editor';
import { useSnackbar } from 'notistack';

import { _users } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/auth/use-auth';
import { fetchAdminPlayers, updateAdminPlayer, type AdminPlayer } from 'src/services/player-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CountrySelect } from 'src/components/country-select';

import { getCountryCode, getCountryOptionByLabel } from 'src/utils/country';

import type { CountryOption } from 'src/utils/country';

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
  const { enqueueSnackbar } = useSnackbar();

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<UserTabValue>('players');
  const [players, setPlayers] = useState<UserProps[]>([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [editUser, setEditUser] = useState<UserProps | null>(null);
  const [editValues, setEditValues] = useState<UserProps | null>(null);
  const [avatarSource, setAvatarSource] = useState<File | string | null>(null);
  const [avatarScale, setAvatarScale] = useState(1.1);
  const [avatarEdited, setAvatarEdited] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const avatarEditorRef = useRef<any>(null);

  const mockUsersWithType = useMemo(
    () =>
      _users.map((user, index) => {
        const mappedUser: UserProps = {
          id: user.id,
          name: user.name,
          role: user.role,
          status: user.status,
          country: user.company ?? '-',
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
        };

        return {
          ...mappedUser,
          userType: getUserType(mappedUser, index),
        };
      }),
    []
  );

  const mapAdminPlayerToUser = useCallback((player: AdminPlayer): UserProps => {
    const firstName = player.personalInfo?.firstName?.trim();
    const lastName = player.personalInfo?.lastName?.trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || player.username || player.email;
    const derivedCountryCode =
      player.personalInfo?.countryCode ?? getCountryCode(player.personalInfo?.country) ?? undefined;

    return {
      id: player.id,
      name,
      email: player.email,
      phoneNumber: player.personalInfo?.phoneNumber,
      countryCode: derivedCountryCode,
      country: player.personalInfo?.country ?? '-',
      role: player.playerType === 'staking' ? 'Staker' : 'Player',
      isVerified: player.verification?.emailVerified ?? false,
      avatarUrl: player.avatar ?? '',
      status: player.status ?? 'active',
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'players' || !token || playersLoaded || playersLoading) {
      return;
    }

    setPlayersLoading(true);

    fetchAdminPlayers(token, 'active')
      .then((response) => {
        const mappedPlayers: UserProps[] = response.players.map((player) =>
          mapAdminPlayerToUser(player)
        );

        setPlayers(mappedPlayers);
        setPlayersLoaded(true);
      })
      .catch(() => {
        setPlayersLoaded(true);
      })
      .finally(() => {
        setPlayersLoading(false);
      });
  }, [activeTab, mapAdminPlayerToUser, playersLoaded, playersLoading, token]);

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

  const statusOptions = useMemo(
    () => ['all', ...Array.from(new Set(usersInTab.map((user) => user.status)))],
    [usersInTab]
  );

  const dataFiltered: UserProps[] = applyFilter({
    inputData: usersInTab,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterStatus,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleOpenEdit = useCallback((user: UserProps) => {
    setEditUser(user);
    setEditValues(user);
    const nameParts = user.name.trim().split(/\s+/);
    setEditFirstName(nameParts[0] ?? '');
    setEditLastName(nameParts.slice(1).join(' '));
    setAvatarSource(user.avatarUrl || null);
    setAvatarScale(1.1);
    setAvatarEdited(false);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditUser(null);
    setEditValues(null);
    setEditFirstName('');
    setEditLastName('');
    setAvatarSource(null);
    setAvatarEdited(false);
  }, []);

  const handleEditChange = useCallback(
    (field: keyof UserProps) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEditValues((prev) => (prev ? { ...prev, [field]: value } : prev));
      },
    []
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editValues) {
      return;
    }

    if (!token) {
      enqueueSnackbar('Unable to update user. Please sign in again.', { variant: 'error' });
      return;
    }

    const fullName = [editFirstName, editLastName].filter(Boolean).join(' ').trim();
    let nextAvatar = editValues.avatarUrl;

    if (avatarSource && avatarEdited) {
      if (avatarEditorRef.current) {
        nextAvatar = avatarEditorRef.current.getImageScaledToCanvas().toDataURL('image/png');
      } else if (typeof avatarSource === 'string') {
        nextAvatar = avatarSource;
      }
    } else if (!avatarSource) {
      nextAvatar = '';
    }

    try {
      const response = await updateAdminPlayer(token, editValues.id, {
        email: editValues.email,
        avatar: nextAvatar,
        personalInfo: {
          firstName: editFirstName.trim() || undefined,
          lastName: editLastName.trim() || undefined,
          phoneNumber: editValues.phoneNumber?.trim() || undefined,
          country: editValues.country?.trim() || undefined,
          countryCode:
            editValues.countryCode ?? getCountryCode(editValues.country) ?? undefined,
        },
      });

      const updatedUser = mapAdminPlayerToUser(response.player);
      const mergedUser: UserProps = {
        ...updatedUser,
        name: fullName || updatedUser.name,
      };

      setPlayers((prev) => prev.map((user) => (user.id === mergedUser.id ? mergedUser : user)));
      handleCloseEdit();
      enqueueSnackbar('User updated successfully.', { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update user.';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [
    avatarEdited,
    avatarSource,
    editFirstName,
    editLastName,
    editValues,
    enqueueSnackbar,
    handleCloseEdit,
    mapAdminPlayerToUser,
    token,
  ]);

  const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarSource(result);
        setAvatarEdited(true);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, []);

  const handleAvatarRemove = useCallback(() => {
    setAvatarSource(null);
    setAvatarEdited(true);
    setEditValues((prev) => (prev ? { ...prev, avatarUrl: '' } : prev));
  }, []);

  const countryOption = useMemo(
    () => getCountryOptionByLabel(editValues?.country ?? null),
    [editValues?.country]
  );

  const handleCountryChange = useCallback((value: CountryOption | null) => {
    setEditValues((prev) =>
      prev
        ? { ...prev, country: value?.label ?? '', countryCode: value?.code ?? undefined }
        : prev
    );
  }, []);

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
            setFilterStatus('all');
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
          filterStatus={filterStatus}
          statusOptions={statusOptions}
          onFilterStatus={(event) => {
            setFilterStatus(event.target.value);
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
                      onEditRow={handleOpenEdit}
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

      <Dialog open={!!editUser} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {avatarSource ? (
                <AvatarEditor
                  ref={avatarEditorRef}
                  image={avatarSource}
                  width={120}
                  height={120}
                  border={12}
                  borderRadius={60}
                  color={[0, 0, 0, 0.6]}
                  scale={avatarScale}
                />
              ) : (
                <Avatar
                  src={editValues?.avatarUrl ?? ''}
                  alt={editValues?.name ?? 'User avatar'}
                  sx={{ width: 120, height: 120 }}
                />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                >
                  Upload avatar
                  <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                </Button>
                <Button
                  color="inherit"
                  variant="text"
                  onClick={handleAvatarRemove}
                  disabled={!avatarSource && !editValues?.avatarUrl}
                >
                  Remove
                </Button>
              </Box>
            </Box>
            <Box sx={{ px: 0.5 }}>
              <Slider
                value={avatarScale}
                min={1}
                max={3}
                step={0.05}
                onChange={(_, value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  setAvatarScale(next);
                  setAvatarEdited(true);
                }}
                disabled={!avatarSource}
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="First Name"
                value={editFirstName}
                onChange={(event) => setEditFirstName(event.target.value)}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={editLastName}
                onChange={(event) => setEditLastName(event.target.value)}
              />
            </Box>
            <TextField
              fullWidth
              label="Email"
              value={editValues?.email ?? ''}
              onChange={handleEditChange('email')}
            />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="Phone number"
                value={editValues?.phoneNumber ?? ''}
                onChange={handleEditChange('phoneNumber')}
              />
              <CountrySelect
                value={countryOption}
                onChange={handleCountryChange}
                label="Country"
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                fullWidth
                label="Role"
                value={editValues?.role ?? ''}
                disabled
              />
              <TextField
                fullWidth
                label="Status"
                value={editValues?.status ?? ''}
                disabled
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseEdit}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
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
