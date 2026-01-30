import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Popover from '@mui/material/Popover';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

import { useSnackbar } from 'notistack';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  type AdminCurrency,
  createAdminCurrency,
  updateAdminCurrency,
  deleteAdminCurrency,
  fetchAdminCurrencies,
  type CreateAdminCurrencyPayload,
} from 'src/services/currency-api';
import { fNumber } from 'src/utils/format-number';

type CurrencyType = 'crypto' | 'fiat' | 'token';
type CurrencyStatus = 'active' | 'inactive';

type CurrencyItem = AdminCurrency;

type CurrencyTabValue = CurrencyType | 'all';

type CurrencyTableHeadLabel = {
  id: keyof CurrencyItem | '';
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  minWidth?: number;
};

const CURRENCY_TABS: Array<{ value: CurrencyTabValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'fiat', label: 'Fiat' },
  { value: 'token', label: 'Token' },
];

const TABLE_HEAD: CurrencyTableHeadLabel[] = [
  { id: '', label: 'Symbol', minWidth: 80 },
  { id: 'currencyCode', label: 'Code', minWidth: 80 },
  { id: 'currencyName', label: 'Name', minWidth: 160 },
  { id: 'currencyType', label: 'Type', minWidth: 100 },
  { id: 'withdrawalFee', label: 'Withdrawal Fee', align: 'right', minWidth: 140 },
  { id: 'depositFee', label: 'Deposit Fee', align: 'right', minWidth: 120 },
  { id: 'minDeposit', label: 'Min Deposit', align: 'right', minWidth: 120 },
  { id: 'maxWithdrawal', label: 'Max Withdrawal', align: 'right', minWidth: 140 },
  { id: 'minWithdrawal', label: 'Min Withdrawal', align: 'right', minWidth: 140 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: '', label: 'Actions', align: 'right', minWidth: 100 },
];

const TAB_LABEL_COLORS: Record<CurrencyTabValue, 'default' | 'info' | 'warning' | 'success'> = {
  all: 'default',
  crypto: 'info',
  fiat: 'warning',
  token: 'success',
};

const typeColors: Record<CurrencyType, 'default' | 'info' | 'warning' | 'success'> = {
  crypto: 'info',
  fiat: 'warning',
  token: 'success',
};

const statusColors: Record<CurrencyStatus, 'success' | 'warning'> = {
  active: 'success',
  inactive: 'warning',
};

const formatFee = (value: number) => fNumber(value, { maximumFractionDigits: 6 });
const formatAmount = (value: number) =>
  fNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type CurrencyForm = {
  currencyCode: string;
  currencyName: string;
  currencyType: CurrencyType;
  symbol: string;
  withdrawalFee: string;
  depositFee: string;
  minDeposit: string;
  maxWithdrawal: string;
  minWithdrawal: string;
  status: CurrencyStatus;
};

const defaultForm: CurrencyForm = {
  currencyCode: '',
  currencyName: '',
  currencyType: 'crypto',
  symbol: '',
  withdrawalFee: '0',
  depositFee: '0',
  minDeposit: '0',
  maxWithdrawal: '0',
  minWithdrawal: '0',
  status: 'active',
};

const CURRENCY_SYMBOL_OPTIONS = [
  {
    label: 'Bitcoin (BTC)',
    code: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
  },
  {
    label: 'Ethereum (ETH)',
    code: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  {
    label: 'Tether (USDT)',
    code: 'USDT',
    name: 'Tether',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
  },
  {
    label: 'USD Coin (USDC)',
    code: 'USDC',
    name: 'USD Coin',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  },
  {
    label: 'BNB (BNB)',
    code: 'BNB',
    name: 'BNB',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
  },
  {
    label: 'Solana (SOL)',
    code: 'SOL',
    name: 'Solana',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
  },
  {
    label: 'Cardano (ADA)',
    code: 'ADA',
    name: 'Cardano',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/cardano-ada-logo.svg',
  },
  {
    label: 'XRP (XRP)',
    code: 'XRP',
    name: 'XRP',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg',
  },
  {
    label: 'Litecoin (LTC)',
    code: 'LTC',
    name: 'Litecoin',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg',
  },
  {
    label: 'Dogecoin (DOGE)',
    code: 'DOGE',
    name: 'Dogecoin',
    type: 'crypto',
    value: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg',
  },
  {
    label: 'US Dollar (USD)',
    code: 'USD',
    name: 'US Dollar',
    type: 'fiat',
    value: 'https://flagcdn.com/us.svg',
  },
  {
    label: 'Euro (EUR)',
    code: 'EUR',
    name: 'Euro',
    type: 'fiat',
    value: 'https://flagcdn.com/eu.svg',
  },
  {
    label: 'British Pound (GBP)',
    code: 'GBP',
    name: 'British Pound',
    type: 'fiat',
    value: 'https://flagcdn.com/gb.svg',
  },
  {
    label: 'Japanese Yen (JPY)',
    code: 'JPY',
    name: 'Japanese Yen',
    type: 'fiat',
    value: 'https://flagcdn.com/jp.svg',
  },
  {
    label: 'Canadian Dollar (CAD)',
    code: 'CAD',
    name: 'Canadian Dollar',
    type: 'fiat',
    value: 'https://flagcdn.com/ca.svg',
  },
  {
    label: 'Australian Dollar (AUD)',
    code: 'AUD',
    name: 'Australian Dollar',
    type: 'fiat',
    value: 'https://flagcdn.com/au.svg',
  },
];

export function CurrencyManagementView() {
  const table = useTable();
  const { token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<CurrencyTabValue>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyItem | null>(null);
  const [formValues, setFormValues] = useState<CurrencyForm>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

  const tabCounts = useMemo(
    () => ({
      all: currencies.length,
      crypto: currencies.filter((currency) => currency.currencyType === 'crypto').length,
      fiat: currencies.filter((currency) => currency.currencyType === 'fiat').length,
      token: currencies.filter((currency) => currency.currencyType === 'token').length,
    }),
    [currencies]
  );

  const currenciesInTab = useMemo(
    () =>
      activeTab === 'all'
        ? currencies
        : currencies.filter((currency) => currency.currencyType === activeTab),
    [activeTab, currencies]
  );

  const statusOptions = useMemo(
    () => ['all', ...Array.from(new Set(currenciesInTab.map((currency) => currency.status)))],
    [currenciesInTab]
  );

  const dataFiltered = applyFilter({
    inputData: currenciesInTab,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterStatus,
  });

  const notFound = dataFiltered.length === 0 && (!!filterName || filterStatus !== 'all');

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    fetchAdminCurrencies(token)
      .then((response) => {
        setCurrencies(response.currencies);
      })
      .catch((error: Error) => {
        enqueueSnackbar(error.message || 'Failed to load currencies.', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [enqueueSnackbar, token]);

  const handleOpenCreate = () => {
    setEditingCurrency(null);
    setFormValues(defaultForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (currency: CurrencyItem) => {
    setEditingCurrency(currency);
    setFormValues({
      currencyCode: currency.currencyCode,
      currencyName: currency.currencyName,
      currencyType: currency.currencyType,
      symbol: currency.symbol,
      withdrawalFee: String(currency.withdrawalFee),
      depositFee: String(currency.depositFee),
      minDeposit: String(currency.minDeposit),
      maxWithdrawal: String(currency.maxWithdrawal),
      minWithdrawal: String(currency.minWithdrawal),
      status: currency.status,
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }
    setFormOpen(false);
  };

  const handleFormChange = (field: keyof CurrencyForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange =
    (field: keyof CurrencyForm) => (event: SelectChangeEvent<string>) => {
      const nextValue = event.target.value as CurrencyForm[typeof field];

      if (field === 'currencyType') {
        setFormValues((prev) => ({
          ...prev,
          currencyType: nextValue as CurrencyType,
          symbol: '',
          currencyCode: '',
          currencyName: '',
        }));
        return;
      }

      setFormValues((prev) => ({
        ...prev,
        [field]: nextValue,
      }));
    };

  const handleSymbolSelect = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    const selectedOption = CURRENCY_SYMBOL_OPTIONS.find((option) => option.value === selectedValue);

    if (!selectedOption) {
      setFormValues((prev) => ({
        ...prev,
        symbol: '',
        currencyCode: '',
        currencyName: '',
      }));
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      symbol: selectedOption.value,
      currencyCode: selectedOption.code,
      currencyName: selectedOption.name,
      currencyType: selectedOption.type as CurrencyType,
    }));
  };

  const symbolOptions = useMemo(
    () =>
      CURRENCY_SYMBOL_OPTIONS.filter((option) => option.type === formValues.currencyType),
    [formValues.currencyType]
  );

  const parseNumberField = (value: string, label: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`${label} must be a number.`);
    }
    return parsed;
  };

  const buildPayload = (): CreateAdminCurrencyPayload => {
    if (!formValues.currencyCode.trim()) {
      throw new Error('Currency code is required.');
    }
    if (!formValues.currencyName.trim()) {
      throw new Error('Currency name is required.');
    }
    if (!formValues.symbol.trim()) {
      throw new Error('Symbol URL is required.');
    }

    return {
      currencyCode: formValues.currencyCode.trim().toUpperCase(),
      currencyName: formValues.currencyName.trim(),
      currencyType: formValues.currencyType,
      symbol: formValues.symbol.trim(),
      withdrawalFee: parseNumberField(formValues.withdrawalFee, 'Withdrawal fee'),
      depositFee: parseNumberField(formValues.depositFee, 'Deposit fee'),
      minDeposit: parseNumberField(formValues.minDeposit, 'Min deposit'),
      maxWithdrawal: parseNumberField(formValues.maxWithdrawal, 'Max withdrawal'),
      minWithdrawal: parseNumberField(formValues.minWithdrawal, 'Min withdrawal'),
      status: formValues.status,
    };
  };

  const handleSubmitForm = async () => {
    if (!token) {
      enqueueSnackbar('You must be logged in to manage currencies.', { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayload();

      if (editingCurrency) {
        const response = await updateAdminCurrency(token, editingCurrency.id, payload);
        setCurrencies((prev) =>
          prev.map((currency) => (currency.id === response.currency.id ? response.currency : currency))
        );
        enqueueSnackbar('Currency updated.', { variant: 'success' });
      } else {
        const response = await createAdminCurrency(token, payload);
        setCurrencies((prev) => [response.currency, ...prev]);
        enqueueSnackbar('Currency created.', { variant: 'success' });
      }

      setFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save currency.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = (ids: string[], label: string) => {
    setConfirmDelete({ ids, label });
  };

  const handleCloseDelete = () => {
    if (submitting) {
      return;
    }
    setConfirmDelete(null);
  };

  const handleDelete = async () => {
    if (!token || !confirmDelete) {
      return;
    }

    try {
      setSubmitting(true);
      await Promise.all(confirmDelete.ids.map((id) => deleteAdminCurrency(token, id)));
      setCurrencies((prev) => prev.filter((currency) => !confirmDelete.ids.includes(currency.id)));
      table.onResetSelected();
      enqueueSnackbar('Currency deleted.', { variant: 'success' });
      setConfirmDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete currency.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={4}>
        <Stack
          spacing={2}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Typography variant="h4">Currency Management</Typography>
            <Typography color="text.secondary">
              Manage supported crypto, fiat, and token currencies along with fee and limit settings.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={handleOpenCreate}
          >
            Add Currency
          </Button>
        </Stack>

        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, value: CurrencyTabValue) => {
              setActiveTab(value);
              setFilterStatus('all');
              table.onResetPage();
              table.onResetSelected();
            }}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {CURRENCY_TABS.map((tab) => (
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

          <CurrencyTableToolbar
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
            onDeleteSelected={() =>
              handleConfirmDelete(table.selected, `${table.selected.length} currencies`)
            }
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 1200 }}>
                <CurrencyTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((currency) => currency.id)
                    )
                  }
                  headLabel={TABLE_HEAD}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((currency) => (
                      <CurrencyTableRow
                        key={currency.id}
                        currency={currency}
                        selected={table.selected.includes(currency.id)}
                        onSelectRow={() => table.onSelectRow(currency.id)}
                        onEditRow={() => handleOpenEdit(currency)}
                        onDeleteRow={() => handleConfirmDelete([currency.id], currency.currencyCode)}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  {notFound && <TableNoData searchQuery={filterName} />}
                  {!loading && currencies.length === 0 && !notFound && (
                    <TableNoData searchQuery="all currencies" />
                  )}
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
      </Stack>
      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>{editingCurrency ? 'Edit currency' : 'Add currency'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <FormControl fullWidth>
                <InputLabel id="currency-type-label">Currency Type</InputLabel>
                <Select
                  labelId="currency-type-label"
                  label="Currency Type"
                  value={formValues.currencyType}
                  onChange={handleSelectChange('currencyType')}
                >
                  <MenuItem value="crypto">Crypto</MenuItem>
                  <MenuItem value="fiat">Fiat</MenuItem>
                  <MenuItem value="token">Token</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="currency-status-label">Status</InputLabel>
                <Select
                  labelId="currency-status-label"
                  label="Status"
                  value={formValues.status}
                  onChange={handleSelectChange('status')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                alignItems: 'flex-end',
                gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr 1fr' },
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2">Currency Symbol</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={formValues.symbol || '/assets/icons/shape-avatar.svg'}
                    alt="Currency symbol"
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: 'contain',
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="currency-symbol-label">Symbol Image</InputLabel>
                    <Select
                      labelId="currency-symbol-label"
                      label="Symbol Image"
                      value={formValues.symbol}
                      onChange={handleSymbolSelect}
                    >
                      <MenuItem value="">
                        <em>Select image</em>
                      </MenuItem>
                      {symbolOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
              <TextField
                label="Currency Code"
                value={formValues.currencyCode}
                onChange={handleFormChange('currencyCode')}
                inputProps={{ maxLength: 10 }}
                disabled
              />
              <TextField
                label="Currency Name"
                value={formValues.currencyName}
                onChange={handleFormChange('currencyName')}
                disabled
              />
            </Box>
            <Divider sx={{ mt: 3, mb: 3 }} />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
              <TextField
                label="Withdrawal Fee"
                type="number"
                value={formValues.withdrawalFee}
                onChange={handleFormChange('withdrawalFee')}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                label="Deposit Fee"
                type="number"
                value={formValues.depositFee}
                onChange={handleFormChange('depositFee')}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                label="Min Deposit"
                type="number"
                value={formValues.minDeposit}
                onChange={handleFormChange('minDeposit')}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                label="Max Withdrawal"
                type="number"
                value={formValues.maxWithdrawal}
                onChange={handleFormChange('maxWithdrawal')}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                label="Min Withdrawal"
                type="number"
                value={formValues.minWithdrawal}
                onChange={handleFormChange('minWithdrawal')}
                inputProps={{ min: 0, step: 'any' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseForm} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitForm} disabled={submitting}>
            {editingCurrency ? 'Save Changes' : 'Create Currency'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete currency</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            {confirmDelete
              ? `Delete ${confirmDelete.label}? This action cannot be undone.`
              : 'Delete currency?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseDelete} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={submitting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

type CurrencyTableHeadProps = {
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
  headLabel: CurrencyTableHeadLabel[];
  onSelectAllRows: (checked: boolean) => void;
};

function CurrencyTableHead({
  order,
  onSort,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSelectAllRows,
}: CurrencyTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onSelectAllRows(event.target.checked)
            }
          />
        </TableCell>

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.label}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {headCell.id ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(String(headCell.id))}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

type CurrencyTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filterStatus: string;
  statusOptions: string[];
  onFilterStatus: (event: SelectChangeEvent<string>) => void;
  onDeleteSelected: () => void;
};

function CurrencyTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  filterStatus,
  statusOptions,
  onFilterStatus,
  onDeleteSelected,
}: CurrencyTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="currency-status-filter-label">Status</InputLabel>
            <Select
              labelId="currency-status-filter-label"
              value={filterStatus}
              label="Status"
              onChange={onFilterStatus}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'all' ? 'All' : status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Search currency..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{ minWidth: 280 }}
          />
        </Box>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteSelected}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

type CurrencyTableRowProps = {
  currency: CurrencyItem;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: () => void;
  onDeleteRow: () => void;
};

function CurrencyTableRow({
  currency,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: CurrencyTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEditRow();
  }, [handleClosePopover, onEditRow]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    onDeleteRow();
  }, [handleClosePopover, onDeleteRow]);

  return (
    <>
      <TableRow
        hover
        selected={selected}
        sx={{
          borderBottomStyle: 'dashed',
          borderBottomColor: 'divider',
          borderBottomWidth: 1,
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onChange={onSelectRow} />
        </TableCell>
        <TableCell>
          <Box
            component="img"
            src={currency.symbol}
            alt={`${currency.currencyName} symbol`}
            sx={{
              width: 32,
              height: 32,
              objectFit: 'contain',
            }}
          />
        </TableCell>
        <TableCell>{currency.currencyCode}</TableCell>
        <TableCell>{currency.currencyName}</TableCell>
        <TableCell>
          <Label color={typeColors[currency.currencyType]}>{currency.currencyType}</Label>
        </TableCell>
        <TableCell align="right">{formatFee(currency.withdrawalFee)}</TableCell>
        <TableCell align="right">{formatFee(currency.depositFee)}</TableCell>
        <TableCell align="right">{formatAmount(currency.minDeposit)}</TableCell>
        <TableCell align="right">{formatAmount(currency.maxWithdrawal)}</TableCell>
        <TableCell align="right">{formatAmount(currency.minWithdrawal)}</TableCell>
        <TableCell>
          <Label color={statusColors[currency.status]}>{currency.status}</Label>
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList sx={{ p: 0.5 }}>
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

function TableNoData({ searchQuery }: { searchQuery: string }) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={12}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Not found
          </Typography>
          <Typography variant="body2">
            No results found for &nbsp;
            <strong>&quot;{searchQuery}&quot;</strong>.
            <br /> Try checking for typos or using complete words.
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

function TableEmptyRows({ emptyRows: rowCount, height }: { emptyRows: number; height: number }) {
  if (!rowCount) {
    return null;
  }

  return (
    <TableRow sx={{ height: height * rowCount }}>
      <TableCell colSpan={12} />
    </TableRow>
  );
}

function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (
  a: {
    [key in Key]: number | string;
  },
  b: {
    [key in Key]: number | string;
  }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
}: {
  inputData: CurrencyItem[];
  filterName: string;
  filterStatus: string;
  comparator: (a: any, b: any) => number;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    const normalized = filterName.toLowerCase();
    inputData = inputData.filter(
      (currency) =>
        currency.currencyName.toLowerCase().includes(normalized) ||
        currency.currencyCode.toLowerCase().includes(normalized)
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((currency) => currency.status === filterStatus);
  }

  return inputData;
}

function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState<keyof CurrencyItem>('currencyCode');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id as keyof CurrencyItem);
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

