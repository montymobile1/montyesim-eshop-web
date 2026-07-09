//UTILITIES
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as yup from "yup";
//COMPONENT
import {
  Backdrop,
  Button,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import parsePhoneNumberFromString from "libphonenumber-js";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useSelector } from "react-redux";
import OtpVerification from "../components/OtpVerification";
import {
  FormCheckBox,
  FormInput,
  FormPhoneInput,
} from "../components/shared/form-components/FormComponents";
import ActiveOtpSent from "../components/shared/popups/ActiveOtpSent";
import EmailSent from "../components/shared/popups/EmailSent";
import { userLogin } from "../core/apis/authAPI";
import { useAuth } from "../core/context/AuthContext";
import {
  excludedCountries,
  onlyCountries,
  supportedPrefix,
} from "../core/variables/ProjectVariables";

const SignIn = () => {
  const { t } = useTranslation();
  const { signinWithGoogle, loadingSocial, signinWithFacebook } = useAuth();
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [showActiveOtpExist, setShowActiveOtpExist] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpExpiration, setOtpExpiration] = useState(200);
  const [otpRequested, setOtpRequested] = useState(false);
  const [info, setInfo] = useState(null);
  const { login_type, otp_channel, otp_expiration_time } = useSelector(
    (state) => state.currency,
  );
  const social_login = useSelector((state) => state.env?.social_login);
  const canSocialLogin =
    !(login_type === "phone" || login_type?.includes("email_phone")) &&
    social_login?.length > 0;

  const defaultSelectedCountry = info;

  const schema = ({ t }) =>
    yup.object().shape({
      phone: yup
        .string()
        .label("Phone number")
        .nullable()
        .when("$signinType", {
          is: () =>
            login_type === "phone" || login_type?.includes("email_phone"),
          then: (schema) => schema.required(t("auth.phoneRequired")),
          otherwise: (schema) => schema.notRequired(),
        })
        .test("is-valid-phone", `${t("auth.invalidPhone")}`, (value) => {
          if (!value) return true;

          // Validate phone number format
          if (!isValidPhoneNumber(value)) return false;

          // If supportedPrefix is empty, skip additional prefix check
          if (!supportedPrefix || supportedPrefix.length === 0) return true;

          // Validate first 2 digits after country dial code
          const phoneNumber = parsePhoneNumberFromString(value);
          const cleaned = phoneNumber?.nationalNumber;

          const prefix = cleaned.substring(0, 2);

          return supportedPrefix.includes(prefix);
        }),

      email: yup
        .string()
        .label("Email")
        .email(`${t("auth.emailMustBeValid")}`)
        .test("no-alias", `${t("checkout.aliasEmailNotAllowed")}`, (value) => {
          if (!value) return true;
          const [localPart] = value.split("@");
          return !localPart.includes("+");
        })
        .nullable()
        .when("$signinType", {
          is: (val) =>
            login_type !== "phone" || login_type?.includes("email_phone"),
          then: (schema) => schema.required(`${t("checkout.emailRequired")}`),
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

  const { control, handleSubmit, getValues, reset, setValue } = useForm({
    defaultValues: {
      email: "",
      phone: "",
      confirm: false,
      verify_by: otp_channel?.[0],
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  useEffect(() => {
    reset({ ...getValues(), verify_by: otp_channel?.[0] || "" });
  }, [otp_channel]);

  const handleSubmitForm = (payload) => {
    setIsSubmitting(true);

    const requestPayload = {
      otp_channel: payload?.verify_by?.toUpperCase(),
      confirm: payload?.confirm,
    };

    const storageKey = `${payload?.phone}-otpVerification`;

    switch (login_type) {
      case "email":
        requestPayload.email = payload?.email?.toLowerCase();
        break;

      case "phone":
        requestPayload.phone = payload?.phone;
        break;

      case "email_phone":
      case "email_phone_email":
      case "email_phone_both":
        requestPayload.email = payload?.email?.toLowerCase();
        requestPayload.phone = payload?.phone;
        break;
      default:
        break;
    }

    userLogin(requestPayload)
      .then((res) => {
        if (res?.data?.status === "success") {
          const otpExpSec =
            res?.data?.data?.otp_expiration || otp_expiration_time * 60;
          const expiresAt = Date.now() + otpExpSec * 1000;

          localStorage.setItem(
            storageKey,
            JSON.stringify({ otpExpSec, expiresAt }),
          );

          setOtpExpiration(otpExpSec);
          setShowEmailSent(true);
          setOtpRequested(true);
        }
      })
      .catch((e) => {
        if (e?.response?.status === 429) {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const { expiresAt } = JSON.parse(saved);
            const remaining = Math.max(
              0,
              Math.floor((expiresAt - Date.now()) / 1000),
            );

            setOtpExpiration(remaining);
            setShowOtpVerification(true);
            setShowActiveOtpExist(true);
            setOtpRequested(true);
          }
        } else {
          toast?.error(e?.message || t("checkout.failedToSendMessage"));
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setInfo(data?.country_code?.toLowerCase()))
      .catch((err) => console.error(err));
  }, []);

  if (showOtpVerification) {
    return (
      <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <OtpVerification
            email={getValues("email")}
            phone={getValues("phone")}
            verifyBy={getValues("verify_by")}
            setShowEmailSent={setShowEmailSent}
            otpRequested={otpRequested}
            setShowOtpVerification={setShowOtpVerification}
            otpExpiration={otpExpiration}
            setVerifyBy={(channel) => setValue("verify_by", channel)}
          />
        </div>
        {showEmailSent && (
          <EmailSent
            email={getValues("email")}
            phone={getValues("phone")}
            verifyBy={getValues("verify_by")}
            onClose={() => {
              setShowEmailSent(false);
              setShowOtpVerification(true);
            }}
          />
        )}
        {showActiveOtpExist && (
          <ActiveOtpSent
            onClose={() => {
              setShowActiveOtpExist(false);
              setShowOtpVerification(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col gap-[1.5rem] px-[30px]">
        <h1 className="text-center text-4xl font-bold">
          {t("auth.signInTitle")}
        </h1>
        <p className="text-center text-content-400 font-semibold">
          {t("auth.welcomeBackEnterEmail", {
            loginType: t(`auth.${login_type}`),
          })}
        </p>

        <form
          className="flex flex-col gap-[1rem]"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          {(login_type === "email" || login_type?.includes("email_phone")) && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t("auth.email")}
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
          {(login_type === "phone" || login_type?.includes("email_phone")) && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t("auth.phoneNumber")}
              </label>
              <Controller
                name="phone"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => {
                  return (
                    <FormPhoneInput
                      onlyCountries={onlyCountries}
                      value={value}
                      defaultCountry={
                        onlyCountries?.length
                          ? onlyCountries.includes(defaultSelectedCountry)
                            ? defaultSelectedCountry
                            : onlyCountries[0]
                          : excludedCountries?.includes(defaultSelectedCountry)
                            ? "lb"
                            : defaultSelectedCountry || "lb"
                      }
                      disabled={false}
                      helperText={error?.message}
                      onChange={(val) => {
                        onChange(val);
                      }}
                    />
                  );
                }}
              />
            </div>
          )}

          <div className="flex">
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormCheckBox
                  placeholder={t("checkout.enterEmail")}
                  value={value}
                  helperText={error?.message}
                  onChange={(value) => onChange(value)}
                  label={
                    <div
                      className={
                        "flex flex-col text-sm gap-[0.1rem] font-semibold"
                      }
                    >
                      <div>
                        {t("auth.acceptTerms")}&nbsp;
                        <MuiLink
                          rel="noopener noreferrer"
                          target="_blank"
                          color="secondary"
                          href="/terms"
                          underline="none"
                        >
                          {t("checkout.terms")}
                        </MuiLink>{" "}
                      </div>
                    </div>
                  }
                />
              )}
              name="confirm"
              control={control}
            />
          </div>

          <div className="flex flex-col">
            {otp_channel?.map((channel, index) => (
              <div key={channel} className="flex flex-col">
                <Button
                  fullWidth
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  type="submit"
                  onClick={() => setValue("verify_by", channel)}
                >
                  {isSubmitting
                    ? t("auth.signingIn")
                    : otp_channel?.length > 1
                      ? t("auth.signInViaChannel", { channel })
                      : t("auth.signIn")}
                </Button>

                {/* Add "Or" between buttons except after the last one */}
                {index < otp_channel.length - 1 && (
                  <div className="text-center text-sm font-semibold text-gray-500 my-2">
                    {t("auth.orContinueWith")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </form>

        {canSocialLogin && (
          <>
            <div className="flex items-center">
              <div className="flex-grow border-t-[0.1rem] border-500"></div>
              <span className="px-4"> {t("auth.orContinueWith")}</span>
              <div className="flex-grow border-t-[0.1rem] border-500"></div>
            </div>
            <div className="flex flex-col gap-[1rem]">
              {social_login?.includes("google") && (
                <button
                  onClick={signinWithGoogle}
                  className="flex items-center justify-center gap-[0.5rem] w-full py-2 px-4 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium text-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
                >
                  <img
                    src={"/media/google.svg"}
                    className="h-5 w-5"
                    alt={"sign-in with google"}
                  />
                  {t("auth.signInWithGoogle")}
                </button>
              )}

              {social_login?.includes("facebook") && (
                <button
                  onClick={signinWithFacebook}
                  className="flex items-center justify-center gap-[0.5rem] w-full py-2 px-4 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
                >
                  <img
                    src={"/media/facebook.svg"}
                    className="h-5 w-5"
                    alt={"sign-in with facebook"}
                  />
                  {t("auth.signInWithFacebook")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {showEmailSent && (
        <EmailSent
          verifyBy={getValues("verify_by")}
          phone={getValues("phone")}
          email={getValues("email")}
          onClose={() => {
            setShowEmailSent(false);
            setShowOtpVerification(true);
          }}
        />
      )}
      {loadingSocial && (
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </div>
  );
};

export default SignIn;
