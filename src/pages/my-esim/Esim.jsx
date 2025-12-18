import { Button, Skeleton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  CustomToggleButton,
  CustomToggleGroup,
} from "../../assets/CustomComponents";
import { NoDataFoundSVG } from "../../assets/icons/Common";
import OrderCard from "../../components/order/OrderCard";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { getMyEsim } from "../../core/apis/userAPI";
import useQueryParams from "../../core/custom-hook/useQueryParams";

const Esim = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    expired: searchParams.get("expired") || "false",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-esim"],
    queryFn: () => getMyEsim().then((res) => res?.data?.data),
  });

  const handleQueryParams = useQueryParams(filters);

  const finalData = useMemo(() => {
    const filtersValue = filters?.expired !== "false";
    return data?.filter((el) => el?.bundle_expired === filtersValue) || [];
  }, [filters?.expired, data]);

  useEffect(() => {
    handleQueryParams();
  }, [filters]);

  return (
    <div className="flex flex-col gap-[1rem]">
      <h1 className="font-bold">{t("esim.title")}</h1>
      <CustomToggleGroup
        color="primary"
        value={filters?.expired}
        onChange={(e) => {
          setFilters({ expired: e.target.value });
        }}
      >
        <CustomToggleButton value={"false"} sx={{ width: "150px" }}>
          {t("esim.current_plans")}
        </CustomToggleButton>
        <CustomToggleButton value={"true"} sx={{ width: "150px" }}>
          {t("esim.expired_plans")}
        </CustomToggleButton>
      </CustomToggleGroup>
      {isLoading ? (
        Array.from({ length: 4 }, (_, i) => ({ id: i })).map((item) => (
          <Skeleton
            key={`esim-skeleton-${item?.id}`}
            variant="rectangle"
            height={100}
            className={"rounded-md"}
          />
        ))
      ) : !data || finalData?.length === 0 ? (
        <NoDataFound
          action={
            filters?.expired === "false" ? (
              <Button
                sx={{ width: "fit-content" }}
                component={Link}
                variant="contained"
                to="/plans"
                color="primary"
              >
                {t("btn.shop_now")}
              </Button>
            ) : (
              ""
            )
          }
          image={<NoDataFoundSVG />}
          text={t(
            filters?.expired === "true"
              ? "noDataFound.no_expired_plans"
              : "noDataFound.no_active_plans"
          )}
        />
      ) : (
        finalData?.map((el, index) => (
          <OrderCard
            order={{ bundle_details: el }}
            key={`${el?.bundle_code}-${index}`}
            myesim
            refetchData={refetch}
          />
        ))
      )}
    </div>
  );
};

export default Esim;
