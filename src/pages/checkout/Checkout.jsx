//UTILITIES
import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
//API
import { getBundleById } from "../../core/apis/bundlesAPI";
//REDUCER
import { LimitedSignOut } from "../../redux/reducers/authReducer";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import PaymentFlow from "../../components/payment/PaymentFlow";
import PaymentSummary from "../../components/payment/PaymentSummary";
import TmpLogin from "../../components/tmp-login/TmpLogin";
import { cancelOrder } from "../../core/apis/userAPI";
import { queryClient } from "../../main";

const Checkout = () => {
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const { allowed_payment_types } = useSelector((state) => state?.currency);
  const { user_info } = useSelector((state) => state.authentication);
  const { id } = useParams();
  const { iccid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [checkedMethod, setCheckedMethod] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const state = location.state;

  const { data, isLoading, error } = useQuery({
    queryKey: [`${id}-details`],
    queryFn: () => getBundleById(id).then((res) => res?.data?.data),
    enabled: !!id,
  });
  const confirmed = useMemo(() => {
    return isAuthenticated || tmp?.isAuthenticated;
  }, [isAuthenticated, tmp]);

  const handleCancelOrder = async () => {
    const currentPrice = state?.new_price ?? data?.price;
    if (orderId) {
      try {
        await cancelOrder(orderId);
      } catch (err) {
        console.error("Cancel order failed:", err);
      }
      setOrderId(null);
    }

    if (checkedMethod && filteredPaymentTypes?.length !== 1) {
      currentPrice == 0 ? navigate("/plans") : setCheckedMethod(false);
    } else {
      currentPrice == 0 ? navigate("/plans") : navigate(-1);
      dispatch(LimitedSignOut());
    }
  };

  const handleSuccessOrder = (id) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("order_id", id ? id : orderId);
    localStorage.removeItem("referral_code");

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["my-esim"] });
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
      if (iccid) {
        queryClient.invalidateQueries({
          queryKey: [`esim-detail-${iccid}`],
        });
      }

      navigate({
        pathname: iccid ? `/esim/${iccid}` : "/plans",
        search: !iccid ? `?${searchParams.toString()}` : "",
      });
    }, 5000);
  };

  const filteredPaymentTypes = useMemo(() => {
    if (!allowed_payment_types) return [];

    const currentPrice = state?.new_price ?? data?.price;
    const userBalance = user_info?.balance || 0;

    return allowed_payment_types.filter((paymentType) => {
      const paymentTypeLower = paymentType?.toLowerCase();

      // Hide wallet option if user balance is insufficient
      if (paymentTypeLower === "wallet" && userBalance < currentPrice) {
        return false;
      }

      // Hide DCB and wallet options for non-authenticated users
      if (
        !isAuthenticated &&
        (paymentTypeLower === "dcb" || paymentTypeLower === "wallet")
      ) {
        return false;
      }

      return true;
    });
  }, [
    allowed_payment_types,
    user_info?.balance,
    data,
    isAuthenticated,
    tmp?.isAuthenticated,
  ]);

  return (
    <div
      className={
        "flex flex-col gap-4 w-full max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      }
    >
      <div
        className={
          "flex flex-row gap-2 items-center font-semibold cursor-pointer"
        }
        onClick={() => {
          handleCancelOrder();
        }}
      >
        <ArrowBackIosNewIcon
          sx={
            localStorage.getItem("i18nextLng") === "ar"
              ? { transform: "scale(-1,1)" }
              : {}
          }
          color="primary"
          fontSize="small"
        />{" "}
        {t("checkout.goBack")}
      </div>

      <div
        className={
          "flex flex-col-reverse items-start gap-4 w-full sm:flex-row sm:items-start sm:gap-4 sm:w-full"
        }
      >
        <PaymentFlow
          bundle={data}
          filteredPaymentTypes={filteredPaymentTypes}
          checkedMethod={checkedMethod}
          setCheckedMethod={setCheckedMethod}
          handleCancelOrder={handleCancelOrder}
          handleSuccessOrder={handleSuccessOrder}
          setOrderId={setOrderId}
          confirmed={confirmed}
          bundleDataLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Checkout;
