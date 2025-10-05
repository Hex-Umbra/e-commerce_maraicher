export const ROUTES = {
  root: "/",
  accueil: "/accueil",
  nosFermiers: "/nosfermiers",
  produits: "/produits",
  apropos: "/apropos",
  contact: "/contact",
  fermier: (id = ":id") => `/fermier/${id}`,
  login: "/login",
  register: "/register",
  cart: "/cart",
  profile: "/profil",
  profileEdit: "/profil/editer",
  productEdit: (id = ":id") => `/produits/${id}/editer`,
  orders: "/commandes",
  notFound: "/404",
  mentionsLegales: "/mentions-legales",
  politiqueConfidentialite: "/politique-confidentialite",
  conditionsUtilisation: "/conditions-utilisation",
};

export const NAV_LINKS = [
  { to: ROUTES.accueil, label: "Accueil" },
  { to: ROUTES.nosFermiers, label: "Nos fermiers" },
  { to: ROUTES.produits, label: "Produits" },
  { to: ROUTES.apropos, label: "À Propos" },
  { to: ROUTES.contact, label: "Contact" },
];
