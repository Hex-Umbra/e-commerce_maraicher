import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginSection.module.scss";

const LoginSection = () => {
  const { signIn, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    clearError();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear form errors
    setFormErrors({});

    try {
      const result = await signIn(formData);

      if (result.success) {
        setSuccessMessage(result.message);
        // Reset form
        setFormData({
          email: "",
          password: "",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <section className={styles.loginSection}>
      <div className={`container ${styles.contentWrapper}`}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {/* Success Message */}
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {/* General Error Message */}
          {error && <div className={styles.errorMessage}>{error}</div>}

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

          <button
            type="submit"
            className={`${styles.submitBtn} ${
              loading ? styles.submitBtnLoading : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connexion en cours..." : "Connexion"}
          </button>
        </form>
        <div className={styles.welcomeText}>
          <h2>
            <em>Bon retour !</em>
          </h2>
          <p>Connectez-vous pour accéder à votre compte !</p>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;
