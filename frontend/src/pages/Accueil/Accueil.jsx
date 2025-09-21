import { Link } from "react-router-dom";
import ProducerShowcase from "../../components/ProducerShowcase/ProducerShowcase";
import styles from "./Accueil.module.scss";

const producers = [
  {
    name: "Jean Martin",
    specialty: "Spécialiste en produits laitiers",
    description:
      "Producteur artisanal de fromages et laits fermiers, engagé pour une agriculture durable.",
    avatar: "https://i.pravatar.cc/100?img=11",
    products: [
      {
        id: "jm-1",
        name: "Emmental",
        image: "https://picsum.photos/seed/cheese1/400/300",
        price: 1.9,
        tags: ["Nouveau"],
      },
      {
        id: "jm-2",
        name: "Comté",
        image: "https://picsum.photos/seed/cheese2/400/300",
        price: 2.5,
        tags: ["Promo"],
      },
      {
        id: "jm-3",
        name: "Beaufort",
        image: "https://picsum.photos/seed/cheese3/400/300",
        price: 3.2,
        tags: [],
      },
      {
        id: "jm-4",
        name: "Tomme",
        image: "https://picsum.photos/seed/cheese4/400/300",
        price: 2.1,
        tags: [],
      },
    ],
  },
  {
    name: "Claire Dupont",
    specialty: "Fruits et légumes de saison",
    description:
      "Agricultrice familiale, ses fruits et légumes sont cueillis à maturité pour un goût optimal.",
    avatar: "https://i.pravatar.cc/100?img=32",
    products: [
      {
        id: "cd-1",
        name: "Pommes bio",
        image: "https://picsum.photos/seed/apples1/400/300",
        price: 1.9,
        tags: ["Nouveau"],
      },
      {
        id: "cd-2",
        name: "Poires",
        image: "https://picsum.photos/seed/pears1/400/300",
        price: 2.1,
        tags: [],
      },
      {
        id: "cd-3",
        name: "Carottes",
        image: "https://picsum.photos/seed/carrots1/400/300",
        price: 1.2,
        tags: ["Promo"],
      },
      {
        id: "cd-4",
        name: "Tomates",
        image: "https://picsum.photos/seed/tomatoes1/400/300",
        price: 2.0,
        tags: [],
      },
    ],
  },
];

const Accueil = () => {
  return (
    <div className={styles.accueil}>
      <div className="container">
        {/* Hero section inside the page */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h2 className={styles.headline}>Frais de la ferme à votre table</h2>
            <p className={styles.subtitle}>
              Découvrez les meilleurs produits locaux, laitages artisanaux et
              fruits de saison directement de notre réseau de confiance de
              fermiers familiaux.
            </p>
            <Link to="/nosfermiers" className={styles.cta}>
              Découvrir nos fermiers !
            </Link>
          </div>
        </section>

        {/* Producers showcase */}
        <h3 className={styles.sectionHeading}>Nos Agriculteurs partenaire</h3>
        <div className={styles.producers}>
          {producers.map((producer) => (
            <ProducerShowcase key={producer.name} producer={producer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accueil;
