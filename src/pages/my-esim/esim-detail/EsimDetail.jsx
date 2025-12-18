//UTILITIES
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { NoDataFoundSVG } from "../../../assets/icons/Common";
import OrderCard from "../../../components/order/OrderCard";
import NoDataFound from "../../../components/shared/no-data-found/NoDataFound";
import { getMyEsimByIccid } from "../../../core/apis/userAPI";
import { fetchUserInfo } from "../../../redux/reducers/authReducer";

const EsimDetail = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { iccid } = useParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`esim-detail-${iccid}`],
    queryFn: () => getMyEsimByIccid(iccid).then((res) => res?.data?.data),
    enabled: !!iccid,
    onSuccess: () => dispatch(fetchUserInfo()),
  });

  return (
    <div className={"flex flex-col gap-[1rem]"}>
      <Link
        to="/esim"
        className={
          "flex flex-row gap-2 items-center font-semibold cursor-pointer"
        }
      >
        <ArrowBackIosNewIcon color="primary" fontSize="medium" />{" "}
        <h1>{t("esim.esim_detail")}</h1>
      </Link>
      {!iccid ? (
        <NoDataFound
          image={<NoDataFoundSVG />}
          text={t("noDataFound.no_valid_iccid")}
        />
      ) : isLoading ? (
        <Skeleton variant="rectangle" height={100} className={"rounded-md"} />
      ) : !data || error ? (
        <NoDataFound
          image={<NoDataFoundSVG />}
          text={t("noDataFound.no_data_matching_iccid")}
        />
      ) : (
        <OrderCard
          order={{ bundle_details: data }}
          myesim
          refetchData={refetch}
        />
      )}
    </div>
  );
};

export default EsimDetail;
