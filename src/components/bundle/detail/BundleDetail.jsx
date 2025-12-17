//UTILITIES
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
//COMPONENT
import NoDataFound from "../../shared/no-data-found/NoDataFound";
import { Check, Close, QuestionMark } from "@mui/icons-material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { checkBundleExist } from "../../../core/apis/userAPI";
import { toast } from "react-toastify";
import BundleExistence from "./BundleExistence";
import { useSelector } from "react-redux";
import clsx from "clsx";
import TooltipComponent from "../../shared/tooltip/TooltipComponent";
import { useTranslation, Trans } from "react-i18next";
import { FormInput } from "../../shared/form-components/FormComponents";
import { validatePromo } from "../../../core/apis/promotionsAPI";

const schema = () =>
  yup.object().shape({
    code: yup
      .string()
      .label("Code")
      .transform((value, originalValue) =>
        originalValue?.trim() === "" ? null : value
      )
      .nullable(),
  });

const BundleDetail = ({
  onClose,
  bundle,
  globalDisplay,
  iccid,
  regionIcon,
}) => {
  const { t } = useTranslation();
  const isSmall = useMediaQuery("(max-width: 639px)");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const login_type = useSelector((state) => state.currency?.login_type);
  const [openRedirection, setOpenRedirection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [appliedCode, setAppliedCode] = useState(false);
  const [newBundle, setNewBundle] = useState("");
  const [selectedBundle, setSelectedBundle] = useState("");
  const [codeMessage, setCodeMessage] = useState({
    message: "",
    status: "",
  });
  const { control, handleSubmit, reset, watch, getValues } = useForm({
    defaultValues: {
      code: "",
      referral: false,
    },
    resolver: yupResolver(schema()),
    mode: "all",
  });

  const handleCheckExist = () => {
    //order top-up
    if (
      !tmp?.isAuthenticated &&
      !isAuthenticated &&
      (login_type === "phone" || login_type === "email_phone")
    ) {
      navigate(
        `/signin?next=${encodeURIComponent(
          `/checkout/${bundle?.bundle_code}`
        )}`,
        {
          state: {
            promo_code: appliedCode ? getValues("code") : "",
            new_price: newBundle?.price,
            new_price_display: newBundle?.price_display || null,
          },
        }
      );
      return;
    }
    if (
      (tmp?.isAuthenticated && !isAuthenticated) ||
      (!tmp?.isAuthenticated && !isAuthenticated)
    ) {
      navigate(`/checkout/${bundle?.bundle_code}`, {
        state: {
          promo_code: appliedCode ? getValues("code") : "",
          new_price: newBundle?.price,
          new_price_display: newBundle?.price_display || null,
        },
      });

      return;
    }
    if (iccid) {
      navigate(`/checkout/${bundle?.bundle_code}/${iccid}`, {
        state: {
          promo_code: appliedCode ? getValues("code") : "",
          new_price: newBundle?.price,
          new_price_display: newBundle?.price_display || null,
        },
      });
      return;
    } else {
      //normal order
      setIsSubmitting(true);

      checkBundleExist(bundle?.bundle_code)
        .then((res) => {
          if (res?.data?.status === "success") {
            if (res?.data?.data) {
              setOpenRedirection(true);
            } else {
              navigate(`/checkout/${bundle?.bundle_code}`, {
                state: {
                  promo_code: appliedCode ? getValues("code") : "",
                  new_price: newBundle?.price,
                  new_price_display: newBundle?.price_display || null,
                },
              });
            }
          } else {
            toast.error(res?.message);
          }
        })
        .catch((e) => {
          toast?.error(e?.message || "Failed to check bundle existence");
        })
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleCodeValidation = (payload) => {
    setCheckingCode(true);
    validatePromo({
      promo_code: payload?.code?.trim(),
      bundle_code: bundle?.bundle_code,
    })
      .then((res) => {
        if (res?.data?.status?.toLowerCase() === "success") {
          setNewBundle(res?.data?.data || null);
          setAppliedCode(true);
          setCodeMessage({
            message: res?.data?.message,
            status: res?.data?.status,
          });
        }
      })
      .catch((error) => {
        const status = error?.response?.data?.status || "";
        setCodeMessage({
          message: error?.response?.data?.message || error?.message || "",
          status: status,
        });
        localStorage.removeItem("referral_code");
        setAppliedCode(false);
      })
      .finally(() => {
        setCheckingCode(false);
      });
  };

  useEffect(() => {
    if (location?.state?.promo_code) {
      reset({
        code: location?.state?.promo_code || "",
      });
      handleCodeValidation({ code: location?.state?.promo_code });
    } else if (localStorage.getItem("referral_code")) {
      reset({
        code: localStorage.getItem("referral_code") || "",
      });
      handleCodeValidation({ code: localStorage.getItem("referral_code") });
    }
  }, []);

  useEffect(() => {
    if (appliedCode) {
      setSelectedBundle(newBundle);
    } else {
      setSelectedBundle(bundle);
      setCodeMessage({
        message: "",
        status: "",
      });
    }
  }, [appliedCode]);

  const avatarSrc = useMemo(() => {
    if (globalDisplay) return "/media/global.svg";
    else if (regionIcon)
      return regionIcon; //NOTES: requested to be done from frontend manually taken by props
    else return bundle?.icon;
  }, [globalDisplay, regionIcon, bundle]);

  return (
    <Dialog fullWidth open={true} maxWidth={"sm"}>
      <DialogContent className={"flex flex-col gap-2"}>
        <div className={"flex flex-row justify-end"}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "black",
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "black",
                  }
            }
          >
            <Close />
          </IconButton>
        </div>
        <div
          className={
            "mt-2 flex flex-col sm:flex-row justify-between sm:items-start gap-[0.3rem]"
          }
        >
          <div className={"flex flex-row gap-4 items-center min-w-0 "}>
            <Avatar
              src={avatarSrc}
              alt={selectedBundle?.display_title || ""}
              sx={{ width: 45, height: 45 }}
            >
              {/* fallback image */}
              <img
                src={"/media/global.svg"}
                className={"bg-white"}
                alt={selectedBundle?.display_title || ""}
              />
            </Avatar>
            <div
              className={"flex flex-col justify-between items-start min-w-0"}
            >
              <p
                dir={"ltr"}
                className={
                  "text-xl font-bold text-primary truncate w-full sm:max-w-none"
                }
              >
                {selectedBundle?.display_title || ""}
              </p>
              {/* NOTES: done by request because title and sub title are same
              <p className={"text-base text-color-400 truncate w-full"}>
                {bundle?.display_subtitle || ""}
              </p>
               */}
            </div>
          </div>
          <div
            className={
              "text-2xl font-bold text-primary flex justify-end break-all"
            }
          >
            {`${t("bundles.validity")}: ${t(
              `validity.${selectedBundle?.validity_label?.toLowerCase()}${
                selectedBundle?.validity > 1 ? "_plural" : ""
              }`,
              { count: selectedBundle?.validity }
            )}`}
          </div>
        </div>
        <hr />
        <div
          dir={"ltr"}
          className={
            "flex sm:flex-row justify-between  items-center text-2xl font-bold text-primary min-w-0 gap-[0.5rem]"
          }
        >
          <TooltipComponent
            title={isSmall ? selectedBundle?.gprs_limit_display : ""}
          >
            <p className={"truncate min-w-0"}>
              {selectedBundle?.gprs_limit_display}
            </p>
          </TooltipComponent>
          <p className={"flex flex-row justify-end whitespace-nowrap"}>
            {selectedBundle?.price_display}
          </p>
        </div>
        <div
          className={
            "flex flex-col sm:flex-row gap-[1rem] items-start sm:min-h-[220px]"
          }
        >
          {selectedBundle?.bundle_category?.type !== "CRUISE" && (
            <div
              className={
                "flex flex-col gap-[1rem] w-[100%] sm:basis-[50%] bg-bgLight rounded-md p-2 sm:min-h-[220px] max-h-[220px] sm:h-[220px]"
              }
            >
              <h6>
                {t("bundles.supportedCountries")}&nbsp;
                {selectedBundle?.countries?.length !== 0 &&
                  `(${selectedBundle?.countries?.length})`}
              </h6>
              <div
                className={
                  "flex flex-col gap-[0.5rem] overflow-x-hidden overflow-x-auto cursor-auto"
                }
              >
                {selectedBundle?.countries?.length === 0 ? (
                  <NoDataFound text={t("bundles.bundleIsntSupportedCountry")} />
                ) : (
                  selectedBundle?.countries?.map(
                    (supportedCountries, index) => (
                      <div
                        className={"flex flex-row gap-[1rem] items-center"}
                        key={supportedCountries?.id}
                      >
                        <Avatar
                          src={supportedCountries?.icon}
                          alt={
                            supportedCountries?.country ||
                            `supported-country-${index}`
                          }
                          sx={{ width: 20, height: 20 }}
                        />
                        <p>{supportedCountries?.country}</p>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
          <div
            className={clsx(
              "flex flex-col w-[100%] sm:basis-[50%]  gap-[1rem] bg-bgLight rounded-md p-2 sm:min-h-[220px] sm:h-[220px]",
              {
                "flex-1": selectedBundle?.bundle_category?.type === "CRUISE",
              }
            )}
          >
            <h6>{t("bundles.additionalInfo")}</h6>

            <div
              className={
                "flex flex-col gap-[0.5rem] overflow-x-hidden overflow-x-auto cursor-auto"
              }
            >
              <div className={"flex flex-col gap-[0.1rem]"}>
                <div className={"text-content-600"}>
                  {t("bundles.planType")}
                </div>
                <p className={"font-semibold break-words"}>
                  {t(`planType.${selectedBundle?.plan_type}`) ||
                    t("common.notAvailable")}
                </p>
              </div>
              <hr />
              <div>
                <div className={"text-content-600"}>
                  {t("bundles.activationPolicy")}
                </div>
                <p className={"font-semibold break-words"}>
                  {t(`activity_policy`) || t("common.notAvailable")}
                </p>
              </div>
            </div>
          </div>
        </div>
        {isAuthenticated &&
          import.meta.env.VITE_SUPPORT_PROMO == "true" &&
          !iccid && (
            <form
              className={"bg-bgLight flex flex-col gap-2  p-2 rounded-md"}
              onSubmit={handleSubmit(handleCodeValidation)}
            >
              <h6 className={"text-start"}>
                {t("bundles.apply_promo_or_referral")}
              </h6>
              <div className={"flex flex-row gap-2"}>
                <div className={"basis-[80%]"}>
                  <Controller
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <FormInput
                        placeholder={t("bundles.enter_promo_code_or_referral")}
                        value={value}
                        onChange={(value) => {
                          onChange(value);
                        }}
                        disabled={appliedCode}
                        hintMessage={
                          codeMessage?.message !== "" && (
                            <div className={"flex flex-row gap-1 items-center"}>
                              {codeMessage?.status === "success" ? (
                                <Check
                                  fontSize="small"
                                  sx={{ height: "1rem" }}
                                  color="success"
                                />
                              ) : (
                                <PriorityHighIcon
                                  fontSize="small"
                                  sx={{ height: "1rem" }}
                                />
                              )}
                              <p
                                style={{
                                  color:
                                    codeMessage?.status === "failed"
                                      ? undefined
                                      : "green", // Green if success
                                }}
                              >
                                {`${codeMessage?.message}`}
                              </p>
                            </div>
                          )
                        }
                        helperText={error?.message}
                      />
                    )}
                    name="code"
                    control={control}
                  />
                </div>
                <div
                  className={"flex flex-row gap-2 basis-[20%]"}
                  style={{ flexFlow: "column" }}
                >
                  {appliedCode ? (
                    <Button
                      type="button"
                      variant={"contained"}
                      onClick={(e) => {
                        e.preventDefault();
                        setAppliedCode(false);
                        localStorage.removeItem("referral_code");
                        reset();
                      }}
                      style={{ marginTop: "2px" }}
                      color="secondary"
                      disabled={
                        !watch("code") || watch("code") === "" || checkingCode
                      }
                    >
                      {t("btn.cancel")}
                    </Button>
                  ) : (
                    <Button
                      variant={"contained"}
                      color="primary"
                      style={{ marginTop: "2px" }}
                      type={"submit"}
                      disabled={
                        !watch("code") ||
                        watch("code")?.trim() === "" ||
                        checkingCode
                      }
                    >
                      {t("btn.apply")}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        <div
          className={
            "bg-bgLight flex flex-row gap-6 items-center p-2 rounded-md"
          }
        >
          <div className=" flex items-center justify-center basis-[10%]">
            <div
              className={
                "w-11 h-11 bg-[#d7e9f7] rounded-full flex items-center justify-center"
              }
            >
              <QuestionMark
                className="text-gray-700"
                fontSize="small"
                color={"info"}
              />
            </div>
          </div>

          <div className={"flex flex-col gap-1"}>
            <h6>{t("bundles.compatibility")}</h6>
            <p className={"text-sm font-bold break-words"}>
              <Trans
                i18nKey="bundles.findOut"
                values={{ code: "*#06#", term: "EID" }}
                components={[
                  <span dir="ltr" key={"span-1"} />,
                  <span dir="ltr" key={"span-2"} />,
                ]}
              />
            </p>
          </div>
        </div>
      </DialogContent>
      <div className={"px-[24px] py-[20px]"}>
        <Button
          disabled={isSubmitting || checkingCode}
          variant={"contained"}
          color="primary"
          onClick={() => handleCheckExist()}
        >
          <p className={"font-bold !text-base truncate max-w-20px"}>
            {isSubmitting
              ? t("btn.checkingBundle")
              : `${t("btn.buyNow")} - ${selectedBundle?.price_display}`}
          </p>
        </Button>
      </div>
      {openRedirection && (
        <BundleExistence
          bundle={selectedBundle}
          onClose={() => setOpenRedirection(false)}
          closeDetail={() => onClose()}
          appliedCode={appliedCode}
          newBundle={newBundle}
          getValues={getValues}
        />
      )}
    </Dialog>
  );
};

export default BundleDetail;
