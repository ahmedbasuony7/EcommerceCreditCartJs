
//  vareiables 
const carbtn = document.querySelector(".cart-btn");
const closebtn = document.querySelector(".close-cart");
const clearcartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDom = document.querySelector(".product-center");

// cart
let cart = [];


// buttons 
let buttonsDom = []; 

//  getteing the product 
class Products{
    async getproduct(){
        try{
            let result = await fetch('http://127.0.0.1:5500/products.json');
            console.log(result);

            let data = await result.json();
            console.log(data);

            let products = data.items;
            products = products.map(item => {
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image};
            });
            return products;
        }
        catch(error){
            console.log(error);
        }
    }
}

// display products
class UI{
    displayProduct(products){  
        let result = '';
        products.forEach(product => {
            //console.log(product.imge)
            result += `
            <!--  start single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} class="product-img" alt="">
                    <button class="bag-btn" data-id=${product.id}> 
                        <i class="fas fa-shopping-cart "> add to cart </i>
                    </button>
                </div>
                <h3> ${product.title} </h3>
                <h4> $${product.price} </h4>
            </article>
            <!--  end single product  -->
            `;
        });
        productDom.innerHTML = result;
    }
    
    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDom = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            //console.log(id);
            let inCart = cart.find(item =>item.id === id);

            if(inCart){
                button.innerText = "In Cart";
                button.disabled= true;
            }else{
                button.addEventListener('click',(event)=>{
                    event.target.innerText = "in cart";
                    event.target.disabled = true;
                    
                    // get products from products
                    let cartitem = {...Storage.getProduct(id),amount:1};
                    
                    // add product to the cart
                    cart = [...cart,cartitem];
                    //console.log(cartitem);

                    // save cart in localstorage
                    Storage.saveCart(cart);   
                    
                    // set cart values 
                    this.setCartValues(cart);
                    
                    // display cart items
                    this.addCartItem(cartitem);
                    
                    // show the cart 
                    this.showCart();

                });
            }
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        //console.log(div);
        //console.log(item.image)
        div.innerHTML = 
        `<img src=${item.image}  alt="product">
            <div>
                <h4> ${item.title}  </h4>
                <h5> $${item.price} </h5>
                <span class="remove-item" data-id=${item.id}> 
                    remove 
                </span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id} > </i>
                <p class="item-amount" data-item=${item.amount}> 1 </p>
                <i class="fas fa-chevron-down" data-item=${item.id}> </i>
            </div> 
        `;
            cartContent.appendChild(div);
            console.log(cartContent);
            // console.log(cartOverlay)
    }
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDom.classList.add("showCart");
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        carbtn.addEventListener('click',this.showCart)
        closebtn.addEventListener('click',this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDom.classList.remove("showcart");
    }
    carLogic(){
          // clear cart button 
        clearcartBtn.addEventListener('click',() => {
        this.clearcart()
    });
    //  cart fnctionality 
    cartContent.addEventListener('click',event => {
        //console.log(event.target);
        if(event.target.classList.contains('remove-item')){
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cartContent.removeChild(removeItem.parentElement.parentElement);
            this.removeItem(id);
        }else if(event.target.classList.contains("fa-chevron-up")){
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            //console.log(addAmount);
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;

        }else if(event.target.classList.contains("fa-chevron-down")){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id !== id);
            //console.log(temp);
            tempItem.amount = tempItem.amount - 1;
            if(tempItem.amount > 0){
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;  
            }else{
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }
        }
    });
    }
    clearcart(){
        //console.log(this);
        let cartitem = cart.map(item => item.id);
        cartitem.forEach(id => this.removeItem(id));
        //console.log(cartContent.children);
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart `;
    }
    getSingleButton(id){
        return buttonsDom.find(button => button.dataset.id === id)
    }
}

//  localstorage 
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(
            localStorage.getItem('products'));
        return products.find(product=> product.id === id);
    }
    static saveCart(){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []  ;
    }
}
document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();

    // setup app 
    ui.setupAPP(); 

    //  get all products
    products.getproduct().then(products => {
        ui.displayProduct(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.carLogic();
    });
});  

