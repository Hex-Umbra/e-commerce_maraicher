import styles from './ConditionsUtilisation.module.scss';

const ConditionsUtilisation = () => {
  return (
    <div className={styles.conditionsUtilisation}>
      <div className="container">
        <h1>Conditions d'Utilisation</h1>
        
        <section className={styles.section}>
          <h2>Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant ce site web, vous acceptez d'être lié par les 
            termes et conditions d'utilisation énoncés ci-dessous. Si vous n'acceptez 
            pas ces conditions, veuillez ne pas utiliser ce site.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Utilisation du site</h2>
          <p>
            Ce site est un projet d'études, réalisé et conceptualisé pour .
          </p>
        </section>

        <section className={styles.section}>
          <h2>Commandes et paiements</h2>
          <p>
            Toutes les commandes sont soumises à acceptation et à la disponibilité 
            des produits.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Responsabilité</h2>
          <p>
            Marché Frais Fermier ne peut être tenu responsable des dommages directs 
            ou indirects résultant de l'utilisation du site ou de l'impossibilité 
            de l'utiliser.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ConditionsUtilisation;
