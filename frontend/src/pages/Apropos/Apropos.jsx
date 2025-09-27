import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import styles from "./Apropos.module.scss";

const Apropos = () => {
  return (
    <div className={styles.apropos}>
      <div className="container">

          <section className={styles.main}>
            <h1 className={styles.title}>À propos du projet</h1>

          <section className={styles.section}>
            <h2>Contexte académique</h2>
            <p>
              Ce projet a été réalisé dans le cadre d’un travail académique. L’objectif était
              d’identifier une problématique réelle rencontrée par les maraîchers et d’y répondre
              à travers une solution numérique conforme à un cahier des charges précis.
              La plateforme vise à faciliter la mise en relation entre producteurs locaux et
              consommateurs, tout en simplifiant la gestion des ventes en ligne.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Problématique</h2>
            <ul>
              <li>Manque de visibilité des producteurs locaux auprès des consommateurs.</li>
              <li>Complexité logistique pour la gestion des commandes et de la disponibilité.</li>
              <li>Difficulté à fidéliser une clientèle sans outils de communication adaptés.</li>
              <li>Besoin d’une interface simple pour présenter l’offre et recevoir des commandes.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Cahier des charges et objectifs</h2>
            <ul>
              <li>Proposer une interface claire et accessible pour tous les profils d’utilisateurs.</li>
              <li>Présenter les producteurs et leurs produits avec des informations détaillées.</li>
              <li>Permettre la navigation par catégories, la recherche et le filtrage.</li>
              <li>Intégrer un panier et un processus de commande simples et sécurisés.</li>
              <li>Gérer l’authentification et les rôles (client, producteur/administration).</li>
              <li>Recueillir des avis/commentaires pour instaurer la confiance.</li>
              <li>Assurer un canal de contact/support pour les demandes spécifiques.</li>
              <li>Respecter les bonnes pratiques d’accessibilité et de protection des données.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Fonctionnalités clés</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.card}>
                <h3>Catalogue produits</h3>
                <p>
                  Parcours des produits, fiches détaillées, filtres et recherche
                  pour trouver rapidement des fruits et légumes de saison.
                </p>
              </div>
              <div className={styles.card}>
                <h3>Panier et commandes</h3>
                <p>
                  Ajout au panier, suivi du total, passage de commande et notifications
                  e-mail automatiques.
                </p>
              </div>
              <div className={styles.card}>
                <h3>Profils producteurs</h3>
                <p>
                  Présentation des fermes, méthodes de culture, localisation et mise
                  en avant des pratiques responsables.
                </p>
              </div>
              <div className={styles.card}>
                <h3>Avis et commentaires</h3>
                <p>
                  Système d’évaluation et de retours clients pour améliorer la confiance
                  et la qualité de service.
                </p>
              </div>
              <div className={styles.card}>
                <h3>Authentification</h3>
                <p>
                  Création de compte, connexion et gestion de session pour une expérience
                  personnalisée et sécurisée.
                </p>
              </div>
              <div className={styles.card}>
                <h3>Support et contact</h3>
                <p>
                  Formulaire de contact pour l’assistance, les partenariats ou les demandes
                  spécifiques (ex. paniers, événements).
                </p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Méthodologie et technologies</h2>
            <ul>
              <li>Approche centrée utilisateur (collecte de besoins, itérations de maquettes).</li>
              <li>Front-end: React + Vite, composants modulaires, styles SCSS modulaires.</li>
              <li>Back-end: API Node.js/Express, logique métiers et endpoints REST.</li>
              <li>Qualité: gestion des erreurs, messages clairs, accessibilité et responsive.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Bénéfices</h2>
            <ul>
              <li>Pour les producteurs: plus de visibilité et simplification des ventes.</li>
              <li>Pour les consommateurs: accès facilité à des produits frais et locaux.</li>
              <li>Pour le territoire: valorisation des circuits courts et de l’agriculture durable.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Limites et perspectives</h2>
            <ul>
              <li>Intégration de moyens de paiement et de logistique avancés.</li>
              <li>Suivi des stocks en temps réel côté producteurs.</li>
              <li>Programme de fidélité et recommandations personnalisées.</li>
              <li>Ouverture à de nouveaux territoires et coopérations locales.</li>
            </ul>
          </section>

          <section className={styles.ctaSection}>
            <div className={styles.ctaGroup}>
              <Link to={ROUTES.produits} className={`btn-primary ${styles.cta}`}>
                Découvrir les produits
              </Link>
              <Link to={ROUTES.contact} className={`btn-secondary ${styles.cta}`}>
                Nous contacter
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default Apropos;
