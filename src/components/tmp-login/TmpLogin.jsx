import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { userLimitedLogin } from "../../core/apis/authAPI";
import { LimitedSignIn } from "../../redux/reducers/authReducer";
import {
  FormCheckBox,
  FormInput,
  FormPhoneInput,
} from "../shared/form-components/FormComponents";

const TmpLogin = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const { login_type, otp_channel } = useSelector((state) => state.currency);
  const schema = ({ t }) =>
    yup.object().shape({
      phone: yup
        .string()
        .label("Phone number")
        .nullable()
        .when("$signinType", {
          is: (val) => login_type === "phone",
          then: (schema) => schema.required(t("auth.phoneRequired")),
          otherwise: (schema) => schema.notRequired(),
        })
        .test("is-valid-phone", t("auth.invalidPhoneNumber"), (value) => {
          if (!value) return true;

          if (!isValidPhoneNumber(value)) {
            return false;
          }

          return true;
        }),

      email: yup
        .string()
        .label("Email")
        .email()
        .test("no-alias", t("checkout.aliasEmailNotAllowed"), (value) => {
          if (!value) return true;
          const [localPart] = value.split("@");
          return !localPart.includes("+");
        })
        .nullable()
        .when("$signinType", {
          is: (val) => login_type !== "phone",
          then: (schema) => schema.required(t("checkout.emailRequired")),
          otherwise: (schema) => schema.notRequired(),
        }),
      confirm: yup
        .boolean()
        .oneOf([true], t("auth.confirmationRequired"))
        .required(),
      verify_by: yup.string().when("$signinType", {
        is: (val) => otp_channel?.length > 1,
        then: (schema) => schema.required(t("auth.selectVerificationMethod")),
        otherwise: (schema) => schema.notRequired(),
      }),
    });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      phone: "",
      confirm: false,
      verify_by: otp_channel?.[0],
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    userLimitedLogin({
      verify_by: payload?.verify_by,
      confirm: payload?.confirm,
      [login_type]: payload?.[login_type]?.toLowerCase(),
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          dispatch(LimitedSignIn({ ...res?.data?.data }));
        } else {
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || t("checkout.failedToSendMessage"));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0 "}
    >
      <div className={"flex flex-col gap-[1rem]"}>
        {login_type === "phone" ? (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              {t("profile.phoneNumber")}*
            </label>
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormPhoneInput
                  value={value}
                  defaultCountry="SY"
                  countries={["SY"]}
                  international={false}
                  countrySelectProps={{ disabled: true }}
                  helperText={error?.message}
                  onChange={(value, country) => onChange(value)}
                />
              )}
              name="phone"
              control={control}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("orders.email")}
            </label>
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInput
                  placeholder={t("checkout.enterEmail")}
                  value={value}
                  helperText={error?.message}
                  onChange={(value) => onChange(value)}
                />
              )}
              name="email"
              control={control}
            />
          </div>
        )}
        {otp_channel?.length > 1 && (
          <Controller
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className={"flex flex-col gap-[0.5rem]"}>
                <RadioGroup
                  name="use-radio-group"
                  value={value}
                  onChange={onChange}
                  row
                  sx={{ columnGap: 2, flexWrap: "nowrap", overflowX: "auto" }}
                >
                  {otp_channel?.map((channel) => (
                    <FormControlLabel
                      sx={{
                        alignItems: "center !important",
                        whiteSpace: "nowrap",
                      }}
                      key={channel}
                      value={channel}
                      label={
                        <div className="flex flex-row gap-[0.5rem] items-center">
                          <Typography
                            fontWeight={"bold"}
                            color="primary"
                            fontSize={"1rem"}
                          >
                            {t("auth.verifyByChannel", {
                              channel: channel,
                            })}
                          </Typography>
                        </div>
                      }
                      control={<Radio checked={value === channel} />}
                    />
                  ))}
                </RadioGroup>
                {error?.message !== "" && (
                  <FormHelperText>{error?.message}</FormHelperText>
                )}
              </div>
            )}
            name="verify_by"
            control={control}
          />
        )}

        <Controller
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FormCheckBox
              value={value}
              helperText={error?.message}
              onChange={(value) => onChange(value)}
              label={
                <div
                  className={"flex flex-col text-sm gap-[0.1rem] font-semibold"}
                >
                  <div>{t("auth.confirmValidAndNoTypos", { login_type })}</div>
                  <div>
                    {t("auth.andIAcceptThe")}{" "}
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      color="secondary"
                      href="/terms"
                      underline="none"
                    >
                      {t("checkout.terms")}
                    </Link>{" "}
                    {t("auth.andIUnderstandProductWorksWithESIM")}
                  </div>
                </div>
              }
            />
          )}
          name="confirm"
          control={control}
        />
      </div>
      <div className={"flex flex-row justify-center sm:justify-start "}>
        <Button
          disabled={isSubmitting}
          color="primary"
          type="submit"
          variant="contained"
          sx={{ width: "30%" }}
        >
          {t("btn.confirm")}
        </Button>
      </div>
    </form>
  );
};

export default TmpLogin;
