// Menu Screen - Manage products/menu items (add, edit, delete)

import { imageService } from '../../services/image-service.js';
import {
  addProduct,
  deleteProduct,
  getCategories,
  store,
  updateProduct,
} from '../../state/index.js';
import { updateSection } from '../../ui/dom-utils.js';
import { Header } from '../../ui/header.js';
import { confirm, createModal, toast } from '../../ui/modal.js';
import { formatCurrency } from '../../utils/helpers.js';

export class MenuScreen {
  constructor(options = {}) {
    this.router = options.router;
    this.selectedCategory = 'All';
    this.showModal = false;
    this.editingProduct = null;
    this.searchQuery = '';
    this.sortBy = 'name';
  }

  render() {
    const categories = ['All', ...getCategories()];
    const filteredProducts = this.getFilteredProducts();

    return `
      <div class="h-screen flex flex-col bg-neutral-50 overflow-hidden">
        ${Header({
          left: '<button onclick="app.navigate(\'home\')" class="text-neutral-600 hover:text-neutral-900 text-lg">← Back</button>',
          center: '<h1 class="text-xl font-bold">Menu Management</h1>',
          right:
            '<button onclick="menuScreen.openModal()" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors text-sm">+ Add Item</button>',
        })}

        ${this.renderStatsBar(categories)}
        ${this.renderSearchFilters()}
        ${this.renderCategoryTabs(categories)}
        ${this.renderProductsGrid(filteredProducts)}
      </div>
    `;
  }

  renderStatsBar(categories) {
    const products = store.getState().products;
    const avgPrice =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length
        : 0;

    return `
      <div class="bg-white border-b px-6 py-4">
        <div class="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${products.length}</div>
            <div class="text-sm text-gray-500">Total Items</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${categories.length - 1}</div>
            <div class="text-sm text-gray-500">Categories</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary">${formatCurrency(avgPrice)}</div>
            <div class="text-sm text-gray-500">Avg Price</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">${this.getFilteredProducts().length}</div>
            <div class="text-sm text-gray-500">Showing</div>
          </div>
        </div>
      </div>
    `;
  }

  renderSearchFilters() {
    return `
      <div class="bg-white border-b px-6 py-4">
        <div class="w-full flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value="${this.searchQuery}"
            oninput="menuScreen.updateSearchQuery(this.value)"
            class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
          />
          <select
            onchange="menuScreen.setSortBy(this.value)"
            class="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none font-medium"
          >
            <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Sort by Name</option>
            <option value="price-low" ${this.sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price-high" ${this.sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
            <option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>Sort by Category</option>
          </select>
        </div>
      </div>
    `;
  }

  renderCategoryTabs(categories) {
    return `
      <div class="bg-white border-b px-6 py-3 overflow-x-auto">
        <div class="w-full flex gap-2" data-category-tabs>
          ${categories
            .map(
              (cat) => `
            <button 
              onclick="menuScreen.selectCategory('${cat}')"
              class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                this.selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }"
            >
              ${cat} ${
                cat === 'All'
                  ? `(${store.getState().products.length})`
                  : `(${store.getState().products.filter((prod) => prod.category === cat).length})`
              }
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderProductsGrid(products) {
    if (products.length === 0) {
      return `
        <div class="flex-1 overflow-y-auto p-6">
          <div class="w-full">
            <div class="text-center py-20 text-gray-400">
              <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <div class="text-xl font-medium">No products found</div>
              <div class="text-sm mt-2">Try adjusting your search or filters</div>
              <button 
                onclick="menuScreen.openModal()" 
                class="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="flex-1 overflow-y-auto p-6">
        <div class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-products-grid>
            ${products.map((product) => this.renderProductCard(product)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderProductCard(product) {
    const imageData = imageService.getImageWithFallback(
      product.image,
      product.category
    );
    return `
      <div class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
        <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center overflow-hidden">
          <img 
            src="${imageData.src}" 
            alt="${product.name}"
            class="w-full h-full object-cover"
            onerror="this.src='${imageData.fallback}'"
            loading="lazy"
          />
        </div>
        
        <div class="p-5">
          <div class="mb-3">
            <div class="font-bold text-xl text-gray-900 mb-1">${product.name}</div>
            <div class="text-sm text-gray-500">${product.category}</div>
          </div>
          
          <div class="text-2xl font-bold text-primary mb-4">
            ${formatCurrency(product.price)}
          </div>

          <div class="flex gap-2">
            <button 
              onclick="menuScreen.openEditModal('${product.id}')"
              class="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
            >
              Edit
            </button>
            <button 
              onclick="menuScreen.handleDelete('${product.id}')"
              class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Filter and sort products based on current filters
  getFilteredProducts() {
    let products = [...store.getState().products];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      products = products.filter(
        (prod) => prod.category === this.selectedCategory
      );
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      products = products.filter(
        (prod) =>
          prod.name.toLowerCase().includes(query) ||
          prod.category.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'category':
        products.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        products.sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  }

  selectCategory(category) {
    this.selectedCategory = category;
    this.updateProductsGrid();
    this.updateCategoryTabs();
  }

  updateSearchQuery(query) {
    this.searchQuery = query;
    this.updateProductsGrid();
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    this.updateProductsGrid();
  }

  openModal() {
    this.editingProduct = null;
    this.showProductModal();
  }

  openEditModal(productId) {
    this.editingProduct = store.getState().products.find(
      (prod) => String(prod.id) === String(productId)
    );
    if (this.editingProduct) {
      this.showProductModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
  }

  getProductFormHtml(product, categories) {
    const categoryOptions = categories
      .map((cat) => `<option value="${cat}">`)
      .join('');
    return `
      <form id="product-form" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" value="${product.name}" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="Product name" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Price *</label><input type="number" name="price" value="${product.price}" required min="0" step="0.01" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="0.00" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Category *</label><input type="text" name="category" value="${product.category}" required list="categories" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="Select or type category" /><datalist id="categories">${categoryOptions}</datalist></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Image Path</label><input type="text" name="image" value="${product.image || ''}" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none" placeholder="products/item.jpg" /></div>
      </form>
    `;
  }

  showProductModal() {
    const categories = getCategories(store.getState().products);
    const isEdit = !!this.editingProduct;
    const product = this.editingProduct || {
      name: '',
      price: '',
      category: '',
      image: '',
    };

    createModal({
      title: isEdit ? 'Edit Product' : 'Add Product',
      html: this.getProductFormHtml(product, categories),
      actions: [
        { label: 'Cancel', variant: 'secondary' },
        {
          label: isEdit ? 'Save Changes' : 'Add Product',
          variant: 'primary',
          onClick: () => this.handleSaveProduct(isEdit),
        },
      ],
    });
  }

  handleSaveProduct(isEdit) {
    const form = document.getElementById('product-form');
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const image = formData.get('image') || 'products/placeholder.jpg';

    if (!name || !category || isNaN(price)) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    if (isEdit && this.editingProduct) {
      const result = updateProduct(this.editingProduct.id, {
        name,
        price,
        category,
        image,
      });
      if (result.success) {
        toast('Product updated', 'success');
      } else {
        toast(result.error || 'Failed to update product', 'error');
        return;
      }
    } else {
      const result = addProduct(name, price, category, image);
      if (result.success) {
        toast('Product added', 'success');
      } else {
        toast(result.error || 'Failed to add product', 'error');
        return;
      }
    }

    this.editingProduct = null;
    this.closeModal();
    this.updateProductsGrid();
    this.updateCategoryTabs();
  }

  async handleDelete(productId) {
    const product = store
      .getState()
      .products.find((prod) => String(prod.id) === String(productId));
    if (!product) return;

    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"?`,
      confirmText: 'Delete',
      danger: true,
    });

    if (confirmed) {
      deleteProduct(productId);
      toast('Product deleted', 'info');
      this.updateProductsGrid();
      this.updateCategoryTabs();
    }
  }

  updateProductsGrid() {
    const products = this.getFilteredProducts();
    const gridEl = document.querySelector('[data-products-grid]');

    if (gridEl) {
      // Save scroll position
      const scrollContainer =
        gridEl.closest('[data-products-scroll]') || gridEl.parentElement;
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

      gridEl.innerHTML = products
        .map((prod) => this.renderProductCard(prod))
        .join('');

      // Restore scroll position
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    }
  }

  updateCategoryTabs() {
    const categories = ['All', ...getCategories()];
    const buttonsHtml = categories
      .map(
        (cat) => `
        <button 
          onclick="menuScreen.selectCategory('${cat}')"
          class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
            this.selectedCategory === cat
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }"
        >
          ${cat} ${
            cat === 'All'
              ? `(${store.getState().products.length})`
              : `(${store.getState().products.filter((prod) => prod.category === cat).length})`
          }
        </button>
      `
      )
      .join('');

    updateSection('[data-category-tabs]', buttonsHtml, false); // Use innerHTML, not outerHTML
  }

  // Router already exposes screen instance globally
  mount() {
    globalThis.menuScreen = this;
  }

  unmount() {
    delete globalThis.menuScreen;
  }
}

export default MenuScreen;
