import styles from './MentionsLegales.module.scss';

const MentionsLegales = () => {
  return (
    <div className={styles.mentionsLegales}>
      <div className="container">
        <h1>Mentions Légales</h1>
        
        <section className={styles.section}>
          <h2>Éditeur du site</h2>
          <p>
            <strong>Marché Frais Fermier</strong><br />
            Plateforme de vente en ligne de produits fermiers<br />
          </p>
        </section>

        <section className={styles.section}>
          <h2>Hébergement</h2>
          <p>
            Ce site est hébergé sur :<br />
            Vercel pour le Front-end et Render pour le back-end
          </p>
        </section>

        <section className={styles.section}>
          <h2>Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale 
            sur le droit d'auteur et la propriété intellectuelle. Tous les droits de 
            reproduction sont réservés, y compris pour les documents téléchargeables 
            et les représentations iconographiques et photographiques.
          </p>
        </section>

      </div>
    </div>
  );
};

export default MentionsLegales;
