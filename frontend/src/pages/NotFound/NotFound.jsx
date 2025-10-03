import React from "react";
import HeroSection from "../../components/common/HeroSection";
import styles from "./NotFound.module.scss";
import { ROUTES } from "../../utils/routes";

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <HeroSection
          title="404 — Page introuvable"
          subtitle="Désolé, la page que vous recherchez n'existe pas ou a été déplacée."
          secondaryLinks={[
            { text: "Aller à l'accueil", link: ROUTES.accueil, variant: 'primary' },
            { text: "Voir nos fermiers", link: ROUTES.nosFermiers, variant: 'secondary' },
            { text: "Explorer les produits", link: ROUTES.produits, variant: 'secondary' }
          ]}
          variant="centered"
        />
      </div>
    </div>
  );
};

export default NotFound;
