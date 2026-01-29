import type { BoxProps } from '@mui/material/Box';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchCurrencies, type Currency } from 'src/services/currency-api';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CurrencyType = 'crypto' | 'fiat' | 'token';

const CURRENCY_TYPE_LABELS: Record<CurrencyType, string> = {
  crypto: 'Crypto',
  fiat: 'Fiat',
  token: 'Token',
};

export function BalancePopover({ sx, ...other }: BoxProps) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<CurrencyType>('crypto');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: CurrencyType) => {
    setActiveTab(newValue);
  }, []);

  const handleSelectCurrency = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
  }, []);

  // Fetch currencies on mount and auto-select first crypto currency
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCurrencies()
      .then((response) => {
        setCurrencies(response.currencies);
        // Auto-select first crypto currency
        if (response.currencies.length > 0) {
          const firstCryptoCurrency = response.currencies.find(
            (currency) => currency.currencyType === 'crypto'
          );
          setSelectedCurrency(firstCryptoCurrency || response.currencies[0]);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load currencies');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Run only once on mount

  const filteredCurrencies = currencies.filter(
    (currency) => currency.currencyType === activeTab
  );

  const currentBalance = 0; // TODO: Replace with actual balance calculation for selected currency

  return (
    <>
      <Box
        onClick={handleOpenPopover}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderRadius: 1,
          cursor: 'pointer',
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
          '&:hover': {
            backgroundColor: (theme) => theme.vars.palette.action.hover,
            borderColor: (theme) => theme.vars.palette.primary.main,
          },
          ...sx,
        }}
        {...other}
      >
        {selectedCurrency && (
          <Avatar
            sx={{
              bgcolor: (theme) => theme.vars.palette.background.neutral,
              width: 32,
              height: 32,
            }}
          >
            <Box
              component="img"
              src={selectedCurrency.symbol}
              alt={selectedCurrency.currencyCode}
              sx={{
                width: 22,
                height: 22,
                objectFit: 'contain',
              }}
            />
          </Avatar>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: 100 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
            {selectedCurrency ? selectedCurrency.currencyCode : 'Balance'}
          </Typography>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
            {currentBalance}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            ml: 0.5,
            color: 'text.secondary',
            transition: (theme) => theme.transitions.create(['transform', 'color']),
            transform: openPopover ? 'rotate(180deg)' : 'rotate(0deg)',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
        </IconButton>
        <Button
          size="small"
          variant="contained"
          color="primary"
          sx={{ minWidth: 'auto', px: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Handle deposit action
          }}
        >
          Deposit
        </Button>
      </Box>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 400, maxHeight: 500 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">My Balances</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            View your currency balances
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              minHeight: 48,
            },
          }}
        >
          {(['crypto', 'fiat', 'token'] as CurrencyType[]).map((type) => (
            <Tab
              key={type}
              label={CURRENCY_TYPE_LABELS[type]}
              value={type}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            px: 2,
            py: 2,
            minHeight: 200,
            maxHeight: 300,
            overflow: 'auto',
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {!loading && !error && filteredCurrencies.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No {CURRENCY_TYPE_LABELS[activeTab].toLowerCase()} currencies available
              </Typography>
            </Box>
          )}

          {!loading && !error && filteredCurrencies.length > 0 && (
            <List disablePadding>
              {filteredCurrencies.map((currency) => {
                const isSelected = selectedCurrency?.id === currency.id;
                return (
                  <ListItem
                    key={currency.id}
                    onClick={() => handleSelectCurrency(currency)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      transition: (theme) => theme.transitions.create(['background-color']),
                      backgroundColor: isSelected
                        ? (theme) => theme.vars.palette.action.selected
                        : 'transparent',
                      // border: (theme) => `1px solid ${
                      //   isSelected ? theme.vars.palette.primary.main : theme.vars.palette.divider
                      // }`,
                      '&:hover': {
                        backgroundColor: (theme) =>
                          isSelected
                            ? theme.vars.palette.action.selected
                            : theme.vars.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: (theme) => theme.vars.palette.background.neutral,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Box
                          component="img"
                          src={currency.symbol}
                          alt={currency.currencyCode}
                          sx={{
                            width: 28,
                            height: 28,
                            objectFit: 'contain',
                          }}
                        />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{currency.currencyName}</Typography>
                          <Chip
                            label={currency.currencyCode}
                            size="small"
                            color={isSelected ? 'primary' : 'default'}
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      // secondary={
                      //   <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      //     {currency.currencyType.charAt(0).toUpperCase() + currency.currencyType.slice(1)}
                      //   </Typography>
                      // }
                    />
                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography variant="subtitle2">
                        0
                      </Typography>
                      {/* <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {currency.currencyCode}
                      </Typography> */}
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, pt: 1, borderTop: (theme) => `1px solid ${theme.vars.palette.divider}` }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              // TODO: Handle deposit action
              handleClosePopover();
            }}
          >
            Deposit Funds
          </Button>
        </Box>
      </Popover>
    </>
  );
}

