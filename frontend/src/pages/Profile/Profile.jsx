import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileCard from "../../components/common/ProfileCard";
import styles from "./Profile.module.scss";
import { ROUTES } from "../../utils/routes";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className={styles.profile}>
      <div className="container">
        <h2 className={styles.title}>Mon Profil</h2>

        <div className={styles.cardWrap}>
          <ProfileCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
