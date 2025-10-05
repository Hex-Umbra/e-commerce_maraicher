import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileCard from "../../components/common/ProfileCard";
import ImageWithFallback from "../../components/common/ImageWithFallback/ImageWithFallback";
import FormField from "../../components/common/FormField/FormField";
import styles from "./Profile.module.scss";
import { ROUTES } from "../../utils/routes";
import { productAPI } from "../../services/api";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

const Profile = () => {
  const { user, isAuthenticated, loading, showNotification } = useAuth();

  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    quantity: "",
  });
  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    quantity: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  const isProducer = user?.role === "producteur";

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isProducer || !user?.id) return;
      try {
        setLoadingProducts(true);
        const list = await productAPI.getByProducer(user.id);
        setMyProducts(list);
        setProductsError(null);
      } catch (err) {
        setProductsError(err.message || "Erreur lors du chargement des produits.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [isProducer, user?.id]);

  const handleEditProduct = (id) => {
    const product = myProducts.find((p) => (p._id || p.id) === id);
    if (!product) return;

    // Close add form if open
    setShowAddForm(false);

    // Set editing state
    setEditingProductId(id);
    setEditProduct({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      category: product.category || "",
      quantity: product.quantity?.toString() || "",
    });
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditProduct({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      quantity: "",
    });
    setFormErrors({});
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    try {
      await productAPI.deleteProduct(id);
      setMyProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (showNotification) showNotification("Produit supprimé.", "success");
    } catch (err) {
      if (showNotification) showNotification(err.message || "Erreur lors de la suppression.", "error");
    }
  };

  const validateProductForm = (product, options = {}) => {
    const errors = {};

    if (!product.name || product.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!product.description || product.description.trim().length < 10) {
      errors.description = "La description doit contenir au moins 10 caractères";
    }

    const priceNum = parseFloat(product.price);
    if (!product.price || isNaN(priceNum) || priceNum < 0) {
      errors.price = "Veuillez saisir un prix valide (≥ 0)";
    }

    const allowFile = options.allowFile;
    if (allowFile) {
      if ((!product.image || product.image.trim().length < 5) && !newImageFile) {
        errors.image = "Veuillez fournir une image (fichier) ou une URL valide";
      }
    } else {
      if (!product.image || product.image.trim().length < 5) {
        errors.image = "Veuillez saisir une URL d'image valide";
      }
    }

    if (!product.category || product.category.trim().length < 2) {
      errors.category = "La catégorie doit contenir au moins 2 caractères";
    }

    const quantityNum = parseInt(product.quantity, 10);
    if (!product.quantity || isNaN(quantityNum) || quantityNum < 0) {
      errors.quantity = "Veuillez saisir une quantité valide (≥ 0)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file) {
      setNewImageFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setNewImagePreview(previewUrl);
      } catch (err) {
        console.error("Preview URL error:", err);
      }
      setFormErrors((prev) => ({ ...prev, image: "" }));
    } else {
      setNewImageFile(null);
      setNewImagePreview(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm(newProduct, { allowFile: !!newImageFile })) return;

    setIsSubmitting(true);
    try {
      let createdProduct;

      if (newImageFile) {
        const formData = new FormData();
        formData.append("name", newProduct.name.trim());
        formData.append("description", newProduct.description.trim());
        formData.append("price", String(parseFloat(newProduct.price)));
        formData.append("category", newProduct.category.trim());
        formData.append("quantity", String(parseInt(newProduct.quantity, 10)));
        formData.append("image", newImageFile);

        const resp = await productAPI.createProductMultipart(formData);
        createdProduct = resp?.product || resp;
      } else {
        const payload = {
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          price: parseFloat(newProduct.price),
          image: newProduct.image.trim(),
          category: newProduct.category.trim(),
          quantity: parseInt(newProduct.quantity, 10),
        };
        createdProduct = await productAPI.createProduct(payload);
      }
      
      // Add to local state
      setMyProducts((prev) => [createdProduct, ...prev]);
      
      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        quantity: "",
      });
      setNewImageFile(null);
      setNewImagePreview(null);
      setFormErrors({});
      setShowAddForm(false);
      
      if (showNotification) {
        showNotification("Produit créé avec succès.", "success");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      if (showNotification) {
        showNotification(err.message || "Erreur lors de la création du produit.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateProductForm(editProduct)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: editProduct.name.trim(),
        description: editProduct.description.trim(),
        price: parseFloat(editProduct.price),
        image: editProduct.image.trim(),
        category: editProduct.category.trim(),
        quantity: parseInt(editProduct.quantity, 10),
      };

      await productAPI.updateProduct(editingProductId, payload);
      
      // Update local state
      setMyProducts((prev) =>
        prev.map((p) => {
          const pid = p._id || p.id;
          if (pid === editingProductId) {
            return { ...p, ...payload };
          }
          return p;
        })
      );
      
      // Reset edit state
      setEditingProductId(null);
      setEditProduct({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        quantity: "",
      });
      setFormErrors({});
      
      if (showNotification) {
        showNotification("Produit mis à jour avec succès.", "success");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      if (showNotification) {
        showNotification(err.message || "Erreur lors de la mise à jour du produit.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      quantity: "",
    });
    setNewImageFile(null);
    setNewImagePreview(null);
    setFormErrors({});
  };

  const handleToggleAddForm = () => {
    if (showAddForm) {
      handleCancelAdd();
    } else {
      // Close edit form if open
      if (editingProductId) {
        handleCancelEdit();
      }
      setShowAddForm(true);
      // Scroll to form after state update
      setTimeout(() => {
        document.getElementById('add-product-form')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
  };

  // Handle Escape key to close forms
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showAddForm) {
          handleCancelAdd();
        } else if (editingProductId) {
          handleCancelEdit();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddForm, editingProductId]);

  if (loading) {
    return (
      <div className="container">
        <div className={styles.loading}>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className={styles.profile}>
      <div className="container">
        <h2 className={styles.title}>Mon Profil</h2>

        <div className={styles.cardWrap}>
          <ProfileCard user={user} />
        </div>

        {isProducer && (
          <section className={styles.manageSection} aria-labelledby="manage-title">
            <div className={styles.manageHeader}>
              <div className={styles.headerLeft}>
                <h3 id="manage-title">Mes produits</h3>
                <span className={styles.count}>
                  {myProducts && myProducts.length > 0 ? `(${myProducts.length})` : ""}
                </span>
              </div>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleToggleAddForm}
                aria-label={showAddForm ? "Annuler l'ajout" : "Ajouter un produit"}
              >
                {showAddForm ? <FiX /> : <FiPlus />}
                {showAddForm ? "Annuler" : "Ajouter un produit"}
              </button>
            </div>

            {showAddForm && (
              <form 
                id="add-product-form" 
                className={styles.addForm} 
                onSubmit={handleAddProduct} 
                noValidate
              >
                <h4 className={styles.formTitle}>Nouveau produit</h4>
                
                <FormField
                  id="new-name"
                  label="Nom du produit"
                  value={newProduct.name}
                  onChange={(v) => setNewProduct((s) => ({ ...s, name: v }))}
                  error={formErrors.name || ""}
                  required
                  placeholder="Ex: Tomates bio"
                />

                <FormField
                  id="new-description"
                  label="Description"
                  type="textarea"
                  value={newProduct.description}
                  onChange={(v) => setNewProduct((s) => ({ ...s, description: v }))}
                  error={formErrors.description || ""}
                  required
                  rows={3}
                  placeholder="Décrivez votre produit..."
                />

                <div className={styles.formRow}>
                  <div className={styles.fieldWrapper}>
                    <FormField
                      id="new-price"
                      label="Prix (€)"
                      type="number"
                      value={newProduct.price}
                      onChange={(v) => setNewProduct((s) => ({ ...s, price: v }))}
                      error={formErrors.price || ""}
                      required
                      placeholder="0.00"
                    />
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      style={{ display: 'none' }} 
                      aria-hidden="true"
                    />
                  </div>

                  <div className={styles.fieldWrapper}>
                    <FormField
                      id="new-quantity"
                      label="Quantité"
                      type="number"
                      value={newProduct.quantity}
                      onChange={(v) => setNewProduct((s) => ({ ...s, quantity: v }))}
                      error={formErrors.quantity || ""}
                      required
                      placeholder="0"
                    />
                    <input 
                      type="number" 
                      step="1" 
                      min="0" 
                      style={{ display: 'none' }} 
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <FormField
                  id="new-category"
                  label="Catégorie"
                  value={newProduct.category}
                  onChange={(v) => setNewProduct((s) => ({ ...s, category: v }))}
                  error={formErrors.category || ""}
                  required
                  placeholder="Ex: Légumes, Fruits, Produits laitiers..."
                />

                <FormField
                  id="new-image"
                  label="URL de l'image (optionnel)"
                  value={newProduct.image}
                  onChange={(v) => setNewProduct((s) => ({ ...s, image: v }))}
                  error={formErrors.image || ""}
                  placeholder="https://example.com/image.jpg"
                />

                <div className={styles.fieldWrapper}>
                  <label htmlFor="new-image-file">Téléverser une image</label>
                  <input
                    id="new-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleNewFileChange}
                  />
                  {newImagePreview && (
                    <div style={{ marginTop: "8px" }}>
                      <img
                        src={newImagePreview}
                        alt="Aperçu de l'image sélectionnée"
                        style={{ maxWidth: "200px", height: "auto", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelAdd}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Création..." : "Créer le produit"}
                  </button>
                </div>
              </form>
            )}

            {loadingProducts ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Chargement de vos produits...</p>
              </div>
            ) : productsError ? (
              <div className={styles.errorState}>
                <p className={styles.errorMessage}>{productsError}</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Réessayer
                </button>
              </div>
            ) : myProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyMessage}>Aucun produit pour le moment.</p>
                <p className={styles.emptyHint}>
                  Cliquez sur "Ajouter un produit" pour commencer à vendre vos produits.
                </p>
              </div>
            ) : (
              <div className={styles.grid} role="grid" aria-label="Mes produits">
                {myProducts.map((prod) => {
                  const pid = prod._id || prod.id;
                  const isEditing = editingProductId === pid;

                  if (isEditing) {
                    return (
                      <div key={pid} className={styles.editFormCard}>
                        <form onSubmit={handleUpdateProduct} noValidate>
                          <h4 className={styles.formTitle}>Modifier le produit</h4>
                          
                          <FormField
                            id={`edit-name-${pid}`}
                            label="Nom du produit"
                            value={editProduct.name}
                            onChange={(v) => setEditProduct((s) => ({ ...s, name: v }))}
                            error={formErrors.name || ""}
                            required
                          />

                          <FormField
                            id={`edit-description-${pid}`}
                            label="Description"
                            type="textarea"
                            value={editProduct.description}
                            onChange={(v) => setEditProduct((s) => ({ ...s, description: v }))}
                            error={formErrors.description || ""}
                            required
                            rows={3}
                          />

                          <div className={styles.formRow}>
                            <div className={styles.fieldWrapper}>
                              <FormField
                                id={`edit-price-${pid}`}
                                label="Prix (€)"
                                type="number"
                                value={editProduct.price}
                                onChange={(v) => setEditProduct((s) => ({ ...s, price: v }))}
                                error={formErrors.price || ""}
                                required
                              />
                              <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                style={{ display: 'none' }} 
                                aria-hidden="true"
                              />
                            </div>

                            <div className={styles.fieldWrapper}>
                              <FormField
                                id={`edit-quantity-${pid}`}
                                label="Quantité"
                                type="number"
                                value={editProduct.quantity}
                                onChange={(v) => setEditProduct((s) => ({ ...s, quantity: v }))}
                                error={formErrors.quantity || ""}
                                required
                              />
                              <input 
                                type="number" 
                                step="1" 
                                min="0" 
                                style={{ display: 'none' }} 
                                aria-hidden="true"
                              />
                            </div>
                          </div>

                          <FormField
                            id={`edit-category-${pid}`}
                            label="Catégorie"
                            value={editProduct.category}
                            onChange={(v) => setEditProduct((s) => ({ ...s, category: v }))}
                            error={formErrors.category || ""}
                            required
                          />

                          <FormField
                            id={`edit-image-${pid}`}
                            label="URL de l'image"
                            value={editProduct.image}
                            onChange={(v) => setEditProduct((s) => ({ ...s, image: v }))}
                            error={formErrors.image || ""}
                            required
                          />

                          <div className={styles.formActions}>
                            <button
                              type="button"
                              className={styles.cancelButton}
                              onClick={handleCancelEdit}
                              disabled={isSubmitting}
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className={styles.submitButton}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Mise à jour..." : "Enregistrer"}
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  }

                  return (
                    <article key={pid} className={styles.manageCard}>
                      <ImageWithFallback
                        src={prod.image}
                        fallback="/placeholder-product.jpg"
                        alt={`Image de ${prod.name}`}
                        className={styles.thumb}
                      />
                      <div className={styles.info}>
                        <div className={styles.nameRow}>
                          <h4 title={prod.name}>{prod.name}</h4>
                          <span className={styles.price}>
                            {Number(prod.price).toFixed(2)}€
                          </span>
                        </div>
                        <div className={styles.meta}>
                          <span>{prod.category}</span>
                          <span>Stock: {Number(prod.quantity)}</span>
                        </div>
                        <div className={styles.cardActions}>
                          <button
                            className={`${styles.btn} ${styles.edit}`}
                            onClick={() => handleEditProduct(pid)}
                            aria-label="Modifier le produit"
                            type="button"
                          >
                            <FiEdit2 aria-hidden="true" />
                          </button>
                          <button
                            className={`${styles.btn} ${styles.delete}`}
                            onClick={() => handleDeleteProduct(pid)}
                            aria-label="Supprimer le produit"
                            type="button"
                          >
                            <FiTrash2 aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
