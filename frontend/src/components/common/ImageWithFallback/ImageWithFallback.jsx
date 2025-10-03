import { useState } from 'react';
import PropTypes from 'prop-types';

const ImageWithFallback = ({ 
  src, 
  fallback, 
  alt, 
  className = "",
  loading = "lazy",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      decoding="async"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  fallback: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
};

export default ImageWithFallback;
