import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import {
  extractAuthUserProfile,
  getDecodedToken,
  getStoredDashboardMeta,
  getStoredUserProfile,
  removeToken,
  setStoredUserProfile,
} from "../../utils/auth";
import Loader from "../Loader/loader";
import { resetAllState } from "../../redux/store";

type DecodedUserToken = {
  id?: number | string;
  name?: string;
  email?: string;
  employee_id?: string;
  employeeId?: string;
  role?: string;
  role_name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  data?: {
    id?: number | string;
    name?: string;
    email?: string;
    employee_id?: string;
    employeeId?: string;
    role?: string;
    role_name?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  profile?: {
    id?: number | string;
    name?: string;
    email?: string;
    employee_id?: string;
    employeeId?: string;
    role?: string;
    role_name?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    employee_id?: string;
    employeeId?: string;
    role?: string;
    role_name?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
};

const getFirstFilledValue = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const token = getDecodedToken<DecodedUserToken>();
  const storedProfile = getStoredUserProfile();
  const dashboardMeta = getStoredDashboardMeta();
  const derivedProfile = useMemo(
    () => (token ? extractAuthUserProfile({ user: token }) : null),
    [token]
  );

  useEffect(() => {
    if (derivedProfile) {
      setStoredUserProfile(derivedProfile);
    }
  }, [derivedProfile]);

  const tokenSources = [
    derivedProfile,
    token,
    token?.user,
    token?.data,
    token?.profile,
    storedProfile,
  ];

  const userName =
    getFirstFilledValue(
      dashboardMeta?.name,
      ...tokenSources.map((source) => source?.name),
      ...tokenSources.map((source) =>
        getFirstFilledValue(source?.first_name, source?.last_name)
      ),
      ...tokenSources.map((source) => source?.username)
    ) || "User";

  const userEmail =
    getFirstFilledValue(...tokenSources.map((source) => source?.email)) || "-";

  const employeeId =
    getFirstFilledValue(
      ...tokenSources.map((source) => source?.employee_id),
      ...tokenSources.map((source) => source?.employeeId)
    ) || "-";

  const userRole =
    getFirstFilledValue(
      ...tokenSources.map((source) => source?.role),
      ...tokenSources.map((source) => source?.role_name)
    ) || "User";

  const avatarLetter = (userName?.charAt(0) || employeeId?.charAt(0) || "U").toUpperCase();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    setIsLoggingOut(true);
    closeDropdown();

    setTimeout(() => {
      removeToken();
      resetAllState();
      navigate("/signin");
      setIsLoggingOut(false);
    }, 1500);
  };

  return (
    <div className="relative">
      {isLoggingOut && <Loader />}

      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2.5 py-1.5 shadow-theme-xs transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/60 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-brand-500/40 dark:hover:bg-gray-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F37440] to-[#C9552B] text-sm font-bold text-white shadow-lg shadow-[#F37440]/20">
          {avatarLetter}
        </span>

        <span className="hidden min-w-0 sm:flex sm:flex-col sm:items-start">
          <span className="max-w-[140px] truncate text-sm font-semibold text-gray-900 dark:text-white">
            {userName}
          </span>
           
        </span>

        <svg
          className={`hidden h-4 w-4 text-gray-500 transition-transform duration-200 sm:block dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 w-[320px] overflow-hidden rounded-[5px] border border-gray-200 bg-white p-0 shadow-xl shadow-gray-200/70 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/25"
      >
        <div className="border-b border-gray-200 bg-gradient-to-br from-[#FFF8F4] via-[#FFFFFF] to-[#FFF2EA] px-4 py-4 dark:border-gray-700 dark:from-[#1B2435] dark:via-[#0F172A] dark:to-[#111827]">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F37440] to-[#C9552B] text-base font-bold text-white shadow-lg shadow-[#F37440]/20">
              {avatarLetter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                {userName}
              </p>
              
              
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill=""
            />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
