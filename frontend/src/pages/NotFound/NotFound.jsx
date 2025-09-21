import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.scss";
import accueilStyles from "../Accueil/Accueil.module.scss";
import { ROUTES } from "../../utils/routes";

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <section className={accueilStyles.hero}>
          <div className={`${accueilStyles.heroInner} ${styles.center}`}>
            <h1 className={styles.title}>404 — Page introuvable</h1>
            <p className={styles.subtitle}>
              Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
            </p>
            <div className={styles.links}>
              <Link to={ROUTES.accueil} className={styles.linkBtn}>Aller à l&apos;accueil</Link>
              <Link to={ROUTES.nosFermiers} className={styles.linkBtnSecondary}>Voir nos fermiers</Link>
              <Link to={ROUTES.produits} className={styles.linkBtnSecondary}>Explorer les produits</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotFound;
