import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
//COMPONENT
import { Button, Skeleton, TextField } from "@mui/material";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  resendLoginOTP,
  resendOrderOTP,
  verifyOTP,
} from "../core/apis/authAPI";
import { verifyOrderOTP } from "../core/apis/userAPI";
import { dcbMessage } from "../core/variables/ProjectVariables";
import { SignIn } from "../redux/reducers/authReducer";
import NoDataFound from "./shared/no-data-found/NoDataFound";
import TransactionExpired from "./TransactionExpired";

const REST_OTP_CHANNEL_DELAY_SECONDS = 15;

const schema = ({ t }) =>
  yup.object().shape({
    otp: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^\d$/, t("auth.otpMustBeNumber"))
          .required(t("auth.otpRequired"))
          .length(1, t("auth.otpDigitLength")),
      )
      .length(6, t("auth.otpSixDigits")),
  });

const OtpVerification = ({
  email,
  onVerify,
  setShowEmailSent,
  phone,
  orderDetail,
  handleCancelOrder,
  verifyBy,
  handleSuccessOrder,
  checkout = false,
  loading = false,
  errorAssign = false,
  otpRequested = false,
  setShowOtpVerification,
  setVerifyBy,
  otpExpiration,
}) => {
  const { iccid } = useParams();
  const { t } = useTranslation();
  const otp_expiration_time = useSelector(
    (state) => state.currency?.otp_expiration_time,
  );
  const [loadingResend, setLoadingResend] = useState(false);

  const transaction_expiry_time = useSelector(
    (state) => state.currency?.transaction_expiry_time,
  );
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  const [isVerifying, setIsVerifying] = useState(false);
  const [openTransactionExpired, setOpenTransactionExpired] = useState(false);
  const [resend, setResend] = useState(true);
  const { login_type, otp_channel } = useSelector((state) => state.currency);

  const [expiresAt, setExpiresAt] = useState(
    Date.now() +
      (login_type === "email_phone_both"
        ? REST_OTP_CHANNEL_DELAY_SECONDS
        : (otpExpiration ?? orderDetail?.otp_expiration ?? 300)) *
        1000,
  );

  const [timer, setTimer] = useState(
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  );

  // Transaction expiry tracking for checkout

  const [transactionExpiresAt] = useState(() => {
    if (checkout && transaction_expiry_time && transaction_expiry_time !== "") {
      return Date.now() + transaction_expiry_time * 60 * 1000; // Convert minutes to milliseconds
    }
    return null;
  });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  const handleRequestOTP = () => {
    if ("OTPCredential" in window) {
      const ac = new AbortController();

      navigator.credentials
        .get({ otp: { transport: ["sms"] }, signal: ac.signal })
        .then((otp) => {
          reset({ otp: otp?.code?.split("") });
        })
        .catch((err) => console.error(err));

      setTimeout(() => ac.abort(), 60000);
    } else {
      toast.error(
        "Autofill OTP not supported. Please enter your code manually.",
      );
    }
  };

  const restOtpChannel = useMemo(() => {
    return otp_channel?.filter((el) => el !== verifyBy);
  }, [otp_channel, verifyBy]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    if (otpRequested) {
      handleRequestOTP();
    }
  }, []);

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !getValues(`otp[${index}]`) && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000),
      );
      setTimer(remaining);

      if (remaining === 0) {
        setResend(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, loading, login_type]);

  // Transaction expiry timer for checkout
  useEffect(() => {
    if (
      !checkout ||
      !transactionExpiresAt ||
      transactionExpiresAt == "" ||
      loading
    )
      return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((transactionExpiresAt - Date.now()) / 1000),
      );

      if (remaining === 0) {
        setOpenTransactionExpired(true);
        handleCancelOrder();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkout, transactionExpiresAt, loading]);

  const handleSubmitForm = (payload) => {
    setIsVerifying(true);

    const storageKey = `${payload?.phone}-otpVerification`;
    let handleAPI = checkout ? verifyOrderOTP : verifyOTP;

    handleAPI({
      ...payload,
      ...(checkout
        ? {
            order_id: orderDetail?.order_id,
            otp: payload.otp.join(""),
            iccid: iccid,
          }
        : {
            ...(login_type === "phone"
              ? { phone }
              : login_type === "email"
                ? { user_email: email?.toLowerCase() }
                : { user_email: email?.toLowerCase(), phone }),
            verification_pin: payload.otp.join(""),
            provider_token: "",
            provider_type: "",
          }),
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          localStorage.removeItem(storageKey);

          if (checkout) {
            handleSuccessOrder();
          } else {
            dispatch(SignIn({ ...res?.data?.data }));
          }
        } else {
          toast.error(res?.data?.message || t("auth.failedToVerifyOtp"));
          setIsVerifying(false);
        }
      })
      .catch((error) => {
        reset();
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          t("auth.failedToVerifyOtp");
        toast.error(msg);
      })
      .finally(() => {
        setTimeout(() => {
          setIsVerifying(false);
        }, 5000);
      });
  };

  const handleInput = (index, value) => {
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (value && index === 5) {
      handleSubmitForm(getValues());
    }
  };

  const handlePaste = (e, index) => {
    const pastedValue = e.clipboardData?.getData("Text");
    if (/^\d*$/.test(pastedValue)) {
      const digits = pastedValue.split("").slice(0, 6);
      reset({ otp: digits });
    }
  };

  /* EXPLANATION:
  Resend otp howi beshof iza l otp expired by3ml generate la new otp and send it
  iza mano expired it send same otp again 
  */

  const handleResendOtp = (newVerify) => {
    const storageKey = `${phone}-otpVerification`;

    if (checkout) {
      resendOrderOTP(orderDetail?.order_id)
        .then((res) => {
          if (res?.data?.status === "success") {
            const otpExpSec =
              otp_expiration_time && otp_expiration_time !== ""
                ? otp_expiration_time * 60 //in seconds
                : 300;

            const newExpiresAt = Date.now() + otpExpSec * 1000;
            setExpiresAt(newExpiresAt);
            localStorage.setItem(
              storageKey,
              JSON.stringify({ otpExpSec, expiresAt: newExpiresAt }),
            );
            setResend(true);
          }
        })
        .catch((e) => {
          if (e?.response?.status === 429) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const { expiresAt } = JSON.parse(saved);
              setExpiresAt(expiresAt);
              setResend(true);
            }
          } else {
            toast?.error(e?.message || "Failed to send message");
          }
        });
    } else {
      setLoadingResend(true);
      const requestPayload = {
        otp_channel:
          newVerify?.toLowerCase() == verifyBy?.toLowerCase()
            ? verifyBy?.toUpperCase()
            : newVerify?.toUpperCase(),
      };
      switch (login_type) {
        case "email":
          requestPayload.email = email?.toLowerCase();
          break;
        case "phone":
          requestPayload.phone = phone;
          break;
        case "email_phone":
        case "email_phone_email":
        case "email_phone_both":
          requestPayload.email = email?.toLowerCase();
          requestPayload.phone = phone;
          break;
        default:
          break;
      }

      resendLoginOTP(requestPayload)
        .then((res) => {
          if (res?.data?.status === "success") {
            const fallbackMinutes = otp_expiration_time ?? 5;
            const fallbackSeconds = fallbackMinutes * 60;
            const otpExpSec =
              login_type === "email_phone_both"
                ? REST_OTP_CHANNEL_DELAY_SECONDS
                : (res?.data?.data?.otp_expiration ?? fallbackSeconds);

            const newExpiresAt = Date.now() + otpExpSec * 1000;
            setExpiresAt(newExpiresAt);
            localStorage.setItem(
              storageKey,
              JSON.stringify({ otpExpSec, expiresAt: newExpiresAt }),
            );

            setShowEmailSent(true);
            setResend(true);
          }
        })
        .catch((e) => {
          if (e?.response?.status === 429) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
              const { expiresAt } = JSON.parse(saved);
              setExpiresAt(expiresAt);
              setResend(true);
              setShowEmailSent(true);
            }
          } else {
            toast?.error(e?.message || "Failed to send message");
          }
        })
        .finally(() => {
          setLoadingResend(false);
        });
    }
  };

  const shouldBeDisabled = useMemo(() => {
    return (
      Object.keys(errors)?.length !== 0 ||
      getValues("otp").some((el) => el === "")
    );
  }, [errors, getValues()]);

  if (checkout) {
    if (loading) {
      return (
        <div className={"w-full sm:basis-[50%] shrink-0"}>
          <Skeleton variant="rectangular" height={150} />
        </div>
      );
    } else if (errorAssign) {
      return (
        <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
          <NoDataFound text={t("stripe.failedToLoadPaymentInputs")} />
        </div>
      );
    }
  }

  return (
    <>
      {openTransactionExpired && (
        <TransactionExpired orderDetail={orderDetail} />
      )}
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className={clsx(
          "w-full max-w-md flex flex-col gap-[2rem] sm:px-unset",
          {
            "px-8 mx-auto": !checkout,
          },
        )}
      >
        <h1 className="font-bold text-center text-primary">
          {t("auth.verifyEmail", { verifyBy: t(`auth.${verifyBy}`) })}
        </h1>
        <p className="text-center font-semibold text-content-600">
          {checkout
            ? t(`auth.${dcbMessage}`, { verifyBy: t(`auth.${verifyBy}`) })
            : t("auth.verificationCodeSent", {
                verifyBy: t(`auth.${verifyBy}`),
              })}
          <br />
          <span dir="ltr" className="font-medium">
            {verifyBy === "email" ? email?.toLowerCase() : phone?.toLowerCase()}
          </span>
        </p>

        {/* OTP Input */}
        <div className="flex justify-center gap-2" dir="ltr">
          {new Array(6).fill().map((digit, index) => (
            <Controller
              key={`otp-${index}`}
              name={`otp.[${index}]`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={value}
                  maxLength={1}
                  onChange={(e) => {
                    if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
                      onChange(e?.target?.value);
                      handleInput(index, e.target.value);
                    }
                  }}
                  onPaste={(e) => handlePaste(e, index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  dir="ltr"
                  inputProps={{
                    maxLength: 1,
                    dir: "ltr",
                    style: { textAlign: "center" },
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  variant="outlined"
                  fullWidth
                  autoFocus={index === 0}
                />
              )}
            />
          ))}
        </div>

        <div className={"flex flex-col gap-[0.5rem]"}>
          <div className={"flex flex-row gap-[0.5rem]"}>
            <Button
              type={"submit"}
              color="primary"
              variant="contained"
              disabled={isVerifying || shouldBeDisabled}
            >
              {isVerifying ? t("auth.verifying") : t("auth.verify")}
            </Button>
            {checkout && (
              <Button
                type={"button"}
                color="secondary"
                variant="contained"
                onClick={() => handleCancelOrder()}
              >
                {t("btn.cancel")}
              </Button>
            )}
          </div>

          <div className="flex flex-row flex-wrap gap-[0.5rem] w-full justify-center text-center text-sm">
            {!loading && !loadingResend ? (
              !resend ? (
                <>
                  {t("auth.didntReceiveCode")}{" "}
                  <button
                    onClick={() => handleResendOtp(verifyBy)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleResendOtp(verifyBy);
                    }}
                    className="text-secondary underline cursor-pointer bg-transparent p-0"
                  >
                    {t("auth.resendNow")}
                  </button>
                </>
              ) : (
                <p className="text-secondary font-bold">
                  {timer == null || Number.isNaN(timer) || timer == 0 ? (
                    <Skeleton
                      variant="text"
                      width={80}
                      height={30}
                      className="!bg-gray-300 rounded-md"
                    />
                  ) : (
                    <>
                      {t("auth.resendCode")} {Math.floor(timer / 60)}:
                      {(timer % 60).toString().padStart(2, "0")}
                    </>
                  )}
                </p>
              )
            ) : (
              <Skeleton
                variant="text"
                width={80}
                height={30}
                className="!bg-gray-300 rounded-md"
              />
            )}
          </div>
          {!resend && restOtpChannel?.length > 0 && (
            <>
              <div className="text-center text-sm font-semibold text-gray-500 my-2">
                {t("auth.orContinueWith")}
              </div>
              <div className="flex flex-col">
                {restOtpChannel?.map((channel, index) => (
                  <div key={channel} className="flex flex-col">
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      type="button"
                      disabled={loadingResend}
                      onClick={() => {
                        setVerifyBy(channel);
                        handleResendOtp(channel);
                        reset();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          handleResendOtp(channel);
                      }}
                    >
                      {t("auth.signInViaChannel", { channel })}
                    </Button>

                    {/* Add "Or" between buttons except after the last one */}

                    {index < restOtpChannel?.length - 1 && (
                      <div className="text-center text-sm font-semibold text-gray-500 my-2">
                        {t("auth.orContinueWith")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </form>
    </>
  );
};

export default OtpVerification;
