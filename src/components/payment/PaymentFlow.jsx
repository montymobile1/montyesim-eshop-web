import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import { Button } from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { assignBundle, assignTopupBundle } from "../../core/apis/userAPI";
import OtpVerification from "../OtpVerification";
import { FormRadioGroup } from "../shared/form-components/FormComponents";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { StripePayment } from "../stripe-payment/StripePayment";
import ComingSoon from "../wallet/ComingSoon";
import WalletPayment from "../wallet/WalletPayment";
import LoadingPayment from "./LoadingPayment";

const isSupportPromo = import.meta.env.VITE_SUPPORT_PROMO === "true";

const ComponentMap = {
  card: StripePayment,
  dcb: OtpVerification,
  otp: OtpVerification,
  wallet: isSupportPromo ? WalletPayment : ComingSoon,
  loading: LoadingPayment,
};

const typeMap = {
  card: "Card",
  dcb: "DCB",
  otp: "OTP",
  wallet: "Wallet",
};

const PaymentFlow = (props) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const {
    checkedMethod,
    setCheckedMethod,
    setOrderId,
    filteredPaymentTypes,
    handleSuccessOrder,
  } = props;

  const { related_search } = useSelector((state) => state.search);
  const { user_info } = useSelector((state) => state.authentication);
  const login_type = useSelector((state) => state?.currency?.login_type);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const related_search_test = {
    related_search: {
      region: null,
      countries: [
        {
          iso3_code: "AUT",
          country_name: "Austria",
        },
      ],
    },
  };

  const assignMethod = (type) => {
    setLoading(true);

    let handleAPI = iccid ? assignTopupBundle : assignBundle;
    let typeSelected = typeMap?.[type.toLowerCase()];
    //this api is for creating a  payment intent to get client secret
    /*|| "cc3d8d05-6bcc-453e-b6a5-3204489907f3"*/
    handleAPI({
      bundle_code: props?.bundle?.bundle_code,
      payment_type: typeSelected,
      ...(!iccid
        ? {
            related_search: related_search,
            promo_code: state?.promo_code || "",
          }
        : { iccid: iccid }),

      affiliate_code: "",
    })
      .then((res) => {
        setOrderDetail(res?.data?.data);
        setOrderId(res?.data?.data?.order_id);
        setOtpRequested(true);
        if (res?.data?.data?.payment_status == "COMPLETED") {
          handleSuccessOrder(res?.data?.data?.order_id);
        } else {
          setClientSecret(res?.data?.data?.payment_intent_client_secret);
          setStripePromise(loadStripe(res?.data?.data?.publishable_key));

          setLoading(false);
        }
      })
      .catch((e) => {
        console.log(e, "checking cancel error 2", e);
        setLoading(false);

        toast?.error(e?.message || t("payment.failedToLoadPaymentInput"));
      });
  };

  useEffect(() => {
    const currentPrice = state?.new_price ?? props?.bundle?.price;
    if (currentPrice == 0) {
      setSelectedType("card");
      setCheckedMethod(true);
      assignMethod("card");
      return;
    }

    if (filteredPaymentTypes && filteredPaymentTypes?.length === 1) {
      let one_type = filteredPaymentTypes?.[0]?.toLowerCase() || "dcb";
      setSelectedType(one_type);
      setCheckedMethod(true);
      if (one_type?.toLowerCase() !== "wallet") {
        assignMethod(filteredPaymentTypes?.[0]?.toLowerCase() || "dcb");
      }
    } else if (filteredPaymentTypes && filteredPaymentTypes?.length > 1) {
      // Reset selectedType if it's no longer available in filtered list
      if (selectedType && !filteredPaymentTypes.includes(selectedType)) {
        setSelectedType(null);
        setCheckedMethod(false);
      }
    }
  }, [filteredPaymentTypes, state?.new_price, props?.bundle?.price]);

  // Handle cleanup when user navigates away or closes browser

  const Component = useMemo(() => {
    return selectedType
      ? filteredPaymentTypes?.length == 1
        ? ComponentMap?.[filteredPaymentTypes?.[0]?.toLowerCase()]
        : ComponentMap?.[selectedType?.toLowerCase()]
      : null;
  }, [filteredPaymentTypes, selectedType]);

  return (
    <div className={"flex flex-col gap-2 w-full sm:basis-[50%] shrink-0"}>
      <h1>{t("checkout.paymentMethod")}</h1>
      {!checkedMethod ? (
        filteredPaymentTypes?.length !== 0 ? (
          <div className={"flex flex-col gap-[1rem]"}>
            <FormRadioGroup
              data={filteredPaymentTypes}
              value={selectedType}
              onChange={(value) => setSelectedType(value)}
            />

            <div className={"flex flex-row "}>
              <Button
                variant={"contained"}
                color="primary"
                disabled={loading || !selectedType}
                onClick={() => {
                  setCheckedMethod(true);
                  if (selectedType?.toLowerCase() !== "wallet") {
                    assignMethod(selectedType);
                  }
                }}
                endIcon={
                  <ArrowForwardIosOutlinedIcon
                    fontSize="small"
                    sx={{
                      fontSize: 16, // or any px you want
                      ...(localStorage.getItem("i18nextLng") === "ar"
                        ? { transform: "scale(-1,1)", marginRight: "10px" }
                        : {}),
                    }}
                  />
                }
                sx={{
                  width: "50%",
                }}
              >
                {loading ? t("btn.loading") : t("btn.Checkout")}
              </Button>
            </div>
          </div>
        ) : (
          <NoDataFound text={t("checkout.noPaymentMethodsFound")} />
        )
      ) : (
        ""
      )}

      {checkedMethod && (
        <div className={"flex flex-col gap-[0.5rem]"}>
          {Component && (
            <Component
              {...props}
              clientSecret={clientSecret}
              stripePromise={stripePromise}
              key={orderDetail}
              orderDetail={orderDetail}
              related_search={related_search}
              loading={loading}
              verifyBy={
                login_type == "phone" || login_type == "email_phone"
                  ? "sms"
                  : "email"
              }
              phone={user_info?.phone}
              checkout={true}
              recallAssign={() => assignMethod("wallet")}
              handleSuccessOrder={() => {
                handleSuccessOrder();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;
