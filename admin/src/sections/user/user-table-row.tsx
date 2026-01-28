import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { getCountryCode, getCountryOptionByCode } from 'src/utils/country';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  role: string;
  status: string;
  country: string;
  avatarUrl: string;
  isVerified: boolean;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: (user: UserProps) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onEditRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const normalizeDigits = (value: string) => value.replace(/\D/g, '');

  const formatPhoneNumber = (value?: string, countryCode?: string) => {
    if (!value) {
      return '-';
    }

    if (value.trim().startsWith('+')) {
      return value;
    }

    const normalizedNumber = normalizeDigits(value);
    const countryOption = getCountryOptionByCode(countryCode);
    const dialingDigits = countryOption ? normalizeDigits(countryOption.phone) : '';

    if (!dialingDigits || !normalizedNumber) {
      return value;
    }

    if (normalizedNumber.startsWith(dialingDigits)) {
      return `+${normalizedNumber}`;
    }

    return `+${dialingDigits}${normalizedNumber}`;
  };

  const countryCode = getCountryCode(row.country);
  const countryFlagSrc = countryCode
    ? `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`
    : '';
  const countryFlagSrcSet = countryCode
    ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png 2x`
    : undefined;
  const countryFlag = countryCode ? (
    <Box
      component="img"
      loading="lazy"
      width={20}
      height={14}
      alt={`${row.country} flag`}
      src={countryFlagSrc}
      srcSet={countryFlagSrcSet}
      sx={{ borderRadius: '2px', flexShrink: 0 }}
    />
  ) : null;

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEditRow(row);
  }, [handleClosePopover, onEditRow, row]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={row.name} src={row.avatarUrl} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box component="span">{row.name}</Box>
              {row.email && (
                <Box component="span" sx={{ color: 'text.secondary', typography: 'caption' }}>
                  {row.email}
                </Box>
              )}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Box component="span">{formatPhoneNumber(row.phoneNumber, row.countryCode)}</Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {countryFlag}
            <Box component="span">{row.country}</Box>
          </Box>
        </TableCell>

        <TableCell>{row.role}</TableCell>

        <TableCell align="center">
          {row.isVerified ? (
            <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          <Label color={(row.status === 'banned' && 'error') || 'success'}>{row.status}</Label>
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
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'warning.main' }}>
            <Iconify icon="solar:eye-closed-bold" />
            Ban
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
