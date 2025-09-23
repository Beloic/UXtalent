import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, User, Briefcase, MessageSquare, BarChart3, DollarSign } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

export default function ProfileTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCandidate, isRecruiter } = usePermissions();

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes("/my-profile/profile")) return "view";
    if (path.includes("/my-profile/talent")) return "talents";
    if (path.includes("/my-profile/stats")) return "stats";
    if (path.includes("/my-profile/plan")) return "plan";
    if (path.includes("/my-profile/offers")) return "offers";
    if (path.includes("/my-profile/offer")) return "offer";
    if (path.includes("/my-profile/forum")) return "forum";
    return "view";
  };

  const activeTab = getActiveTabFromPath();

  const navigateToTab = (tabName) => {
    if (isCandidate) {
      switch (tabName) {
        case "view":
          navigate("/my-profile/profile");
          break;
        case "talents":
          navigate("/my-profile/talent");
          break;
        case "stats":
          navigate("/my-profile/stats");
          break;
        case "plan":
          navigate("/my-profile/plan");
          break;
        case "offers":
          navigate("/my-profile/offers");
          break;
        case "forum":
          navigate("/my-profile/forum");
          break;
        default:
          navigate("/my-profile/profile");
      }
    } else if (isRecruiter) {
      switch (tabName) {
        case "offer":
          navigate("/my-profile/offer");
          break;
        case "plan":
          navigate("/my-profile/plan");
          break;
        default:
          navigate("/my-profile/offer");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 flex">
      {isCandidate && (
        <>
          <button
            onClick={() => navigateToTab("view")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "view" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="w-5 h-5" />
            Profil
          </button>
          <button
            onClick={() => navigateToTab("talents")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "talents" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-5 h-5" />
            Talents
          </button>
          <button
            onClick={() => navigateToTab("offers")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "offers" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Offres
          </button>
          <button
            onClick={() => navigateToTab("forum")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "forum" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Forum
          </button>
          <button
            onClick={() => navigateToTab("stats")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "stats" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Statistiques
          </button>
          <button
            onClick={() => navigateToTab("plan")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "plan" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Mon plan
          </button>
        </>
      )}
      {isRecruiter && (
        <>
          <button
            onClick={() => navigateToTab("offer")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "offer" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Mon offre
          </button>
          <button
            onClick={() => navigateToTab("plan")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
              activeTab === "plan" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Mon plan
          </button>
        </>
      )}
    </div>
  );
}


