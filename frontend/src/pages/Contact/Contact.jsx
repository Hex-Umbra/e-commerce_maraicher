import { useState } from "react";
import { supportAPI } from "../../services/api";
import styles from "./Contact.module.scss";

const Contact = () => {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!subject.trim() || !title.trim() || !message.trim()) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await supportAPI.sendContact({
        subject: subject.trim(),
        title: title.trim(),
        message: message.trim(),
      });
      setSuccessMsg("Votre message a été envoyé au support.");
      setSubject("");
      setTitle("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err.message || "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <div className={`container ${styles.contentWrapper}`}>
        <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="subject">
              Objet
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de votre demande"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">
              Titre
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du message"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre demande..."
              required
              rows={5}
            />
          </div>

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
    </section>
  );
};

export default Contact;
