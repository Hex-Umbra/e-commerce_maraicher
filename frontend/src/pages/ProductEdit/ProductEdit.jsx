import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormField from "../../components/common/FormField/FormField";
import styles from "./ProductEdit.module.scss";
import { ROUTES } from "../../utils/routes";
import { productAPI } from "../../services/api";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import ErrorState from "../../components/common/ErrorState/ErrorState";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, showNotification } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
  });
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isProducer = user?.role === "producteur";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoadError("ID du produit manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const product = await productAPI.getProductById(id);
        
        if (!product) {
          setLoadError("Produit introuvable");
          setLoading(false);
          return;
        }

        // Verify ownership
        const productOwnerId = product.producteurId?._id || product.producteurId;
        if (productOwnerId !== user?.id) {
          setLoadError("Vous n'êtes pas autorisé à modifier ce produit");
          setLoading(false);
          return;
        }

        const productData = {
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          quantity: product.quantity?.toString() || "",
        };

        setForm(productData);
        setInitialForm(productData);
        setLoadError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setLoadError(err.message || "Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isProducer && user?.id) {
      fetchProduct();
    }
  }, [id, isAuthenticated, isProducer, user?.id]);

  const validate = () => {
    const e = {};

    if (!form.name || form.name.trim().length < 2) {
      e.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!form.description || form.description.trim().length < 10) {
      e.description = "La description doit contenir au moins 10 caractères";
    }

    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum) || priceNum < 0) {
      e.price = "Veuillez saisir un prix valide (≥ 0)";
    }


    if (!form.category || form.category.trim().length < 2) {
      e.category = "La catégorie doit contenir au moins 2 caractères";
    }

    const quantityNum = parseInt(form.quantity, 10);
    if (!form.quantity || isNaN(quantityNum) || quantityNum < 0) {
      e.quantity = "Veuillez saisir une quantité valide (≥ 0)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasChanges = () => {
    if (!initialForm) return false;
    return (
      form.name !== initialForm.name ||
      form.description !== initialForm.description ||
      form.price !== initialForm.price ||
      form.category !== initialForm.category ||
      form.quantity !== initialForm.quantity ||
      !!imageFile
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } catch (err) {
        console.error("Preview URL error:", err);
      }
      setErrors((prev) => ({ ...prev, image: "" }));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("description", form.description.trim());
        formData.append("price", String(parseFloat(form.price)));
        formData.append("category", form.category.trim());
        formData.append("quantity", String(parseInt(form.quantity, 10)));
        formData.append("image", imageFile);

        await productAPI.updateProductMultipart(id, formData);
      } else {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category.trim(),
          quantity: parseInt(form.quantity, 10),
        };

        await productAPI.updateProduct(id, payload);
      }
      
      if (showNotification) {
        showNotification("Produit mis à jour avec succès.", "success");
      }
      navigate(ROUTES.profile);
    } catch (err) {
      console.error("Error updating product:", err);
      if (showNotification) {
        showNotification(err.message || "Erreur lors de la mise à jour du produit.", "error");
      }
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    navigate(ROUTES.profile);
  };

  if (authLoading || loading) {
    return (
      <div className="container">
        <LoadingState message="Chargement..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!isProducer) {
    return <Navigate to={ROUTES.profile} replace />;
  }

  if (loadError) {
    return (
      <div className="container">
        <ErrorState 
          message={loadError}
          onRetry={() => navigate(ROUTES.profile)} 
          buttonText="Retour au profil" 
        />
      </div>
    );
  }

  return (
    <div className={styles.productEdit}>
      <div className="container">
        <h2 className={styles.title}>Modifier le produit</h2>

        <form className={styles.form} onSubmit={handleSave} noValidate>
          <FormField
            id="name"
            label="Nom du produit"
            value={form.name}
            onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            error={errors.name || ""}
            required
            placeholder="Ex: Tomates bio"
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={form.description}
            onChange={(v) => setForm((s) => ({ ...s, description: v }))}
            error={errors.description || ""}
            required
            rows={4}
            placeholder="Décrivez votre produit..."
          />

          <div className={styles.row}>
            <FormField
              id="price"
              label="Prix (€)"
              type="number"
              value={form.price}
              onChange={(v) => setForm((s) => ({ ...s, price: v }))}
              error={errors.price || ""}
              required
              placeholder="0.00"
            />

            <FormField
              id="quantity"
              label="Quantité en stock"
              type="number"
              value={form.quantity}
              onChange={(v) => setForm((s) => ({ ...s, quantity: v }))}
              error={errors.quantity || ""}
              required
              placeholder="0"
            />
          </div>

          <FormField
            id="category"
            label="Catégorie"
            value={form.category}
            onChange={(v) => setForm((s) => ({ ...s, category: v }))}
            error={errors.category || ""}
            required
            placeholder="Ex: Légumes, Fruits, Produits laitiers..."
          />


          <div className={styles.fileUpload}>
            <label htmlFor="imageFile">Ou téléverser un fichier</label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {imagePreview && (
              <div className={styles.preview} style={{ marginTop: "8px" }}>
                <img
                  src={imagePreview}
                  alt="Aperçu de l'image sélectionnée"
                  style={{ maxWidth: "200px", height: "auto", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              aria-label="Annuler et revenir au profil"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!hasChanges()}
              aria-label="Enregistrer les modifications"
              title={!hasChanges() ? "Aucune modification à enregistrer" : "Enregistrer"}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
