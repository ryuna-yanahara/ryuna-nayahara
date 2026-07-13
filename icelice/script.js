document.addEventListener('DOMContentLoaded', function() {

    // ★★★★★★★★★★★★★★★★★★★★
    // ★ ここが修正ポイント ★
    // ★★★★★★★★★★★★★★★★★★★★
    // まず、HTML要素を取得して変数に格納します
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const nav = document.querySelector('.nav');
    // ★★★★★★★★★★★★★★★★★★★★

    // --- 商品データ ---
    const products = {
        strawberry: {
            name: '雪どけいちご「越後姫」',
            price: 3500,
            image: 'images/product-strawberry.jpg',
            catchcopy: '雪室が引き出した、春だけの宝石。',
            description: '新潟が誇るブランド苺「越後姫」。大粒で瑞々しく、芳醇な香りが特徴です。収穫後、雪室でじっくりと追熟させることで、酸味はまろやかになり、いちご本来の甘みが最大限に引き出されます。',
            specs: '内容量: 1パック 約300g (9〜15粒)<br>産地: 新潟県南魚沼市'
        },
        apple: {
            name: '雪下りんご「ふじ」',
            price: 4200,
            image: 'images/product-apple.jpg',
            catchcopy: '雪の下で目覚めた、驚異の甘さ。',
            description: '豪雪地帯の知恵「雪下りんご」。雪の下で越冬させることで、りんごは寒さから身を守るために糖分を蓄え、蜜がたっぷり入った濃厚な味わいに変化します。シャキシャキした食感もたまりません。',
            specs: '内容量: 約2kg (6〜8玉)<br>産地: 新潟県南魚沼市'
        }
    };

    // --- 共通処理 ---
    const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
    const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
    const updateCartCount = () => {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    };

    // --- ページごとの処理 ---
    const pagePath = window.location.pathname;

    // 商品詳細ページの処理
    if (pagePath.includes('product-detail.html')) {
        // (この部分は変更ありません)
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = products[productId];
        const root = document.getElementById('product-detail-root');

        if (product) {
            root.innerHTML = `
                <div class="product-gallery"><img src="${product.image}" alt="${product.name}" class="main-image"></div>
                <div class="product-info">
                    <h1 class="product-title">${product.name}</h1>
                    <p class="product-catchcopy">${product.catchcopy}</p>
                    <p class="product-page-price">¥${product.price.toLocaleString()} <span>(税込・送料別)</span></p>
                    <p class="product-page-desc">${product.description}</p>
                    <div class="order-form">
                        <div class="form-group">
                            <label for="quantity">数量</label>
                            <select id="quantity" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>
                        </div>
                        <button id="add-to-cart-btn" class="btn btn-full">カートに入れる</button>
                    </div>
                    <div class="product-specs"><h3>商品情報</h3><p>${product.specs}</p></div>
                </div>`;
            
            document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('quantity').value);
                let cart = getCart();
                const existingItem = cart.find(item => item.id === productId);

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ id: productId, quantity: quantity });
                }
                saveCart(cart);
                updateCartCount();
                const showAddedToCart = (productName) => {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';

    toast.innerHTML = `
        <p>✔ ${productName} をカートに追加しました</p>
        <div class="toast-actions">
            <a href="cart.html" class="btn-toast">カートを見る</a>
            <button class="btn-toast-close">閉じる</button>
        </div>
    `;

    document.body.appendChild(toast);

    // 閉じるボタン
    toast.querySelector('.btn-toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // 自動で消える
    setTimeout(() => {
        toast.remove();
    }, 4000);
};
showAddedToCart(product.name);
            });
        } else {
            root.innerHTML = '<p>商品が見つかりませんでした。</p>';
        }
    }

    // カートページの処理
    if (pagePath.includes('cart.html')) {
        // (この部分は変更ありません)
        const renderCart = () => {
            const cart = getCart();
            const container = document.getElementById('cart-items-container');
            const summary = document.getElementById('cart-summary');
            
            if (cart.length === 0) {
                container.innerHTML = '<div class="empty-cart-message"><p>カートに商品がありません。</p><a href="product.html" class="btn">お買い物を続ける</a></div>';
                summary.innerHTML = '';
                return;
            }

            let total = 0;
            container.innerHTML = cart.map(item => {
                const product = products[item.id];
                const subtotal = product.price * item.quantity;
                total += subtotal;
                return `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h3>${product.name}</h3>
                            <p>単価: ¥${product.price.toLocaleString()}</p>
                        </div>
                        <div class="cart-item-actions">
                            <input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1">
                            <p>小計: ¥${subtotal.toLocaleString()}</p>
                            <button class="remove-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>`;
            }).join('');

            summary.innerHTML = `
                <h3>合計金額: ¥${total.toLocaleString()} (税込)</h3>
                <p>※送料は別途計算されます。</p>
                <button class="btn">購入手続きへ進む</button>
            `;

            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    let cart = getCart();
                    cart = cart.filter(item => item.id !== id);
                    saveCart(cart);
                    renderCart();
                    updateCartCount();
                });
            });

            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const newQuantity = parseInt(e.currentTarget.value);
                    let cart = getCart();
                    const item = cart.find(i => i.id === id);
                    if (item && newQuantity > 0) {
                        item.quantity = newQuantity;
                        saveCart(cart);
                        renderCart();
                        updateCartCount();
                    }
                });
            });
        };
        renderCart();
    }

    // --- 全ページで実行される処理 ---
    updateCartCount();
    
    // ハンバーガーメニューのクリックイベント
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
});