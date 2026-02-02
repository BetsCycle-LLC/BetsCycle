import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import InputAdornment from '@mui/material/InputAdornment';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';

import { useSnackbar } from 'notistack';

import { useAuth } from 'src/auth/use-auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import {
  fetchAdminLoyaltyTiers,
  createAdminLoyaltyTier,
  updateAdminLoyaltyTier,
  deleteAdminLoyaltyTier,
  type LoyaltyTier,
  type TierLevel,
  type CreateLoyaltyTierPayload,
} from 'src/services/loyalty-api';
import { fetchAdminCurrencies, type AdminCurrency } from 'src/services/currency-api';

type TierForm = {
  tiersName: string;
  icon: string;
  iconFile: File | null;
  order: string;
  levels: Array<{
    levelNumber: number;
    xp: string;
    faucetInterval: string;
    weeklyRakeback: string;
    monthlyRakeback: string;
    levelUpBonus: Array<{
      currencyId: string;
      amount: string;
    }>;
  }>;
};

const defaultForm: TierForm = {
  tiersName: '',
  icon: '',
  iconFile: null,
  order: '0',
  levels: [],
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const getImageUrl = (iconPath: string) => {
  if (!iconPath) return '';
  // If it's already a full URL, return as is
  if (iconPath.startsWith('http')) return iconPath;
  // If it starts with /uploads, prepend API base URL
  if (iconPath.startsWith('/uploads')) {
    return `${API_BASE_URL}${iconPath}`;
  }
  // Otherwise return as is
  return iconPath;
};

export function LoyaltyClubManagementView() {
  const { token } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [formValues, setFormValues] = useState<TierForm>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([fetchAdminLoyaltyTiers(token), fetchAdminCurrencies(token)])
      .then(([tiersResponse, currenciesResponse]) => {
        setTiers(tiersResponse.tiers);
        setCurrencies(currenciesResponse.currencies.filter((c) => c.status === 'active'));
      })
      .catch((error: Error) => {
        enqueueSnackbar(error.message || 'Failed to load data.', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [enqueueSnackbar, token]);

  const handleOpenCreate = () => {
    setEditingTier(null);
    // Create one default level
    const defaultLevel = {
      levelNumber: 1,
      xp: '0',
      faucetInterval: '0',
      weeklyRakeback: '0',
      monthlyRakeback: '0',
      levelUpBonus: currencies.map((currency) => ({
        currencyId: currency.id,
        amount: '0',
      })),
    };
    setFormValues({
      ...defaultForm,
      levels: [defaultLevel],
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (tier: LoyaltyTier) => {
    setEditingTier(tier);

    const levels = tier.levels.map((level) => {
      const bonusMap = new Map(level.levelUpBonus.map((b) => [b.currencyId, b.amount]));
      const allBonuses = currencies.map((currency) => ({
        currencyId: currency.id,
        amount: String(bonusMap.get(currency.id) ?? 0),
      }));

      return {
        levelNumber: level.levelNumber,
        xp: String(level.xp),
        faucetInterval: String(level.faucetInterval ?? 0),
        weeklyRakeback: String(level.weeklyRakeback),
        monthlyRakeback: String(level.monthlyRakeback),
        levelUpBonus: allBonuses,
      };
    });

    setFormValues({
      tiersName: tier.tiersName,
      icon: tier.icon,
      iconFile: null,
      order: String(tier.order),
      levels,
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }
    setFormOpen(false);
  };

  const handleFormChange = (field: keyof Omit<TierForm, 'levels'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormValues((prev) => ({
        ...prev,
        iconFile: file,
        icon: URL.createObjectURL(file),
      }));
    }
  };

  const handleAddLevel = () => {
    const newLevelNumber = formValues.levels.length + 1;
    setFormValues((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          levelNumber: newLevelNumber,
          xp: '0',
          faucetInterval: '0',
          weeklyRakeback: '0',
          monthlyRakeback: '0',
          levelUpBonus: currencies.map((currency) => ({
            currencyId: currency.id,
            amount: '0',
          })),
        },
      ],
    }));
  };

  const handleRemoveLevel = (levelIndex: number) => {
    setFormValues((prev) => ({
      ...prev,
      levels: prev.levels
        .filter((_, idx) => idx !== levelIndex)
        .map((level, idx) => ({
          ...level,
          levelNumber: idx + 1,
        })),
    }));
  };

  const handleLevelFieldChange =
    (levelIndex: number, field: 'xp' | 'faucetInterval' | 'weeklyRakeback' | 'monthlyRakeback') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({
        ...prev,
        levels: prev.levels.map((level, idx) =>
          idx === levelIndex ? { ...level, [field]: event.target.value } : level
        ),
      }));
    };

  const handleBonusAmountChange =
    (levelIndex: number, currencyId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({
        ...prev,
        levels: prev.levels.map((level, idx) =>
          idx === levelIndex
            ? {
                ...level,
                levelUpBonus: level.levelUpBonus.map((bonus) =>
                  bonus.currencyId === currencyId
                    ? { ...bonus, amount: event.target.value }
                    : bonus
                ),
              }
            : level
        ),
      }));
    };

  const parseNumberField = (value: string, label: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`${label} must be a number.`);
    }
    return parsed;
  };

  const buildPayload = (): CreateLoyaltyTierPayload => {
    if (!formValues.tiersName.trim()) {
      throw new Error('Tier name is required.');
    }

    if (formValues.levels.length === 0) {
      throw new Error('At least one level is required.');
    }

    const levels: TierLevel[] = formValues.levels.map((level) => ({
      levelNumber: level.levelNumber,
      xp: parseNumberField(level.xp, 'XP'),
      faucetInterval: parseNumberField(level.faucetInterval, 'Faucet interval'),
      weeklyRakeback: parseNumberField(level.weeklyRakeback, 'Weekly rakeback'),
      monthlyRakeback: parseNumberField(level.monthlyRakeback, 'Monthly rakeback'),
      levelUpBonus: level.levelUpBonus
        .map((bonus) => ({
          currencyId: bonus.currencyId,
          amount: parseNumberField(bonus.amount, 'Bonus amount'),
        }))
        .filter((bonus) => bonus.amount > 0),
    }));

    return {
      tiersName: formValues.tiersName.trim(),
      icon: formValues.icon,
      order: parseNumberField(formValues.order, 'Order'),
      levels,
    };
  };

  const handleSubmitForm = async () => {
    if (!token) {
      enqueueSnackbar('You must be logged in to manage tiers.', { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayload();

      if (editingTier) {
        const response = await updateAdminLoyaltyTier(
          token,
          editingTier.id,
          payload,
          formValues.iconFile ?? undefined
        );
        setTiers((prev) =>
          prev.map((tier) => (tier.id === response.tier.id ? response.tier : tier))
        );
        enqueueSnackbar('Tier updated.', { variant: 'success' });
      } else {
        const response = await createAdminLoyaltyTier(
          token,
          payload,
          formValues.iconFile ?? undefined
        );
        setTiers((prev) => [...prev, response.tier]);
        enqueueSnackbar('Tier created.', { variant: 'success' });
      }

      setFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save tier.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = (id: string, label: string) => {
    setConfirmDelete({ id, label });
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
      await deleteAdminLoyaltyTier(token, confirmDelete.id);
      setTiers((prev) => prev.filter((tier) => tier.id !== confirmDelete.id));
      enqueueSnackbar('Tier deleted.', { variant: 'success' });
      setConfirmDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete tier.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const sortedTiers = useMemo(() => [...tiers].sort((a, b) => a.order - b.order), [tiers]);

  const currencyMap = useMemo(
    () => new Map(currencies.map((c) => [c.id, c])),
    [currencies]
  );

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
            <Typography variant="h4">Loyalty Club Management</Typography>
            <Typography color="text.secondary">
              Manage loyalty tiers, levels, and rewards for your loyalty program.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={handleOpenCreate}
          >
            Add Tier
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        ) : sortedTiers.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No Tiers Found
                </Typography>
                <Typography color="text.secondary">
                  Create your first loyalty tier to get started.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
           <Grid container spacing={3}>
            {sortedTiers.map((tier) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tier.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  {/* Three-dot Menu */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      zIndex: 1,
                    }}
                  >
                    <IconButton size="small">
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {/* Tier Header */}
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            bgcolor: 'background.neutral',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {tier.icon ? (
                            <Box
                              component="img"
                              src={getImageUrl(tier.icon)}
                              alt={tier.tiersName}
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Iconify
                              icon="solar:shield-keyhole-bold-duotone"
                              width={32}
                              sx={{ color: 'text.secondary' }}
                            />
                          )}
                        </Box>

                        {/* Title and Meta */}
                        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight="600" noWrap>
                            {tier.tiersName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Posted: {new Date(tier.createdAt).toLocaleDateString()}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Iconify icon="solar:settings-bold-duotone" width={16} color="success.main" />
                            <Typography variant="caption" color="success.main" fontWeight="600">
                              {tier.levels.length} {tier.levels.length === 1 ? 'Level' : 'Levels'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      {/* Info Grid */}
                      <Stack spacing={2}>
                        {/* First Row */}
                        <Stack direction="row" spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                            <Iconify icon="solar:cart-3-bold" width={16} sx={{ color: 'text.secondary' }} />
                            <Stack spacing={0}>
                              <Typography variant="caption" color="text.secondary">
                                Max XP
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {tier.levels[tier.levels.length - 1]?.xp.toLocaleString() ?? 0}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                            <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'text.secondary' }} />
                            <Stack spacing={0}>
                              <Typography variant="caption" color="text.secondary">
                                Tier Order
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                #{tier.order + 1}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>

                        {/* Second Row */}
                        <Stack direction="row" spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                            <Iconify icon="solar:wallet-bold" width={16} sx={{ color: 'text.secondary' }} />
                            <Stack spacing={0}>
                              <Typography variant="caption" color="text.secondary">
                                Weekly Rakeback
                              </Typography>
                              <Typography variant="body2" fontWeight="500" color="primary.main">
                                Up to {Math.max(...tier.levels.map(l => l.weeklyRakeback))}%
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                            <Iconify icon="solar:share-bold" width={16} sx={{ color: 'text.secondary' }} />
                            <Stack spacing={0}>
                              <Typography variant="caption" color="text.secondary">
                                Monthly Rakeback
                              </Typography>
                              <Typography variant="body2" fontWeight="500" color="success.main">
                                Up to {Math.max(...tier.levels.map(l => l.monthlyRakeback))}%
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Iconify icon="solar:pen-bold" width={16} />}
                          onClick={() => handleOpenEdit(tier)}
                        >
                          Edit
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
                          onClick={() => handleConfirmDelete(tier.id, tier.tiersName)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Add/Edit Modal */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
              }}
            >
              <Iconify icon="solar:shield-keyhole-bold-duotone" width={28} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {editingTier ? 'Edit Loyalty Tier' : 'Create New Tier'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure tier details, levels, and rewards
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Stack spacing={4}>
            {/* Basic Information */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:check-circle-bold" width={24} color="primary.main" />
                  <Typography variant="h6" fontWeight="bold">
                    Basic Information
                  </Typography>
                </Stack>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      label="Tier Name"
                      value={formValues.tiersName}
                      onChange={handleFormChange('tiersName')}
                      placeholder="e.g., Iron, Bronze, Silver, Gold, Platinum"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="solar:shield-keyhole-bold-duotone" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Tier Order"
                      type="number"
                      value={formValues.order}
                      onChange={handleFormChange('order')}
                      inputProps={{ min: 0, step: 1 }}
                      helperText="Lower numbers appear first"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tier Icon
                      </Typography>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Paper
                          elevation={2}
                          sx={{
                            width: 100,
                            height: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: 2,
                            border: '2px dashed',
                            borderColor: formValues.icon ? 'primary.main' : 'divider',
                            bgcolor: formValues.icon ? 'primary.lighter' : 'background.neutral',
                          }}
                        >
                        {formValues.icon ? (
                          <Box
                            component="img"
                            src={formValues.iconFile ? formValues.icon : getImageUrl(formValues.icon)}
                            alt="Tier icon"
                            sx={{
                              width: '80%',
                              height: '80%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                            <Iconify
                              icon="solar:pen-bold"
                              width={40}
                              sx={{ color: 'text.disabled' }}
                            />
                          )}
                        </Paper>
                        <Stack spacing={1.5}>
                          <Button
                            variant="contained"
                            component="label"
                            startIcon={<Iconify icon="solar:pen-bold" />}
                          >
                            {formValues.icon ? 'Change Icon' : 'Upload Icon'}
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleIconFileChange}
                            />
                          </Button>
                          {formValues.icon && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() =>
                                setFormValues((prev) => ({ ...prev, icon: '', iconFile: null }))
                              }
                              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            >
                              Remove Icon
                            </Button>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Recommended: 256x256px, PNG or SVG
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            {/* Levels */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:settings-bold-duotone" width={24} color="primary.main" />
                    <Typography variant="h6" fontWeight="bold">
                      Levels Configuration
                    </Typography>
                    <Chip
                      label={`${formValues.levels.length} ${formValues.levels.length === 1 ? 'Level' : 'Levels'}`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Iconify icon="solar:pen-bold" />}
                    onClick={handleAddLevel}
                  >
                    Add Level
                  </Button>
                </Stack>

                {formValues.levels.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                      borderRadius: 2,
                    }}
                  >
                    <Iconify
                      icon="solar:settings-bold-duotone"
                      width={64}
                      sx={{ color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No Levels Added Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click &quot;Add Level&quot; to create your first level
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {formValues.levels.map((level, levelIndex) => (
                      <Accordion
                        key={levelIndex}
                        defaultExpanded={levelIndex === 0}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '12px !important',
                          '&:before': { display: 'none' },
                          boxShadow: 'none',
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<Iconify icon="solar:eye-bold" />}
                          sx={{
                            minHeight: 64,
                            px: 2.5,
                            '&.Mui-expanded': {
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ width: '100%', pr: 2 }}
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {level.levelNumber}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Level {level.levelNumber}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {Number(level.xp) > 0
                                    ? `${Number(level.xp).toLocaleString()} XP Required`
                                    : 'Set XP requirement'}
                                </Typography>
                              </Box>
                            </Stack>
                            {formValues.levels.length > 1 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveLevel(levelIndex);
                                }}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'error.lighter',
                                  },
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                              </IconButton>
                            )}
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 3 }}>
                          <Stack spacing={3}>
                            {/* XP Required */}
                            <TextField
                              fullWidth
                              label="Experience Points (XP) Required"
                              type="number"
                              value={level.xp}
                              onChange={handleLevelFieldChange(levelIndex, 'xp')}
                              inputProps={{ min: 0, step: 1 }}
                              helperText="Amount of XP players need to reach this level"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="solar:share-bold" color="warning.main" />
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Faucet Interval"
                              type="number"
                              value={level.faucetInterval}
                              onChange={handleLevelFieldChange(levelIndex, 'faucetInterval')}
                              inputProps={{ min: 0, step: 1 }}
                              helperText="Minutes between faucet claims for this level"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="solar:clock-circle-outline" color="info.main" />
                                  </InputAdornment>
                                ),
                                endAdornment: <InputAdornment position="end">min</InputAdornment>,
                              }}
                            />

                            <Divider />

                            {/* Rakeback */}
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Rakeback Percentages
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label="Weekly Rakeback"
                                    type="number"
                                    value={level.weeklyRakeback}
                                    onChange={handleLevelFieldChange(levelIndex, 'weeklyRakeback')}
                                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">%</InputAdornment>
                                      ),
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Iconify icon="solar:clock-circle-outline" color="primary.main" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label="Monthly Rakeback"
                                    type="number"
                                    value={level.monthlyRakeback}
                                    onChange={handleLevelFieldChange(levelIndex, 'monthlyRakeback')}
                                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">%</InputAdornment>
                                      ),
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <Iconify icon="solar:clock-circle-outline" color="success.main" />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Box>

                            <Divider />

                            {/* Bonuses */}
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Iconify icon="solar:cart-3-bold" width={20} color="warning.main" />
                                <Typography variant="subtitle2">
                                  Level Up Bonus Rewards
                                </Typography>
                              </Stack>
                              {currencies.length === 0 ? (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    bgcolor: 'warning.lighter',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2" color="warning.darker">
                                    No active currencies available. Please add currencies first.
                                  </Typography>
                                </Paper>
                              ) : (
                                <Grid container spacing={2}>
                                  {currencies.map((currency) => {
                                    const bonus = level.levelUpBonus.find(
                                      (b) => b.currencyId === currency.id
                                    );
                                    return (
                                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={currency.id}>
                                        <TextField
                                          fullWidth
                                          label={currency.currencyCode}
                                          type="number"
                                          value={bonus?.amount ?? '0'}
                                          onChange={handleBonusAmountChange(levelIndex, currency.id)}
                                          inputProps={{ min: 0, step: 'any' }}
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <Box
                                                  component="img"
                                                  src={currency.symbol}
                                                  alt={currency.currencyCode}
                                                  sx={{
                                                    width: 24,
                                                    height: 24,
                                                    objectFit: 'contain',
                                                  }}
                                                />
                                              </InputAdornment>
                                            ),
                                          }}
                                        />
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                              )}
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1.5,
          }}
        >
          <Button
            size="large"
            color="inherit"
            onClick={handleCloseForm}
            disabled={submitting}
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            variant="contained"
            onClick={handleSubmitForm}
            disabled={submitting}
            startIcon={
              editingTier ? (
                <Iconify icon="solar:check-circle-bold" />
              ) : (
                <Iconify icon="solar:pen-bold" />
              )
            }
            sx={{ minWidth: 160 }}
          >
            {editingTier ? 'Save Changes' : 'Create Tier'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={handleCloseDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete Tier</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            {confirmDelete
              ? `Delete ${confirmDelete.label}? This action cannot be undone.`
              : 'Delete tier?'}
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
