// Default avatar images (using placeholder services for now)
export const getDefaultAvatar = (producerName, index = 0) => {
  // Use a consistent avatar based on producer name or index
  const avatarIndex = (index % 50) + 1; // Pravatar has 50+ images
  return `https://i.pravatar.cc/100?img=${avatarIndex}`;
};

// Default specialties based on common producer types
const DEFAULT_SPECIALTIES = [
  "Produits laitiers artisanaux",
  "Fruits et légumes de saison",
  "Viandes et charcuteries fermières",
  "Céréales et légumineuses bio",
  "Miel et produits de la ruche",
  "Produits transformés maison",
  "Herbes aromatiques et épices",
  "Œufs fermiers et volailles",
];

// Default descriptions for producers
const DEFAULT_DESCRIPTIONS = [
  "Producteur passionné engagé dans une agriculture durable et respectueuse de l'environnement.",
  "Exploitation familiale transmise de génération en génération, privilégiant la qualité et le savoir-faire traditionnel.",
  "Agriculteur local soucieux de proposer des produits frais et de qualité directement de la ferme.",
  "Producteur artisanal qui met l'accent sur des méthodes de production naturelles et éthiques.",
  "Ferme familiale dédiée à l'agriculture biologique et aux circuits courts.",
  "Producteur engagé dans la préservation des variétés locales et des traditions culinaires régionales.",
  "Exploitation agricole moderne alliant innovation et respect des pratiques ancestrales.",
  "Producteur local privilégiant la fraîcheur et la traçabilité de ses produits.",
];

// Get default specialty for a producer
export const getDefaultSpecialty = (producerName, index = 0) => {
  // Use producer name hash or index to get consistent specialty
  const specialtyIndex = index % DEFAULT_SPECIALTIES.length;
  return DEFAULT_SPECIALTIES[specialtyIndex];
};

// Get default description for a producer
export const getDefaultDescription = (producerName, index = 0) => {
  // Use producer name hash or index to get consistent description
  const descriptionIndex = index % DEFAULT_DESCRIPTIONS.length;
  return DEFAULT_DESCRIPTIONS[descriptionIndex];
};

// Category to badge mapping
export const getCategoryBadge = (category) => {
  const categoryMap = {
    'laitier': 'Laitier',
    'fruits': 'Fruits',
    'legumes': 'Légumes',
    'viande': 'Viande',
    'cereales': 'Céréales',
    'miel': 'Miel',
    'oeufs': 'Œufs',
    'charcuterie': 'Charcuterie',
    'fromage': 'Fromage',
    'pain': 'Boulangerie',
    'conserves': 'Conserves',
    'boissons': 'Boissons',
    'herbes': 'Herbes',
    'epices': 'Épices',
    'bio': 'Bio',
    'local': 'Local',
    'artisanal': 'Artisanal',
  };

  // Return mapped category or capitalize first letter of original
  return categoryMap[category?.toLowerCase()] || 
         (category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Produit');
};

// Get category badge style class
export const getCategoryBadgeClass = (category) => {
  const categoryClasses = {
    'laitier': 'tagDairy',
    'fruits': 'tagFruit',
    'legumes': 'tagVegetable',
    'viande': 'tagMeat',
    'cereales': 'tagGrain',
    'miel': 'tagHoney',
    'oeufs': 'tagEgg',
    'charcuterie': 'tagMeat',
    'fromage': 'tagDairy',
    'pain': 'tagBread',
    'conserves': 'tagPreserved',
    'boissons': 'tagBeverage',
    'herbes': 'tagHerb',
    'epices': 'tagSpice',
    'bio': 'tagBio',
    'local': 'tagLocal',
    'artisanal': 'tagArtisan',
  };

  return categoryClasses[category?.toLowerCase()] || 'tagDefault';
};

// Transform backend producer data to frontend format
export const transformProducerData = (backendProducer, index = 0) => {
  return {
    id: backendProducer._id,
    name: backendProducer.name || 'Producteur',
    specialty: getDefaultSpecialty(backendProducer.name, index),
    description: getDefaultDescription(backendProducer.name, index),
    avatar: getDefaultAvatar(backendProducer.name, index),
    email: backendProducer.email,
    address: backendProducer.address,
    role: backendProducer.role,
    createdAt: backendProducer.createdAt,
    products: [], // Will be populated separately
  };
};

// Transform backend product data to frontend format
export const transformProductData = (backendProduct) => {
  return {
    id: backendProduct._id,
    name: backendProduct.name || 'Produit',
    image: backendProduct.image || 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 1000),
    price: backendProduct.price || 0,
    description: backendProduct.description,
    category: backendProduct.category,
    quantity: backendProduct.quantity,
    tags: [getCategoryBadge(backendProduct.category)], // Convert category to tag
    createdAt: backendProduct.createdAt,
  };
};
