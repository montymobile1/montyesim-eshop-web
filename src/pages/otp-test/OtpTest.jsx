import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
//COMPONENT
import { Button, TextField } from "@mui/material";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

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

const OtpTest = ({
  email,
  onVerify,
  setShowEmailSent,
  phone,
  orderDetail,
  handleCancelOrder,
  verifyBy,
  handleSuccessOrder,
  checkout = false,
  otpRequested = false,
}) => {
  const { iccid } = useParams();

  const { t } = useTranslation();

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isVerifying, setIsVerifying] = useState(false);
  const [resend, setResend] = useState(true);
  const [timer, setTimer] = useState(120); // 120 seconds = 2 minutes
  const { login_type, otp_channel } = useSelector((state) => state.currency);
  const [_, setVerifiedBy] = useState("email");
  const [proceed] = useState(false);
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

  const handleSubmitForm = () => {
    console.log("submitting form");
  };

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    if (otpRequested) {
      handleRequestOTP();
    }
  }, []);

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !getValues(`otp[${index}]`) && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleRequestOTP = () => {
    toast.success("requesting otp");
    if ("OTPCredential" in window) {
      const ac = new AbortController();

      navigator.credentials
        .get({ otp: { transport: ["sms"] }, signal: ac.signal })
        .then((otp) => {
          console.log(otp?.code, "the code from otp");
          toast.success(`the code from otp ${otp?.code}`);
          reset({ otp: otp?.code?.split("") });
        })
        .catch((err) => console.error(err));

      // Optional: abort after some time
      setTimeout(() => ac.abort(), 60000);
    } else {
      toast.error("Web OTP API not supported. Please enter OTP manually.");
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setResend(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    toast.success("deployed");
    setVerifiedBy(otp_channel?.[0]);
  }, [otp_channel]);

  const handleInput = (index, value) => {
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If all digits are filled, verify automatically
    if (value && index === 5) {
      handleSubmitForm(getValues());
    }
  };
  const handlePaste = (e, index) => {
    const pastedValue = e.clipboardData?.getData("Text");
    if (/^\d*$/.test(pastedValue)) {
      const digits = pastedValue.split("").slice(0, 6);
      reset({
        otp: digits,
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
      className={clsx("w-full max-w-md  flex flex-col gap-[2rem] sm:px-unset", {
        "px-8 mx-auto": !checkout,
      })}
    >
      <h1 className="font-bold text-center text-primary">
        {"Test Otp Autofill"}
      </h1>

      {/* OTP Input */}
      <div className="flex justify-center gap-2" dir="ltr">
        {Array(6)
          .fill()
          ?.map((digit, index) => (
            <Controller
              key={`otp-${index}`}
              name={`otp.[${index}]`}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
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
                  slotProps={{
                    autoComplete: "one-time-code",
                    form: {
                      autoComplete: "one-time-code",
                    },
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
          <Button
            type={"submit"}
            color="primary"
            variant="contained"
            onClick={() => handleRequestOTP()}
          >
            autofill
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
      </div>
    </form>
  );
};

export default OtpTest;
