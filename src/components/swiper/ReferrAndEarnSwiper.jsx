import React from "react";
import GenericSwiper from "./GenericSwiper";

import { getBannersContent } from "../../core/apis/homeAPI";
import { useQuery } from "react-query";
import { Skeleton } from "@mui/material";

export default function ReferrAndEarnSwiper() {
  const { data, isLoading } = useQuery({
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
