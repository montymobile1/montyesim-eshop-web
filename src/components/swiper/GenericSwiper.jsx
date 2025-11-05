import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/pagination";
import "./GenericSwiper.css";

const GenericSwiper = ({ slides }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <Swiper
      key={localStorage.getItem("i18nextLng")}
      modules={[Pagination, Autoplay]}
      autoplay={{ delay: 5000 }}
      loop={true}
      dir={localStorage.getItem("i18nextLng") === "ar" ? "rtl" : "ltr"}
      pagination={{
        clickable: true,
        bulletClass: "swiper-pagination-bullet custom-bullet",
        bulletActiveClass:
          "swiper-pagination-bullet-active custom-bullet-active",
      }}
      className="rounded-[40px] overflow-hidden"
    >
      {slides?.map((slide) => (
        <SwiperSlide key={slide?.id}>
          <div
            className="h-[365px] sm:h-[365px] md:h-[365px] w-full bg-cover bg-center flex items-center justify-start"
            style={{ backgroundImage: `url(${slide?.image})` }}
          >
            <div
              className={`w-full h-full flex items-center justify-start px-8 sm:px-16`}
            >
              <div className="max-w-md text-white">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                  {slide?.title}
                </h2>
                <p className="text-base sm:text-lg mb-6">
                  {slide?.description}
                </p>
                {!pathname?.includes("refer-earn") && (
                  <button
                    className="bg-white text-gray-900 font-semibold py-2 px-5 rounded-full hover:bg-[#EB224D] hover:text-white transition"
                    onClick={(e) => slide?.onClickBtn?.()}
                  >
                    {t(`swiper.start_sharing`)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default GenericSwiper;
