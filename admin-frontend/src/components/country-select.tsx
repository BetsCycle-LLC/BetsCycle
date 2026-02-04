import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import type { AutocompleteProps } from '@mui/material/Autocomplete';

import { COUNTRY_OPTIONS } from 'src/utils/country';

import type { CountryOption } from 'src/utils/country';

type CountrySelectProps = {
  label?: string;
  value: CountryOption | null;
  onChange: (value: CountryOption | null) => void;
  slotProps?: AutocompleteProps<CountryOption, false, false, false>['slotProps'];
};

export function CountrySelect({ label = 'Country', value, onChange, slotProps }: CountrySelectProps) {
  return (
    <Autocomplete
      autoHighlight
      options={COUNTRY_OPTIONS}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      slotProps={slotProps}
      renderOption={(props, option) => (
        <Box component="li" sx={{ display: 'flex', alignItems: 'center' }} {...props}>
          <Box
            component="img"
            loading="lazy"
            width="20"
            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
            alt=""
            sx={{ mr: 1 }}
          />
          {option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {value ? (
                  <Box
                    component="img"
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${value.code.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${value.code.toLowerCase()}.png 2x`}
                    alt=""
                    sx={{ mr: 1, borderRadius: '2px' }}
                  />
                ) : null}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

