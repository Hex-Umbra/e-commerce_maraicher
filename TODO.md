# Profile Page Implementation - Task Tracker

Status: In progress

Information Gathered
- Auth is provided by frontend/src/context/AuthContext.jsx with fields: name, email, address, role ("admin" | "producteur" | "client").
- Styling uses SCSS modules with variables and mixins from frontend/src/styles/variables and frontend/src/styles/mixins.
- Routing constants are in frontend/src/utils/routes.js and app routes are defined in frontend/src/App.jsx.

Plan
- Create a reusable profile card component that displays avatar, name, email, address, role, and actions.
- Add new routes: /profil and /commandes.
- Create a Profile page that uses the profile card component.
- Create a minimal Orders page that uses the existing orders API and is styled consistently.
- Update Navbar to link the user icon to /profil.

Tasks

1. Routing
- [x] Add ROUTES.profile and ROUTES.orders in frontend/src/utils/routes.js
- [x] Add routes in frontend/src/App.jsx
  - [x] /profil => Profile page
  - [x] /commandes => Orders page

2. Profile Card Component
- [x] Create component files:
  - [x] frontend/src/components/common/ProfileCard/ProfileCard.jsx
  - [x] frontend/src/components/common/ProfileCard/ProfileCard.module.scss
  - [x] frontend/src/components/common/ProfileCard/index.js
- [x] Implement role-aware label rendering (Client | Producteur | Admin)
- [x] Implement actions:
  - [x] Voir mes Commandes -> ROUTES.orders
  - [x] Voir mon Panier -> ROUTES.cart
  - [x] Floating edit button with fallback to ?edit=1 query param

3. Profile Page
- [x] Create page files:
  - [x] frontend/src/pages/Profile/Profile.jsx
  - [x] frontend/src/pages/Profile/Profile.module.scss
- [x] Protect route using isAuthenticated (redirect to login if false)
- [x] Use ProfileCard within a responsive container

4. Orders Page (minimal)
- [x] Create page files:
  - [x] frontend/src/pages/Orders/Orders.jsx
  - [x] frontend/src/pages/Orders/Orders.module.scss
- [x] Load orders from ordersAPI.getUserOrders()
- [x] Show EmptyState when no orders
- [x] Show ErrorState with retry on failure
- [x] Use consistent styling with cards and tags

5. Navbar
- [x] Wrap user name/icon with Link to ROUTES.profile

Next Steps
- [ ] Implement a dedicated profile edit page and route, wire the FAB to it
- [ ] Add avatar upload/change (with backend endpoint)
- [ ] Add role-specific actions (e.g., Producteur: “Voir mes ventes”)
- [ ] Accessibility refinements and unit tests

Run
- Start the frontend dev server (from frontend/): npm run dev
- Navigate to /profil to view the Profile page, and /commandes to view Orders.
