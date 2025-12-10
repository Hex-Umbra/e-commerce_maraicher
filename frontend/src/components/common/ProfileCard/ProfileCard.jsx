import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "../../../utils/routes";
import { getDefaultAvatar } from "../../../utils/defaults";
import styles from "./ProfileCard.module.scss";
import { FiEdit2 } from "react-icons/fi";

/**
 * ProfileCard
 * - Displays connected user's profile information with role awareness.
 * - Actions:
 *   - Voir mes Commandes
 *   - Voir mon Panier
 *   - Floating edit button (calls onEdit if provided, otherwise navigates to ?edit=1)
 */
const ProfileCard = ({ user: userProp, onEdit }) => {
  const navigate = useNavigate();
  const { user: userCtx } = useAuth();

  const user = userProp || userCtx || {};

  const displayName = user?.name || "Nom et Prénom";
  const email = user?.email || "";
  const address = user?.address || "";
  const role = user?.role || "client";

  const roleLabel = role === "producteur" ? "Producteur" : role === "admin" ? "Admin" : "Client";

  // Use uploaded profile picture if available, otherwise use default avatar
  const avatarSrc = user?.profilePicture || getDefaultAvatar(displayName);

  const goToOrders = () => {
    navigate(ROUTES.orders);
  };

  const goToCart = () => {
    navigate(ROUTES.cart);
  };

  const handleEdit = () => {
    if (typeof onEdit === "function") {
      onEdit(user);
    } else {
      // Navigate to dedicated profile edit page
      navigate(ROUTES.profileEdit, { replace: false });
    }
  };

  return (
    <section className={styles.profileCard} role="region" aria-label="Profil utilisateur">
      <div className={styles.headerRow}>
        <div className={styles.avatarWrap}>
          <img
            src={avatarSrc}
            alt={`Photo de ${displayName}`}
            className={styles.avatar}
            loading="lazy"
          />
        </div>

        <div className={styles.info}>
          <h2 className={styles.name}>{displayName}</h2>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{email || "—"}</span>
          </div>

          <div className={`${styles.field} ${styles.address}`}>
            <span className={styles.fieldLabel}>Adresse</span>
            <span className={styles.fieldValue}>{address || "—"}</span>
          </div>

          <div className={styles.role} aria-label="Rôle utilisateur">
            {roleLabel}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.ordersBtn}`}
          onClick={goToOrders}
          aria-label="Voir mes commandes"
        >
          Voir mes Commandes
        </button>

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.cartBtn}`}
          onClick={goToCart}
          aria-label="Voir mon panier"
        >
          Voir mon Panier
        </button>
      </div>

      <button
        type="button"
        className={styles.editFab}
        onClick={handleEdit}
        aria-label="Modifier mon profil"
        title="Modifier mon profil"
      >
        <FiEdit2 aria-hidden="true" color="white"/>
      </button>
    </section>
  );
};

ProfileCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    role: PropTypes.oneOf(["admin", "producteur", "client"]),
  }),
  onEdit: PropTypes.func,
};

export default ProfileCard;
