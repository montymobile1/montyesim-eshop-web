import React, { useMemo } from "react";
import GenericSwiper from "./GenericSwiper";
import Slide1 from "../../assets/images/swiper/slider-1.png";
import Slide2 from "../../assets/images/swiper/slider-2.png";
import Slide3 from "../../assets/images/swiper/slider-3.png";
import { useTranslation } from "react-i18next";
import { getBannersContent } from "../../core/apis/homeAPI";
import { useQuery } from "react-query";
import { Skeleton } from "@mui/material";

export default function ReferrAndEarnSwiper() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["banners"],
    queryFn: () =>
      getBannersContent().then((res) => {
        return res?.data?.data;
      }),
  });

  return (
    <div className="w-full">
      {isLoading ? (
        <Skeleton variant={"rectangular"} height={200} />
      ) : (
        data && <GenericSwiper slides={data} />
      )}
    </div>
  );
}
