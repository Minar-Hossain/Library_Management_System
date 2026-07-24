import { CATEGORIES } from "../services/productService";

const subcategories = [
  { label: "All types", value: "" },
  { label: "Oversized", value: "oversized" },
  { label: "Regular", value: "regular" },
  { label: "Slim", value: "slim" },
  { label: "Sneakers", value: "sneakers" },
  { label: "Boots", value: "boots" },
  { label: "Snapback", value: "snapback" },
  { label: "Dress", value: "dress" },
];

const fitOptions = [
  { label: "Any fit", value: "" },
  { label: "Slim", value: "slim" },
  { label: "Regular", value: "regular" },
  { label: "Oversized", value: "oversized" },
  { label: "Relaxed", value: "relaxed" },
];

function FilterSidebar({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>

      <label htmlFor="filter-search">Search</label>
      <input
        id="filter-search"
        type="search"
        placeholder="Brand, style..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
      />

      <label htmlFor="filter-category">Category</label>
      <select
        id="filter-category"
        value={filters.category}
        onChange={(e) => set("category", e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <label htmlFor="filter-subcategory">Type</label>
      <select
        id="filter-subcategory"
        value={filters.subcategory}
        onChange={(e) => set("subcategory", e.target.value)}
      >
        {subcategories.map((s) => (
          <option key={s.value || "all"} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <label htmlFor="filter-fit">Fit</label>
      <select id="filter-fit" value={filters.fitType} onChange={(e) => set("fitType", e.target.value)}>
        {fitOptions.map((f) => (
          <option key={f.value || "any"} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </aside>
  );
}

export default FilterSidebar;
