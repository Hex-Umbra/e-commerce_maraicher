import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/common/FormField/FormField";
import styles from "./ProfileEdit.module.scss";
import { ROUTES } from "../../utils/routes";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, updateUser, showNotification } = useAuth();

  const initial = useMemo(() => ({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
  }), [user]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) {
      e.name = "Veuillez saisir un nom valide";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      e.email = "Veuillez saisir un email valide";
    }
    if (!form.address || form.address.trim().length < 4) {
      e.address = "Veuillez saisir une adresse valide";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasChanges = () => {
    return form.name !== initial.name || form.email !== initial.email || form.address !== initial.address;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const updated = {
        ...user,
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      };
      // Persist locally via context (backend endpoint not yet available)
      updateUser(updated);
      showNotification("Profil mis à jour.", "success");
      navigate(ROUTES.profile);
    } catch (err) {
      console.error(err);
      showNotification("Échec de la mise à jour du profil.", "error");
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(ROUTES.profile);
  };

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className={styles.profileEdit}>
      <div className="container">
        <h2 className={styles.title}>Modifier mon profil</h2>

        <form className={styles.form} onSubmit={handleSave} noValidate>
          <FormField
            id="name"
            label="Nom et Prénom"
            value={form.name}
            onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            error={errors.name || ""}
            required
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            error={errors.email || ""}
            required
          />

          <FormField
            id="address"
            label="Adresse"
            value={form.address}
            onChange={(v) => setForm((s) => ({ ...s, address: v }))}
            error={errors.address || ""}
            required
          />

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              aria-label="Annuler et revenir au profil"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!hasChanges()}
              aria-label="Enregistrer les modifications"
              title={!hasChanges() ? "Aucune modification à enregistrer" : "Enregistrer"}
            >
              Enregistrer
            </button>
          </div>
        </form>

        <p className={styles.note}>
          Les modifications sont mises à jour localement. La persistance serveur sera ajoutée lorsque l'endpoint sera disponible.
        </p>
      </div>
    </div>
  );
};

export default ProfileEdit;
