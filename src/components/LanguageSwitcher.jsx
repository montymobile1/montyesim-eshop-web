import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../core/apis/authAPI.jsx";
import { supportedLanguages } from "../core/variables/ProjectVariables.jsx";
import { queryClient } from "../main.jsx";
import { UpdateAuthInfo } from "../redux/reducers/authReducer.jsx";
import { setDirection } from "../redux/reducers/directionSlice.jsx";

const LanguageSwitcher = () => {
  const [openModal, setOpenModal] = useState(false);
  const { isAuthenticated, user_info } = useSelector(
    (state) => state.authentication
  );
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  const modalRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const direction = lng === "ar" ? "rtl" : "ltr";
    dispatch(setDirection(direction));
    localStorage.setItem("i18nextLng", lng); // Save selected language
    document.documentElement.dir = direction;
    setOpenModal(false);
    queryClient.invalidateQueries();
    if (isAuthenticated) {
      updateUserInfo({ ...user_info, language: lng }).then((res) => {
        if (res?.data?.status === "success") {
          dispatch(UpdateAuthInfo(res?.data?.data?.user_info));
        }
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
      }
    };

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  return (
    supportedLanguages?.length > 1 && (
      <div
        ref={modalRef}
        className={`relative group`}
        style={{ margin: "0 10px" }}
      >
        <button
          onClick={() => setOpenModal(!openModal)}
          className="bg-white rounded p-1 flex items-center space-x-1 text-base font-medium"
        >
          {
            supportedLanguages?.find((lang) => lang.code === i18n?.language)
              ?.flag
          }
          <KeyboardArrowDownIcon fontSize="small" />
        </button>
        {openModal && (
          <div
            className={`absolute ${
              i18n.language === "en" ? "right-0" : "left-0"
            } mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
          >
            <div className="py-1">
              {supportedLanguages?.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language?.code)}
                  className={clsx(
                    `w-full font-semibold text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2`,
                    {
                      "bg-gray-50 text-secondary":
                        i18n.language === language.code,
                    }
                  )}
                >
                  <span>{language?.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default LanguageSwitcher;
