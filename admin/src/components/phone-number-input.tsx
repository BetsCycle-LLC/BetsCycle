import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import type { SelectChangeEvent } from '@mui/material/Select';

import {
  COUNTRY_OPTIONS,
  getCountryCodeFromPhone,
  getCountryOptionByCode,
} from 'src/utils/country';

import type { CountryOption } from 'src/utils/country';

type PhoneNumberInputProps = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
};

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const buildPhoneNumber = (country: CountryOption | null, rawNumber: string) => {
  const codeDigits = country ? normalizeDigits(country.phone) : '';
  const numberDigits = normalizeDigits(rawNumber);

  if (!codeDigits && !numberDigits) {
    return '';
  }

  if (!codeDigits) {
    return numberDigits;
  }

  return `+${codeDigits}${numberDigits}`;
};

export function PhoneNumberInput({
  label = 'Phone number',
  value = '',
  onChange,
}: PhoneNumberInputProps) {
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const countryCode = useMemo(() => getCountryCodeFromPhone(value), [value]);

  useEffect(() => {
    if (!value) {
      setCountry(null);
      setPhoneNumber('');
      return;
    }

    const matchedCountry = getCountryOptionByCode(countryCode);
    const digits = normalizeDigits(value);

    if (matchedCountry) {
      const prefixDigits = normalizeDigits(matchedCountry.phone);
      const remainder = digits.startsWith(prefixDigits) ? digits.slice(prefixDigits.length) : digits;
      setCountry(matchedCountry);
      setPhoneNumber(remainder);
    } else {
      setCountry(null);
      setPhoneNumber(digits);
    }
  }, [value, countryCode]);

  const handleCountryChange = (event: SelectChangeEvent) => {
    const nextCode = event.target.value;
    const nextCountry = getCountryOptionByCode(nextCode);
    setCountry(nextCountry);
    onChange(buildPhoneNumber(nextCountry, phoneNumber));
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setPhoneNumber(nextValue);
    onChange(buildPhoneNumber(country, nextValue));
  };

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        label={label}
        value={phoneNumber}
        onChange={handleNumberChange}
        startAdornment={
          <InputAdornment position="start">
            <Select
              value={country?.code ?? ''}
              onChange={handleCountryChange}
              displayEmpty
              variant="standard"
              disableUnderline
              sx={{ minWidth: 90 }}
              renderValue={(selected) => {
                const selectedCountry = getCountryOptionByCode(selected);

                if (!selectedCountry) {
                  return '+';
                }

                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      component="img"
                      loading="lazy"
                      width="18"
                      src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    <Box component="span">+{normalizeDigits(selectedCountry.phone)}</Box>
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <Box component="span">No country</Box>
              </MenuItem>
              {COUNTRY_OPTIONS.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="img"
                      loading="lazy"
                      width="18"
                      src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    <Box component="span">{option.label}</Box>
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      +{normalizeDigits(option.phone)}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </InputAdornment>
        }
        inputProps={{ inputMode: 'tel' }}
      />
    </FormControl>
  );
}

