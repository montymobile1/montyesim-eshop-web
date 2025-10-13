import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import i18n from "../../../i18n";
import "./formComponantsStyles.css";
import { excludedCountries } from "../../../core/variables/ProjectVariables";

export const FormInput = (props) => {
  const {
    variant,
    onClick,
    startAdornment,
    placeholder,
    onChange,
    helperText,
    endAdornment,
    hintMessage,
    type = "text",
  } = props;

  return (
    <TextField
      className={props.className}
      fullWidth
      type={type}
      onClick={onClick}
      value={props.value}
      placeholder={placeholder}
      variant={variant}
      onChange={(e) => onChange(e.target.value)}
      helperText={hintMessage || helperText}
      disabled={props.disabled}
      slotProps={{
        formHelperText: {
          sx: {
            textAlign: i18n.language === "ar" ? "right" : "left",
          },
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ),
          autoComplete: "new-password",
          form: {
            autoComplete: "off",
          },
          endAdornment: (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ),
        },
      }}
      size="small"
    />
  );
};

export const FormTextArea = (props) => {
  const {
    rows,
    label,
    value,
    required,
    onChange,
    helperText,
    placeholder,
    disabled,
  } = props;

  const handleOnChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      multiline
      className="text-area-field"
      rows={rows ? rows : 4}
      size="small"
      value={value}
      placeholder={placeholder}
      onChange={handleOnChange}
      helperText={helperText}
      disabled={disabled ? disabled : false}
      spellCheck="false"
      slotProps={{
        input: {
          "data-gramm": "false",
          "data-gramm_editor": "false",
          "data-enable-grammarly": "false",
          autoComplete: "off",
          form: {
            autoComplete: "off",
          },
        },
      }}
    />
  );
};

export const FormCheckBox = (props) => {
  const { onChange, disabled, helperText, label, value } = props;
  return (
    <FormControl>
      <FormGroup>
        <FormControlLabel
          sx={{
            marginRight:
              localStorage.getItem("i18nextLng") === "ar" ? 0 : undefined,
            alignItems: "flex-start",
          }}
          control={
            <Checkbox
              sx={{
                paddingRight:
                  localStorage.getItem("i18nextLng") === "ar" ? 0 : undefined,
              }}
              value={value}
              checked={value}
              disabled={disabled}
              onChange={(e, value) => onChange(value)}
              slotProps={{
                input: {
                  "aria-label": "controlled",
                },
              }}
            />
          }
          label={label}
        />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormGroup>
    </FormControl>
  );
};
export const FormRadioGroup = (props) => {
  const { data, value, onChange } = props;
  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {data?.map((el) => (
          <FormControlLabel value={el} control={<Radio />} label={el} />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
export const FormDropdownList = (props) => {
  const {
    data,
    noOptionsText,
    loading,
    onChange,
    helperText,
    accessName,
    accessValue = "id",
  } = props;
  const { placeholder, variant, disabled, required } = props;
  const { value, filterDropdown } = props;

  const [val, setVal] = useState(null);
  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      fullWidth
      disableClearable={required}
      ListboxProps={{ style: { maxHeight: 200, overflow: "auto" } }}
      getOptionLabel={(option) => option?.[accessName]}
      options={data}
      value={val}
      isOptionEqualToValue={(option, value) =>
        option?.[accessValue] == value?.[accessValue]
      }
      loadingText={"Loading"}
      noOptionsText={noOptionsText}
      loading={loading}
      onChange={(event, selected) => {
        if (!disabled) {
          onChange(selected);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant}
          placeholder={placeholder}
          helperText={helperText}
          disabled={disabled}
          InputProps={{
            ...params.InputProps,
            autocomplete: "new-password",
            form: {
              autocomplete: "off",
            },
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};
export const FormSwitch = (props) => {
  const { value, label, onChange } = props;

  return (
    <FormGroup aria-label="position" row>
      <FormControlLabel
        control={
          <Switch
            checked={value}
            color="primary"
            value={value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={label}
        labelPlacement="end"
      />
    </FormGroup>
  );
};

export const FormPhoneInput = ({
  helperText,
  value,
  onChange,
  disabled = false,
  defaultCountry = "lb",
  countries = [],
  ...props
}) => {
  const currentLang = localStorage.getItem("i18nextLng") || "en";

  return (
    <FormGroup aria-label="position" row className="w-full">
      <PhoneInput
        country={defaultCountry.toLowerCase()}
        onlyCountries={countries.map((c) => c.toLowerCase())}
        value={value}
        excludeCountries={excludedCountries}
        enableSearch={true}
        searchPlaceholder="Search countries..."
        onChange={(val, countryData) => {
          const withPlus = val && !val.startsWith("+") ? `+${val}` : val;
          onChange(withPlus, countryData);
        }}
        disabled={disabled}
        disableDropdown={disabled}
        countryCodeEditable={false}
        inputClass={`w-full !h-[45px] !rounded-[10px] border shadow-sm text-sm px-4 !focus:ring-3 focus:ring-primary focus:border-primary ${
          disabled
            ? "!bg-gray-100 !text-gray-500 !border-gray-200 !cursor-not-allowed"
            : "bg-white !border-gray-300 hover:!border-primary"
        }`}
        buttonClass={`custom-flag-dropdown ${disabled ? "flag-disabled" : ""}`}
        dropdownClass={"shadow-md rounded-md"}
        id="phone-input"
        containerClass="w-full"
        {...props}
      />
      {helperText && (
        <FormHelperText className="!text-red-500 text-xs mt-1">
          {helperText}
        </FormHelperText>
      )}
    </FormGroup>
  );
};
