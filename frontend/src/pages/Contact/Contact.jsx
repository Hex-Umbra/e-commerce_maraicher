import { useState, useEffect } from "react";
import FormField from "../../components/common/FormField";
import SEO from "../../components/SEO";
import { supportAPI } from "../../services/api";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notification from "../../components/Notification/Notification";
import styles from "./Contact.module.scss";

const Contact = () => {
  const location = useLocation();
  const { user } = useAuth();
  const prefillSubject = new URLSearchParams(location.search).get("subject") || "";
  const [subject, setSubject] = useState(prefillSubject);
  const [title, setTitle] = useState("");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [notification, setNotification] = useState(null);

  // Update email when user data loads
  useEffect(() => {
    if (user?.email && !userEmail) {
      setUserEmail(user.email);
    }
  }, [user, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setNotification(null);

    // Check which fields are empty for better debugging
    const emptyFields = [];
    if (!subject.trim()) emptyFields.push("Objet");
    if (!title.trim()) emptyFields.push("Titre");
    if (!userEmail.trim()) emptyFields.push("Email");
    if (!message.trim()) emptyFields.push("Message");

    if (emptyFields.length > 0) {
      const errorMessage = `Veuillez remplir tous les champs. Champs manquants: ${emptyFields.join(", ")}`;
      setErrorMsg(errorMessage);
      setNotification({
        message: `❌ ${errorMessage}`,
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      const errorMessage = "Veuillez entrer une adresse email valide.";
      setErrorMsg(errorMessage);
      setNotification({
        message: `❌ ${errorMessage}`,
        type: "error",
        isVisible: true,
      });
      return;
    }

    setLoading(true);
    try {
      await supportAPI.sendContact({
        subject: subject.trim(),
        title: title.trim(),
        userEmail: userEmail.trim(),
        userName: user?.name || "Utilisateur anonyme",
        userId: user?._id || null,
        message: message.trim(),
      });
      setSuccessMsg("Votre message a été envoyé au support.");
      setNotification({
        message: "✉️ Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.",
        type: "success",
        isVisible: true,
      });
      setSubject("");
      setTitle("");
      if (!user) setUserEmail("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err.message || "Une erreur est survenue lors de l'envoi.");
      setNotification({
        message: `❌ ${err.message || "Une erreur est survenue lors de l'envoi."}`,
        type: "error",
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <SEO
        title="Nous Contacter"
        description="Une question, un problème ou un retour à nous transmettre ? Contactez notre équipe de support. Nous vous répondrons dans les plus brefs délais."
        keywords="contact, support, aide, service client, nous contacter"
        canonical="https://mff-weld.vercel.app/contact"
        ogType="website"
      />
      <div className={`container ${styles.contentWrapper}`}>
        <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
          <FormField
            id="subject"
            label="Objet"
            type="text"
            value={subject}
            onChange={setSubject}
            placeholder="Sujet de votre demande"
            required
            disabled={loading}
          />

          <FormField
            id="title"
            label="Titre"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Titre du message"
            required
            disabled={loading}
          />

          <FormField
            id="userEmail"
            label="Votre email"
            type="email"
            value={userEmail}
            onChange={setUserEmail}
            placeholder="votre.email@exemple.com"
            required
            disabled={loading || !!user}
            helpText={user ? "Email de votre compte" : "Pour que nous puissions vous répondre"}
          />

          <FormField
            id="message"
            label="Message"
            type="textarea"
            value={message}
            onChange={setMessage}
            placeholder="Décrivez votre demande..."
            required
            rows={5}
            disabled={loading}
          />

          {successMsg && (
            <div className={styles.successMessage}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className={styles.errorMessage}>{errorMsg}</div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>

        <div className={styles.infoText}>
          <h2>
            <em>Nous contacter</em>
          </h2>
          <p>
            Une question, un problème ou un retour à nous transmettre ? Utilisez
            ce formulaire pour joindre notre support. Nous vous répondrons dans
            les plus brefs délais.
          </p>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
    </section>
  );
};

export default Contact;
