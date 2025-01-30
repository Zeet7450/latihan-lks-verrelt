document.addEventListener('DOMContentLoaded', function() {
    // Update badge cart di shopping bag
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        const shoppingBagIcon = document.querySelector('#lg-bag a');
        
        if (shoppingBagIcon) {
            const existingBadge = shoppingBagIcon.querySelector('.cart-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            if (cartCount > 0) {
                const badge = document.createElement('span');
                badge.classList.add('cart-badge');
                badge.textContent = cartCount;
                shoppingBagIcon.style.position = 'relative';
                shoppingBagIcon.appendChild(badge);
            }
        }
    }

    

    // Menambahkan produk ke keranjang
    function addToCart(productData) {
        if (!productData || !productData.id) {
            console.error('Data produk tidak valid');
            return;
        }

        const size = prompt('Pilih Ukuran (S/M/L/XL):').toUpperCase();
        if (!size || !['S', 'M', 'L', 'XL'].includes(size)) {
            alert('Ukuran tidak valid!');
            return;
        }

        const productToCart = {
            ...productData,
            size: size,
            quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productToCart.id && item.size === productToCart.size);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(productToCart);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        alert(`${productToCart.name} dengan ukuran ${size} telah ditambahkan ke keranjang!`);
        loadCartItems(); // Memuat item keranjang setelah ditambahkan
    }

    // Fungsi untuk memuat item keranjang di halaman cart
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartTableBody = document.querySelector("#cart-items");

        if (cartTableBody) {
            cartTableBody.innerHTML = '';
            cart.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <i class="far fa-times-circle remove-item" data-index="${index}"></i>
                    </td>
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <select class="size-select" data-index="${index}">
                            <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
                            <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
                            <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
                            <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>XL</option>
                        </select>
                    </td>
                    <td>
                        <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="quantity-input">
                    </td>
                    <td class="subtotal" data-index="${index}">$${(item.price * item.quantity).toFixed(2)}</td>
                `;
                cartTableBody.appendChild(row);
            });
            calculateTotal(cart);
            setupRemoveItemListeners();
            setupEditItemListeners();
        }
    }

    

    // Fungsi untuk menghapus item dari keranjang
    function setupRemoveItemListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge();
                loadCartItems();
            });
        });
    }

    // Fungsi untuk mengedit item di keranjang
    function setupEditItemListeners() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const newQuantity = parseInt(this.value);
                if (newQuantity < 1) {
                    alert('Jumlah tidak bisa kurang dari 1!');
                    this.value = 1; // Reset ke 1 jika kurang dari 1
                    return;
                }
                cart[index].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartItems(); // Refresh item keranjang
            });
        });

        const sizeSelects = document.querySelectorAll('.size-select');
        sizeSelects.forEach(select => {
            select.addEventListener('change', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart[index].size = this.value;
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartItems(); // Refresh item keranjang
            });
        });
    }

    // Fungsi untuk proses checkout
    function setupCheckout() {
        const checkoutButton = document.querySelector('#checkout-button');

        if (checkoutButton) {
            checkoutButton.addEventListener('click', function() {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length === 0) {
                    alert('Keranjang Anda kosong! Silakan tambahkan produk sebelum checkout.');
                    return;
                }

                const totalRow = document.querySelector('#subtotal .total-value');
                const finalTotal = parseFloat(totalRow.textContent.replace('$', '').trim());

                if (finalTotal <= 0) {
                    alert('Total tidak valid untuk checkout.');
                    return;
                }

                alert(`Checkout berhasil! Total yang harus dibayar adalah: $${finalTotal.toFixed(2)}`);
                localStorage.removeItem('cart');
                updateCartBadge();
                loadCartItems();
            });
        }
    }


    
    function calculateTotal(cart) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalElement = document.querySelector("#subtotal .subtotal-value");
        const totalElement = document.querySelector("#subtotal .total-value");
        const discountElement = document.querySelector("#subtotal .discount-value");
    
        if (subtotalElement) {
            subtotalElement.textContent = `$${total.toFixed(2)}`;
        }
    
        // Logika diskon yang dinamis
        let finalTotal = total;
        let discount = 0;
    
        if (total >= 200) {
            discount = Math.min(total * 0.3, 50); // Maksimal diskon $50
            finalTotal = total - discount;
        }
    
        if (totalElement) {
            totalElement.textContent = `$${finalTotal.toFixed(2)}`;
        }
    
        if (discountElement) {
            discountElement.textContent = `$${discount.toFixed(2)}`;
        }
    
        return { total, finalTotal, discount };
    }
    
    function setupDiscountCode() {
        const applyButton = document.querySelector('#coupon .normal');
        const couponInput = document.querySelector('#coupon input[type="text"]');
    
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const { total, finalTotal, discount } = calculateTotal(cart);
                const couponCode = couponInput.value.trim();
                
                // Memeriksa kode diskon
                if (couponCode === "EASYDISCOUNT") {
                    if (total >= 200) {
                        alert(`Diskon berhasil diterapkan! Anda mendapatkan diskon $${discount.toFixed(2)}.`);
                    } else {
                        alert('Total pembelanjaan minimal $200 untuk mendapatkan diskon.');
                        
                        // Reset diskon jika total di bawah $200
                        const totalElement = document.querySelector("#subtotal .total-value");
                        const discountElement = document.querySelector("#subtotal .discount-value");
                        
                        if (totalElement) {
                            totalElement.textContent = `$${total.toFixed(2)}`;
                        }
                        
                        if (discountElement) {
                            discountElement.textContent = `$0.00`;
                        }
                    }
                } else {
                    alert('Kode diskon tidak valid.');
                }
            });
        }
    }
    
    // Modifikasi loadCartItems untuk memastikan diskon selalu dihitung ulang
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartTableBody = document.querySelector("#cart-items");
    
        if (cartTableBody) {
            cartTableBody.innerHTML = '';
            cart.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    // ... kode rendering item sebelumnya ...
                `;
                cartTableBody.appendChild(row);
            });
            
            // Hitung total 
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Elemen-elemen untuk diupdate
            const subtotalElement = document.querySelector("#subtotal .subtotal-value");
            const totalElement = document.querySelector("#subtotal .total-value");
            const discountElement = document.querySelector("#subtotal .discount-value");
            
            // Ambil status diskon dari localStorage
            const discountApplied = localStorage.getItem('discountApplied') === 'true';
            
            // Update subtotal
            if (subtotalElement) {
                subtotalElement.textContent = `$${total.toFixed(2)}`;
            }
            
            // Proses diskon
            if (discountApplied && total >= 200) {
                // Hitung diskon (maks 30% atau $50)
                const discount = Math.min(total * 0.3, 50);
                const finalTotal = total - discount;
    
                if (totalElement) totalElement.textContent = `$${finalTotal.toFixed(2)}`;
                if (discountElement) discountElement.textContent = `$${discount.toFixed(2)}`;
            } else {
                // Reset diskon jika total di bawah $200 atau diskon tidak diterapkan
                localStorage.removeItem('discountApplied');
                if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
                if (discountElement) discountElement.textContent = `$0.00`;
            }
            
            setupRemoveItemListeners();
            setupEditItemListeners();
        }
    }
    
    function setupDiscountCode() {
        const applyButton = document.querySelector('#coupon .normal');
        const couponInput = document.querySelector('#coupon input[type="text"]');
    
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const couponCode = couponInput.value.trim();
                
                const subtotalElement = document.querySelector("#subtotal .subtotal-value");
                const totalElement = document.querySelector("#subtotal .total-value");
                const discountElement = document.querySelector("#subtotal .discount-value");
    
                // Memeriksa kode diskon
                if (couponCode === "EASYDISCOUNT") {
                    if (total >= 200) {
                        // Hitung diskon (maks 30% atau $50)
                        const discount = Math.min(total * 0.3, 50);
                        const finalTotal = total - discount;
    
                        // Simpan status diskon
                        localStorage.setItem('discountApplied', 'true');
    
                        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
                        if (totalElement) totalElement.textContent = `$${finalTotal.toFixed(2)}`;
                        if (discountElement) discountElement.textContent = `$${discount.toFixed(2)}`;
    
                        alert(`Diskon berhasil diterapkan! Anda mendapatkan diskon $${discount.toFixed(2)}.`);
                    } else {
                        alert('Total pembelanjaan minimal $200 untuk mendapatkan diskon.');
                        
                        // Reset tampilan dan hapus status diskon
                        localStorage.removeItem('discountApplied');
                        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
                        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
                        if (discountElement) discountElement.textContent = `$0.00`;
                    }
                } else {
                    alert('Kode diskon tidak valid.');
                    
                    // Reset tampilan dan hapus status diskon
                    localStorage.removeItem('discountApplied');
                    if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
                    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
                    if (discountElement) discountElement.textContent = `$0.00`;
                }
            });
        }
    }
    
    function setupRemoveItemListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach((button, index) => {
            button.addEventListener('click', function() {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Muat ulang item keranjang untuk update tampilan dan diskon
                loadCartItems();
                updateCartBadge();
            });
        });
    }
    
    function setupEditItemListeners() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const newQuantity = parseInt(this.value);
                
                if (newQuantity < 1) {
                    alert('Jumlah tidak bisa kurang dari 1!');
                    this.value = 1;
                    return;
                }
                
                cart[index].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Muat ulang item keranjang untuk update tampilan dan diskon
                loadCartItems();
                updateCartBadge();
            });
        });
    }
    
    function initialize() {
        updateCartBadge();
        loadCartItems();
        setupAddToCartListeners();
        setupCheckout();
        setupDiscountCode();
    }
    
    function setupEditItemListeners() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const newQuantity = parseInt(this.value);
                
                if (newQuantity < 1) {
                    alert('Jumlah tidak bisa kurang dari 1!');
                    this.value = 1;
                    return;
                }
                
                cart[index].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Muat ulang item keranjang untuk update tampilan
                loadCartItems();
            });
        });
    }

    

    // Inisialisasi semua fungsi
    function initialize() {
        updateCartBadge();
        loadCartItems();
        setupAddToCartListeners();
        setupCheckout();
        setupDiscountCode(); // Menambahkan setup untuk diskon
    }

    function setupAddToCartListeners() {
        const cartButtons = document.querySelectorAll('.fal.fa-shopping-cart.cart');
        cartButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                // Multiple prevention methods
                event.preventDefault();
                event.stopPropagation(); // Menghentikan event naik ke parent
    
                // Cegah navigasi jika ada link
                if (this.getAttribute('href')) {
                    this.removeAttribute('href');
                }
    
                const productCard = this.closest('.pro');
                if (!productCard) {
                    console.error('Produk tidak ditemukan');
                    return false;
                }
        
                const productData = {
                    id: productCard.getAttribute('data-id') || Date.now(),
                    name: productCard.querySelector('.des h5')?.textContent || 'Produk Tidak Dikenal',
                    price: parseFloat(productCard.querySelector('.des h4')?.textContent.replace('$', '') || 0),
                    image: productCard.querySelector('img')?.src || ''
                };
        
                addToCart(productData);
                
                return false; // Tambahan pencegahan
            });
        });
    }

    // Memanggil inisialisasi saat DOM siap
    initialize();
});

document.addEventListener('DOMContentLoaded', function() {
    // Fungsi untuk memperbarui badge keranjang
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const badge = document.querySelector('.cart-badge');
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Memperbarui tampilan badge
        if (itemCount > 0) {
            badge.textContent = itemCount;
            badge.style.display = 'inline'; // Tampilkan badge jika ada item
        } else {
            badge.style.display = 'none'; // Sembunyikan badge jika tidak ada item
        }
    }

    // Fungsi untuk menambahkan produk ke keranjang
    function addToCart(productData) {
        if (!productData || !productData.id) {
            console.error('Data produk tidak valid');
            return;
        }

        const size = prompt('Pilih Ukuran (S/M/L/XL):').toUpperCase();
        if (!size || !['S', 'M', 'L', 'XL'].includes(size)) {
            alert('Ukuran tidak valid!');
            return;
        }

        const productToCart = {
            ...productData,
            size: size,
            quantity: 1
        };

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productToCart.id && item.size === productToCart.size);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(productToCart);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge(); // Memperbarui badge setelah menambahkan produk
        alert(`${productToCart.name} dengan ukuran ${size} telah ditambahkan ke keranjang!`);
        loadCartItems(); // Memuat item keranjang setelah ditambahkan
    }

    // Fungsi untuk memuat item keranjang
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';

        let subtotal = 0;

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><i class="far fa-times-circle remove-item" data-index="${index}"></i></td>
                <td><img src="${item.image}" alt=""></td>
                <td>${item.name}</td>
                <td>${item.size || 'N/A'}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td><input type="number" class="quantity-input" value="${item.quantity}" data-index="${index}"></td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            `;
            cartItemsContainer.appendChild(row);
            subtotal += item.price * item.quantity;
        });

        // Update subtotal
        document.querySelector('#subtotal tr:nth-child(1) td:nth-child(2)').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('#subtotal tr:nth-child(4) td:nth-child(2)').textContent = `$${subtotal.toFixed(2)}`; // Total
        setupRemoveItemListeners();
        setupEditItemListeners();
        updateCartBadge(); // Memperbarui badge setelah memuat item
    }

    // Fungsi untuk menghitung total
    function calculateTotal() {
        const subtotal = parseFloat(document.querySelector('#subtotal tr:nth-child(1) td:nth-child(2)').textContent.replace('$', ''));
        return subtotal;
    }

    // Fungsi untuk menghapus item dari keranjang
    function setupRemoveItemListeners() {
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.dataset.index;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadge(); // Memperbarui badge setelah menghapus item
                loadCartItems(); // Memuat ulang item keranjang
            });
        });
    }

        // Fungsi untuk mengedit item di keranjang
        function setupEditItemListeners() {
            const quantityInputs = document.querySelectorAll('.quantity-input');
            quantityInputs.forEach(input => {
                input.addEventListener('change', function() {
                    const index = this.dataset.index;
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const newQuantity = parseInt(this.value);
                    if (newQuantity < 1) {
                        alert('Jumlah tidak bisa kurang dari 1!');
                        this.value = 1; // Reset ke 1 jika kurang dari 1
                        return;
                    }
                    cart[index].quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    loadCartItems(); // Refresh item keranjang
                });
            });
        }

        function loadCartItems() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const cartTableBody = document.querySelector("#cart-items");
        
            if (cartTableBody) {
                cartTableBody.innerHTML = '';
                cart.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <i class="far fa-times-circle remove-item" data-index="${index}"></i>
                        </td>
                        <td><img src="${item.image}" alt="${item.name}"></td>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>
                            <select class="size-select" data-index="${index}">
                                <option value="S" ${item.size === 'S' ? 'selected' : ''}>S</option>
                      console.log('DOM Content Loaded');
console.log('Cart Badge Updated');
console.log('Cart Items Loaded');
console.log('Add to Cart Listeners Set Up');
console.log('Checkout Set Up');
console.log('Discount Code Set Up');
console.log('Remove Item Listeners Set Up');
console.log('Edit Item Listeners Set Up');          <option value="M" ${item.size === 'M' ? 'selected' : ''}>M</option>
                                <option value="L" ${item.size === 'L' ? 'selected' : ''}>L</option>
                                <option value="XL" ${item.size === 'XL' ? 'selected' : ''}>XL</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="quantity-input">
                        </td>
                        <td class="subtotal" data-index="${index}">$${(item.price * item.quantity).toFixed(2)}</td>
                    `;
                    cartTableBody.appendChild(row);
                });
                calculateTotal(cart);
                setupRemoveItemListeners();
                setupEditItemListeners();
            }
        }
        
        function setupEditItemListeners() {
            // Tambahkan event listener untuk perubahan ukuran
            const sizeSelects = document.querySelectorAll('.size-select');
            sizeSelects.forEach(select => {
                select.addEventListener('change', function() {
                    const index = this.dataset.index;
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart[index].size = this.value;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    loadCartItems(); // Refresh item keranjang
                });
            });
        
            // Existing quantity input listener
            const quantityInputs = document.querySelectorAll('.quantity-input');
            quantityInputs.forEach(input => {
                input.addEventListener('change', function() {
                    const index = this.dataset.index;
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const newQuantity = parseInt(this.value);
                    if (newQuantity < 1) {
                        alert('Jumlah tidak bisa kurang dari 1!');
                        this.value = 1;
                        return;
                    }
                    cart[index].quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    loadCartItems();
                });
            });
        }
    
        // Fungsi untuk proses checkout
        function setupCheckout() {
            const checkoutButton = document.querySelector('#checkout-button');
    
            if (checkoutButton) {
                checkoutButton.addEventListener('click', function() {
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    if (cart.length === 0) {
                        alert('Keranjang Anda kosong! Silakan tambahkan produk sebelum checkout.');
                        return;
                    }
    
                    const finalTotal = calculateTotal();
                    console.log('Final Total:', finalTotal); // Debugging
    
                    if (finalTotal <= 0) {
                        alert('Total tidak valid untuk checkout.');
                        return;
                    }
    
                    alert(`Checkout berhasil! Total yang harus dibayar adalah: $${finalTotal.toFixed(2)}`);
                    localStorage.removeItem('cart');
                    updateCartBadge(); // Memperbarui badge setelah checkout
                    loadCartItems(); // Memuat ulang item keranjang
                });
            }
        }

        
    
        // Inisialisasi semua fungsi
        function initialize() {
            updateCartBadge(); // Memperbarui badge saat inisialisasi
            loadCartItems(); // Memuat item keranjang saat inisialisasi
            setupAddToCartListeners(); // Setup untuk menambah produk ke keranjang
            setupCheckout(); // Setup untuk proses checkout
        }
    
        
        // Setup event listener untuk tombol "Add to Cart"
    function setupAddToCartListeners() {
        const addToCartButton = document.querySelector('.add-to-cart-btn');
        addToCartButton.addEventListener('click', function(event) {
            event.preventDefault(); // Cegah navigasi jika ada link

            const productData = {
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-name'),
                price: parseFloat(this.getAttribute('data-price')),
                image: this.getAttribute('data-image')
            };

            addToCart(productData); // Panggil fungsi addToCart
        });
    }

    function addToCart(productId) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);
    
        if (existingProductIndex > -1) {
            // Jika produk sudah ada, tambahkan kuantitas
            cart[existingProductIndex].quantity += 1;
        } else {
            // Jika produk baru, tambahkan ke keranjang
            cart.push({ id: productId, quantity: 1 });
        }
    
        // Simpan kembali ke localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge(); // Memperbarui badge keranjang
    }

    

        // Memanggil fungsi inisialisasi saat DOM siap
        initialize();
    });
    
    
    
    