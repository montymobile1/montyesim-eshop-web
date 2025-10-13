import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
//COMPONENT
import { Button, Skeleton, TextField } from "@mui/material";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resendOrderOTP, userLogin, verifyOTP } from "../core/apis/authAPI";
import { verifyOrderOTP } from "../core/apis/userAPI";
import { dcbMessage } from "../core/variables/ProjectVariables";
import { SignIn } from "../redux/reducers/authReducer";

const schema = ({ t }) =>
  yup.object().shape({
    otp: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^\d$/, t("auth.otpMustBeNumber"))
          .required(t("auth.otpRequired"))
          .length(1, t("auth.otpDigitLength"))
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
  recallAssign,
  otpRequested = false,
  otpExpiration,
}) => {
  const { iccid } = useParams();
  const { t } = useTranslation();

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isVerifying, setIsVerifying] = useState(false);
  const [resend, setResend] = useState(true);
  const { login_type, otp_channel } = useSelector((state) => state.currency);
  const [_, setVerifiedBy] = useState("email");
  const [proceed] = useState(false);

  const [expiresAt, setExpiresAt] = useState(
    Date.now() + (otpExpiration ?? orderDetail?.otp_expiration ?? 120) * 1000
  );
  const [timer, setTimer] = useState(
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  );

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
          console.log(otp?.code, "the code from otp");
          reset({ otp: otp?.code?.split("") });
        })
        .catch((err) => console.error(err));

      setTimeout(() => ac.abort(), 60000);
    } else {
      toast.error("Web OTP API not supported. Please enter OTP manually.");
    }
  };

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
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000)
      );
      setTimer(remaining);

      if (remaining === 0) {
        setResend(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    setVerifiedBy(otp_channel?.[0]);
  }, [otp_channel]);

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
              ? { email: email?.toLowerCase() }
              : { email: email?.toLowerCase(), phone }),
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

  const handleResendOtp = () => {
    const storageKey = `${phone}-otpVerification`;

    if (checkout) {
      resendOrderOTP(orderDetail?.order_id)
        .then((res) => {
          if (res?.data?.status === "success") {
            const otpExpSec = res?.data?.data?.otp_expiration ?? 120;
            const newExpiresAt = Date.now() + otpExpSec * 1000;
            setExpiresAt(newExpiresAt);
            localStorage.setItem(
              storageKey,
              JSON.stringify({ otpExpSec, expiresAt: newExpiresAt })
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
      const requestPayload = {};
      switch (login_type) {
        case "email":
          requestPayload.email = email?.toLowerCase();
          break;
        case "phone":
          requestPayload.phone = phone;
          break;
        case "email_phone":
          requestPayload.email = email?.toLowerCase();
          requestPayload.phone = phone;
          break;
        default:
          break;
      }

      userLogin(requestPayload)
        .then((res) => {
          if (res?.data?.status === "success") {
            const otpExpSec = res?.data?.data?.otp_expiration ?? 120;
            const newExpiresAt = Date.now() + otpExpSec * 1000;
            setExpiresAt(newExpiresAt);
            localStorage.setItem(
              storageKey,
              JSON.stringify({ otpExpSec, expiresAt: newExpiresAt })
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
        });
    }
  };

  const shouldBeDisabled = useMemo(() => {
    return (
      Object.keys(errors)?.length !== 0 ||
      getValues("otp").some((el) => el === "")
    );
  }, [errors, getValues()]);

 //EXPLANATION : PLEASE DON'T CHANGE THIS AS IT WILL BE APPLIED LATER

  // if (checkout && otp_channel?.length > 1 && !proceed) {
  //   return (
  //     <div className={"flex flex-col gap-[1rem]"}>
  //       <RadioGroup
  //         name="use-radio-group"
  //         value={verifiedBy}
  //         onChange={(e) => setVerifiedBy(e.target.value)}
  //         row
  //         sx={{ columnGap: 2, flexWrap: "nowrap", overflowX: "auto" }}
  //       >
  //         {otp_channel?.map((channel) => (
  //           <FormControlLabel
  //             sx={{
  //               alignItems: "center !important",
  //               whiteSpace: "nowrap",
  //             }}
  //             value={channel}
  //             label={
  //               <div className="flex flex-row gap-[0.5rem] items-center">
  //                 <Typography
  //                   fontWeight={"bold"}
  //                   color="primary"
  //                   fontSize={"1rem"}
  //                 >
  //                   Verify by {channel}
  //                 </Typography>
  //               </div>
  //             }
  //             control={<Radio checked={verifiedBy === channel} />}
  //           />
  //         ))}
  //       </RadioGroup>
  //       <div className={"flex flex-row justify-center sm:justify-start "}>
  //         <Button
  //           onClick={() => setProceed(true)}
  //           color="primary"
  //           type="submit"
  //           variant="contained"
  //           sx={{ width: "30%" }}
  //         >
  //           Confirm
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // } else
  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={clsx("w-full max-w-md flex flex-col gap-[2rem] sm:px-unset", {
        "px-8 mx-auto": !checkout,
      })}
    >
      <h1 className="font-bold text-center text-primary">
        {t("auth.verifyEmail", { verifyBy: t(`auth.${verifyBy}`) })}
      </h1>
      <p className="text-center font-semibold text-content-600">
        {checkout
          ? t(`auth.${dcbMessage}`, { verifyBy: t(`auth.${verifyBy}`) })
          : t("auth.verificationCodeSent", { verifyBy: t(`auth.${verifyBy}`) })}
        <br />
        <span dir="ltr" className="font-medium">
          {login_type === "phone" || login_type === "email_phone"
            ? phone?.toLowerCase() || ""
            : email?.toLowerCase() || ""}
        </span>
      </p>

      {/* OTP Input */}
      <div className="flex justify-center gap-2" dir="ltr">
        {Array(6)
          .fill()
          .map((digit, index) => (
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
          {!resend ? (
            <>
              {t("auth.didntReceiveCode")}{" "}
              <span
                role="button"
                tabIndex={0}
                onClick={handleResendOtp}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleResendOtp();
                }}
                className="text-secondary underline cursor-pointer"
              >
                {t("auth.resendNow")}
              </span>
            </>
          ) : (
            <p className="text-secondary font-bold">
              {timer == null || isNaN(timer) ? (
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
          )}
        </div>
      </div>
    </form>
  );
};

export default OtpVerification;
