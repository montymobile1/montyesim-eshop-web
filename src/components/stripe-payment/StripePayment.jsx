//UTILTIIES
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
//API
//COMPONENT
import { Button, Skeleton } from "@mui/material";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { logAnalyticsEventWithUser } from "../../core/helpers/CommonHelpers";
import NoDataFound from "../shared/no-data-found/NoDataFound";

export const StripePayment = (props) => {
  const { t } = useTranslation();
  const {
    stripePromise,
    clientSecret,
    orderDetail,
    loading,
    fromUpgradeWallet = false,
    onClose = () => {},
  } = props;

  // Enable the skeleton loader UI for the optimal loading experience.
  const loader = "auto";

  return loading ? (
    <div className={"w-full sm:basis-[50%] shrink-0"}>
      <Skeleton variant="rectangular" height={150} />
    </div>
  ) : stripePromise && clientSecret ? (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        loader,
        locale: localStorage.getItem("i18nextLng"),
      }}
    >
      <InjectedCheckout
        {...props}
        orderDetail={orderDetail}
        fromUpgradeWallet={fromUpgradeWallet}
        onClose={onClose}
      />
    </Elements>
  ) : (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <NoDataFound text={t("stripe.failedToLoadPaymentInputs")} />
    </div>
  );
};

const InjectedCheckout = ({
  orderDetail,
  onClose,
  fromUpgradeWallet,
  handleCancelOrder,
  handleSuccessOrder,
  bundle,
}) => {
  const { t } = useTranslation();
  const elements = useElements({ locale: localStorage.getItem("i18nextLng") });
  const stripe = useStripe();
  const { user_info } = useSelector((state) => state.authentication);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = () => {
    if (!stripe || !elements) {
      toast.error(t("stripe.paymentProcessingError"));
      return;
    }

    // Log Firebase Analytics event when user clicks pay
    logAnalyticsEventWithUser("stripe-pay", {
      bundle_code: bundle?.bundle_code || "",
      bundle_name: bundle?.bundle_name || "",
      user: user_info?.email || "temp user",
      order_id: orderDetail?.order_id || "",
      method: "Card",
    });

    setIsSubmitting(true);
    stripe
      .confirmPayment({
        elements,
        redirect: "if_required",
      })
      .then(function (result) {
        if (result.error) {
          toast.error(result.error?.message);
        } else {
          // Log Firebase Analytics event on payment success
          logAnalyticsEventWithUser("stripe-payment-successful", {
            bundle_code: bundle?.bundle_code || "",
            bundle_name: bundle?.bundle_name || "",
            user: user_info?.email || "temp user",
            order_id: orderDetail?.order_id || "",
            method: "Card",
          });

          if (fromUpgradeWallet) {
            toast.success(t("stripe.wallet_topped_up_successfully"));
            return onClose();
          }

          handleSuccessOrder();
        }
      })
      .catch((error) => {
        toast.error(error?.message || t("stripe.paymentConfirmationFailed"));
      })
      .finally(() =>
        setTimeout(() => {
          setIsSubmitting(false);
        }, 5000)
      );
  };

  const handleChange = (value) => {
    console.log(value);
  };

  return (
    <div className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}>
      <PaymentElement id="payment-element" onChange={handleChange} />

      <div className={"flex flex-row gap-[0.5rem]"}>
        <Button
          color="secondary"
          variant="contained"
          sx={{ width: "60%" }}
          disabled={isSubmitting}
          onClick={() => handleSubmitForm()}
        >
          {t("btn.payNow")}
        </Button>
        <Button
          color="primary"
          variant="contained"
          sx={{ width: "60%" }}
          onClick={() => {
            handleCancelOrder();
            if (fromUpgradeWallet) {
              onClose();
            }
          }}
        >
          {t("btn.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default InjectedCheckout;
