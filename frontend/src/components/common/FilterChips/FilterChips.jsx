import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BsFilter } from 'react-icons/bs';
import styles from './FilterChips.module.scss';

const FilterChips = ({
  label,
  items = [],
  selectedValue,
  onSelect,
  maxVisible = 5,
  showIcon = true,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);
  const hasHiddenItems = hiddenItems.length > 0;

  const handleSelect = (value) => {
    onSelect(value);
    if (showAll) {
      setShowAll(false);
    }
  };

  return (
    <div className={styles.filterRow}>
      <div className={styles.chipRow} role="listbox" aria-label={label}>
        <span className={styles.filterLabel}>{label}</span>
        {showIcon && (
          <span className={styles.filterIcon} aria-hidden="true">
            <BsFilter />
          </span>
        )}
        
        {/* "All" button */}
        <button
          type="button"
          className={`${styles.chip} ${selectedValue === 'all' ? styles.chipActive : ''}`}
          aria-pressed={selectedValue === 'all'}
          onClick={() => handleSelect('all')}
        >
          Tous
        </button>

        {/* Visible items */}
        {visibleItems.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`${styles.chip} ${selectedValue === item.value ? styles.chipActive : ''}`}
            aria-pressed={selectedValue === item.value}
            onClick={() => handleSelect(item.value)}
          >
            {item.label}
          </button>
        ))}

        {/* Show more button */}
        {hasHiddenItems && (
          <button
            type="button"
            className={styles.chip}
            aria-haspopup="menu"
            aria-expanded={showAll}
            aria-controls={`${label}-menu`}
            onClick={() => setShowAll((v) => !v)}
            title={`Voir tous les ${label.toLowerCase()}`}
          >
            ...
            <span className={styles.srOnly}>Voir tous les {label.toLowerCase()}</span>
          </button>
        )}
      </div>

      {/* Expanded menu panel */}
      {showAll && hasHiddenItems && (
        <div
          id={`${label}-menu`}
          className={styles.menuPanel}
          role="menu"
          aria-label={`Autres ${label.toLowerCase()}`}
        >
          {hiddenItems.map((item) => (
            <button
              type="button"
              key={item.value}
              role="menuitem"
              className={`${styles.chip} ${selectedValue === item.value ? styles.chipActive : ''}`}
              aria-pressed={selectedValue === item.value}
              onClick={() => handleSelect(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

FilterChips.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
  showIcon: PropTypes.bool,
};

export default FilterChips;
