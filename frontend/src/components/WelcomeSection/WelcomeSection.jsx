import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./WelcomeSection.module.scss";

const WelcomeSection = () => {
  const { signUp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.address.trim()) {
      errors.address = "L'adresse est requise";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    clearError();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear form errors
    setFormErrors({});

    // Prepare data for API (exclude confirmPassword)
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...signUpData } = formData;

    try {
      const result = await signUp(signUpData);

      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
        // Navigate to homepage immediately
        navigate("/accueil");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <section className={styles.welcomeSection}>
      <div className={`container ${styles.contentWrapper}`}>
        <div className={styles.welcomeText}>
          <h2>
            <em>Bienvenue !</em>
          </h2>
          <p>Rejoignez notre site et faite partie de la communauté !</p>
        </div>
        <form className={styles.signupForm} onSubmit={handleSubmit}>
          {/* General Error Message */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Nom et prénom</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={formErrors.name ? styles.inputError : ""}
              disabled={loading}
            />
            {formErrors.name && (
              <span className={styles.fieldError}>{formErrors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? styles.inputError : ""}
              disabled={loading}
            />
            {formErrors.email && (
              <span className={styles.fieldError}>{formErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Adresse</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className={formErrors.address ? styles.inputError : ""}
              disabled={loading}
            />
            {formErrors.address && (
              <span className={styles.fieldError}>{formErrors.address}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de Passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={formErrors.password ? styles.inputError : ""}
              disabled={loading}
            />
            {formErrors.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={formErrors.confirmPassword ? styles.inputError : ""}
              disabled={loading}
            />
            {formErrors.confirmPassword && (
              <span className={styles.fieldError}>
                {formErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`${styles.submitBtn} ${
              loading ? styles.submitBtnLoading : ""
            }`}
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "Inscription"}
          </button>
        </form>
      </div>
    </section>
  );
};

// PropTypes validation
WelcomeSection.propTypes = {
  // Currently no props are passed to this component
  // Adding this for future-proofing and consistency
};

export default WelcomeSection;
