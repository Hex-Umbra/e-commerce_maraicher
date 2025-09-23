# 🥕 E-Commerce Maraîcher

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

Plateforme e-commerce permettant aux clients de commander directement auprès des producteurs maraîchers locaux, avec une interface d’administration pour les producteurs.

---

## 📦 Technologies utilisées

- **[React.js](https://reactjs.org/)** pour le front-end
- **[SCSS](https://sass-lang.com/)** pour les styles
- **[Node.js](https://nodejs.org/)** + **[Express.js](https://expressjs.com/)** pour le back-end
- **[MongoDB](https://www.mongodb.com/)** via **Mongoose**
- **[JWT](https://jwt.io/)** et **Bcrypt** pour l'authentification sécurisée

---
## 📂 Structure prévue

```bash
ecommerce-maraicher/
├── backend/
│ ├── controllers/
│ ├── middlewares/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── .env
│ └── server.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── styles/
│ │ └── App.js
│ └── package.json
├── README.md
└── .gitignore
```
---

## 🗄️ Architecture de la base de données (MongoDB)

### 📦 User
| Champ      | Type   | Description                  |
|------------|--------|------------------------------|
| _id        | ObjectId | Identifiant unique MongoDB   |
| name       | String | Nom de l'utilisateur          |
| email      | String | Email                         |
| password   | String | Mot de passe hashé            |
| role       | String | `client` ou `maraicher`       |

### 📦 Product
| Champ      | Type   | Description                  |
|------------|--------|------------------------------|
| _id        | ObjectId | Identifiant unique MongoDB   |
| name       | String | Nom du produit                |
| description| String | Description                   |
| price      | Number | Prix                          |
| quantity   | Number | Quantité disponible           |
| image      | String | URL image produit             |
| createdBy  | ObjectId | Référence au maraîcher       |

### 📦 Order
| Champ        | Type       | Description                |
|--------------|------------|----------------------------|
| _id          | ObjectId   | Identifiant unique MongoDB |
| clientName   | String     | Nom du client              |
| address      | String     | Adresse de livraison       |
| phone        | String     | Numéro de téléphone        |
| status       | String     | `En attente`, `Livrée`…    |
| createdAt    | Date       | Date de commande           |
| products     | Array      | Produits commandés (productId + quantity) |

---

### 📖 Notes
- Authentification sécurisée avec JWT et Bcrypt

- SCSS pour des styles modulaires et organisés

- Middlewares verifyToken et verifyRole pour la sécurité des routes

- Gestion des erreurs centralisée via utils/errorHandler.js

- Architecture scalable et maintenable

- Base MongoDB locale ou MongoDB Atlas

---

## 🚀 Deployment

### Backend on Render

1. Create a new Web Service on Render, root directory: `backend`
2. Runtime: Node
   - Build Command: `npm install` (default)
   - Start Command: `node server.js`
3. Set Environment Variables:
   - Required: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
   - Recommended: `JWT_EXPIRATION`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ALGORITHM`, `JWT_COOKIE_EXPIRES_IN`
   - CORS_ORIGINS: Vercel domain(s), comma-separated (e.g., `https://yourapp.vercel.app,https://yourapp-git-main-username.vercel.app`)
   - `COOKIE_SAMESITE=None`, `COOKIE_SECURE=true`
4. Deploy and note the service URL, e.g., `https://your-backend.onrender.com`

### Frontend on Vercel

1. Create Vercel Project from the repo with root path: `frontend`
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`

### Environment Variables

#### Backend (Render)
- **Required**:
  - `MONGO_URI`: MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster/dbname?retryWrites=true&w=majority`)
  - `JWT_SECRET`: Strong secret for JWT signing (32+ chars, generate with `openssl rand -base64 32`)
  - `NODE_ENV`: `production`
- **Recommended**:
  - `JWT_EXPIRATION`: `7d`
  - `JWT_ISSUER`: `yourapp`
  - `JWT_AUDIENCE`: `yourapp-users`
  - `JWT_ALGORITHM`: `HS256`
  - `JWT_COOKIE_EXPIRES_IN`: `604800000` (7 days in ms)
  - `CORS_ORIGINS`: Comma-separated allowed origins (exact Vercel domain(s))
  - `COOKIE_SAMESITE`: `None`
  - `COOKIE_SECURE`: `true`

#### Frontend (Vercel)
- **Required**:
  - `VITE_API_URL`: Base API URL with `/api` suffix from Render
- **Optional**:
  - `VITE_NODE_ENV`: `production`

### Post-Deploy Verification
- [ ] GET `https://your-backend.onrender.com/api/products` works
- [ ] Login works from Vercel domain; browser shows "jwt" cookie
- [ ] Authenticated endpoints succeed
- [ ] No CORS errors in console

---
