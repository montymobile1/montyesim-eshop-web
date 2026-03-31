//UTILITIES
import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

//API
import { getOrderByID } from "../../core/apis/userAPI";
import { logAnalyticsEventWithUser } from "../../core/helpers/CommonHelpers";
//COMPONENT
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { fetchUserInfo } from "../../redux/reducers/authReducer";
import clsx from "clsx";
import EsimInstallation from "./EsimInstallation";

const OrderPopup = ({ id, onClose, orderData, fromPlans }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated, user_info, tmp } = useSelector(
    (state) => state.authentication
  );

  const { login_type } = useSelector((state) => state.currency);

  const { data, isLoading } = useQuery({
    queryKey: [`${user_info?.id}-order-${id}`],
    queryFn: () => getOrderByID(id).then((res) => res?.data?.data),
    enabled: !!id,
    onSuccess: () => {
      if (isAuthenticated) {
        dispatch(fetchUserInfo());
      }
    },
  });

  useEffect(() => {
    //   //close popup if 401
    if (!isAuthenticated && !tmp?.isAuthenticated) {
      onClose();
    }
  }, []);

  // Log analytics event when coming from plans page
  useEffect(() => {
    if (fromPlans && !isLoading && (orderData || data)) {
      const order = orderData || data;

      logAnalyticsEventWithUser("order-popup", {
        bundle_code:
          order?.bundle_code || order?.bundle_details?.bundle_code || "",
        bundle_name:
          order?.bundle_name || order?.bundle_details?.bundle_name || "",
        user: user_info?.email || "temp user",
        order_id: order?.order_id || order?.id || id || "",
      });
    }
  }, [fromPlans, isLoading, orderData, data, user_info?.email, id]);

  return (
    <Dialog open={true} maxWidth="sm">
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10 min-w-[200px] max-w-[500px]">
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
        <h1 className={"mt-2 text-center"}>{t("orders.installYoureSIM")}</h1>

        {!isLoading && (data || orderData) && (
          <>
            {import.meta.env.VITE_APP_SEA_OPTION == "true" &&
              import.meta.env.VITE_ESIM_INSTALLATION == "true" && (
                <EsimInstallation
                  data={data}
                  orderData={orderData}
                  isLoading={isLoading}
                />
              )}
            <div className={"flex flex-col gap-4"}>
              <p
                className={clsx("text-center text-content-600 font-medium", {
                  "text-start": import.meta.env.VITE_APP_SEA_OPTION == "true",
                })}
              >
                {login_type == "email"
                  ? t("orders.qrcode_sent_text_with_email")
                  : t("orders.qrcode_sent_text")}
              </p>

              <div
                className={
                  "bg-primary-50 p-4 rounded-2xl flex items-center justify-center shadow-sm flex flex-col gap-2"
                }
              >
                <div
                  className={
                    "bg-white p-2 flex items-center justify-center w-[200px] h-[200px] rounded-md shadow-sm"
                  }
                >
                  {isLoading ? (
                    <Skeleton variant="rectangle" width={100} height={100} />
                  ) : orderData?.qr_code_value || data?.qr_code_value ? (
                    <QRCode
                      size={100}
                      style={{ height: "150px", width: "150px" }}
                      value={data?.qr_code_value || orderData?.qr_code_value}
                      viewBox={`0 0 256 256`}
                    />
                  ) : (
                    <NoDataFound text="QR code not generated" />
                  )}
                </div>
                <label className={"self-start"}>
                  {t("orders.instructions")}
                </label>
                <p
                  className={`font-medium text-content-500 self-start ${
                    localStorage.getItem("i18nextLng") === "ar"
                      ? "!text-right"
                      : "!text-left"
                  }`}
                >
                  {t("orders.esim_instructions")}
                </p>
              </div>
            </div>

            <div className={"flex flex-col gap-[0.5rem]"}>
              <label
                dir={"ltr"}
                className={`font-semibold ${
                  localStorage.getItem("i18nextLng") === "ar"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                SM-DP+ &nbsp;{t("orders.smdpAddress")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate "}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    data?.smdp_address || orderData?.smdp_address
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      data?.smdp_address || orderData?.smdp_address
                    );
                    toast.success(t("btn.copiedSuccessfully"));
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>
            <div className={"flex flex-col gap-[0.5rem]"}>
              <label className={"font-semibold"}>
                {t("orders.activationCode")}
              </label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate"}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    orderData?.activation_code || data?.activation_code
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      orderData?.activation_code || data?.activation_code
                    );
                    toast.success(t("btn.copiedSuccessfully"));
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>

            {(!import.meta.env.VITE_APP_SEA_OPTION ||
              import.meta.env.VITE_APP_SEA_OPTION == "false") &&
              import.meta.env.VITE_ESIM_INSTALLATION == "true" && (
                <EsimInstallation
                  data={data}
                  orderData={orderData}
                  isLoading={isLoading}
                />
              )}
          </>
        )}

        {!isLoading && !data && !orderData && (
          <NoDataFound
            text={`${t("orders.failedToLoad")}${
              !isAuthenticated ? ` ${t("orders.pleaseSignIn")}` : ""
            } `}
          />
        )}
        {!isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            to={"/signin"}
            component={Link}
          >
            {t("btn.signin_signup")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderPopup;
