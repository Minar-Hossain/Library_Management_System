import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link className="product-card-link" to={`/product/${product.id}`} state={{ product }}>
      <article className="product-card">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-price">${product.price}</p>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
