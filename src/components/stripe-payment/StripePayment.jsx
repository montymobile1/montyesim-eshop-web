//UTILTIIES
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
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
import NoDataFound from "../shared/no-data-found/NoDataFound";

const schema = yup.object().shape({
  card: yup.string().nullable(),
});

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
}) => {
  const { t } = useTranslation();
  const { iccid } = useParams();
  const elements = useElements({ locale: localStorage.getItem("i18nextLng") });
  const stripe = useStripe();

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      card: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = () => {
    if (!stripe || !elements) {
      toast.error(t("stripe.paymentProcessingError"));
      return;
    }

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
      <>
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
              if (fromUpgradeWallet) {
                onClose();
              } else {
                handleCancelOrder();
              }
            }}
          >
            {t("btn.cancel")}
          </Button>
        </div>
      </>
    </div>
  );
};

export default InjectedCheckout;
