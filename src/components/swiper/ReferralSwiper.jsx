import React from "react";
import GenericSwiper from "./GenericSwiper";
import { useNavigate } from "react-router-dom";
import Slide1 from "../../assets/images/swiper/slider-1.png";
import Slide2 from "../../assets/images/swiper/slider-2.png";
import Slide3 from "../../assets/images/swiper/slider-3.png";
import Slide4 from "../../assets/images/swiper/slider-4.png";
export default function ReferralSwiper() {
  const navigate = useNavigate();
  const slides = [
    {
      id: 3,
      title: "Refer Your Friends",
      subtitle: "Invite your friends to experience",
      buttonText: "Start Sharing",
      backgroundImage: Slide1,
      onClickBtn: () => {
        navigate("/refer-earn");
      },
    },
    {
      id: 1,
      title: "Discount for Your Friends",
      subtitle:
        "Your friends get $3 off their first eSIM purchase using your referral code.",
      buttonText: "Start Sharing",
      backgroundImage: Slide2,
      onClickBtn: () => {
        navigate("/refer-earn");
      },
    },
    {
      id: 4,
      title: "Referral Rewards for You",
      subtitle: "You'll earn $3 wallet credit for each successful referral.",
      buttonText: "Start Sharing",
      backgroundImage: Slide3,
      onClickBtn: () => {
        navigate("/refer-earn");
      },
    },
    {
      id: 2,
      title: "Enjoy Cashback Rewards",
      subtitle:
        "10% cashback rewards will be credited to your wallet upon completing your third transaction.",
      buttonText: "Start Sharing",
      backgroundImage: Slide4,
      onClickBtn: () => {
        navigate("/refer-earn");
      },
    },
  ];
  return (
    <div className="max-w-screen-xl w-full mx-auto px-4 mb-10">
      <GenericSwiper slides={slides} />
    </div>
  );
}
