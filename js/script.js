const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = [];


//Abrir o modal do carrinho 
cartBtn.addEventListener("click", function () {
  updateCartModal();
  cartModal.style.display = "flex"
})

//Fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event){
  if(event.target === cartModal){
    cartModal.style.display ="none"
  }
})

closeModalBtn.addEventListener("click", function(){
  cartModal.style.display ="none"
})

menu.addEventListener("click", function(event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const sizeSelectId = parentButton.getAttribute("data-size-id");
    const sizeSelect = document.getElementById(sizeSelectId);

    if (sizeSelect) {
      const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
      const price = parseFloat(selectedOption.getAttribute("data-price"));
      const size = selectedOption.value;

      addToCart(name, price, size);
    }
  }
});

function addToCart(name, price, size) {
  const existingItem = cart.find(item => item.name === name && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      size,
      quantity: 1,
    });
  }
  
  updateCartModal();
}

function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-04", "flex-col");

    // Verifica se há tamanho ou não (pizzas têm tamanho, bebidas não)
    const itemSizeDisplay = item.size ? ` (${item.size})` : ""; 

    const quantityDisplay = item.name.toLowerCase().includes('bebida') ? "1,5L" : item.size || ''; // Altera a forma de exibir

    cartItemElement.innerHTML = ` 
     <div class="flex items-center justify-between">
       <div>
          <p class="font-medium ">${item.name} ${itemSizeDisplay}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
       </div>
         <button class="remove-from-cart-btn" data-name="${item.name}" data-size="${item.size}">
           Remover
         </button>
     </div>`;
   
   
    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  cartCounter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); // Atualiza a contagem total
  //cartCounter.innerHTML = cart.length;
}

// Atualizar o contador de itens no botão do carrinho
function updateCartCounter() {
  cartCounter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

document.querySelectorAll('.size-select').forEach(select => {
  select.addEventListener('change', function(event) {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const priceElementId = 'price-' + event.target.id.split('-')[1];
    const priceElement = document.getElementById(priceElementId);

    const newPrice = selectedOption.getAttribute('data-price');
    priceElement.textContent = `R$ ${parseFloat(newPrice).toFixed(2)}`;
  });
});

cartItemsContainer.addEventListener("click", function(event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    const size = event.target.getAttribute("data-size");
    removeItemCart(name, size);
  }
});

function removeItemCart(name, size) {
  const index = cart.findIndex(item => item.name === name && item.size === size);

  if (index !== -1) {
    const item = cart[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();
  }
}

checkoutBtn.addEventListener("click", function() {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Ops, Pizzaria Ruben está fechado no momento!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) return;

  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  // Calcular o total
  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);


  const cartItems = cart.map((item) => {
// Inicializamos a variável de tamanho vazia
 let tamanho = '';

   // Verificamos se o item tem um tamanho e se ele não é uma bebida
   if (item.size && !(item.name.toLowerCase().includes('coca') || item.name.toLowerCase().includes('bebida'))) {
    tamanho = ` | Tamanho: ${item.size}`;  // Adicionamos o tamanho apenas se o item não for uma bebida
}

    return `Produto: ${item.name} | Quantidade: (${item.quantity}) | Tamanho: ${item.size || ''} | Preço Unitário: R$ ${item.price.toFixed(2)}\n`;
  }).join("\n");

  const message = encodeURIComponent(`Pedido: \n${cartItems}  \nTotal: R$ ${total.toFixed(2)} \nEndereço de Entrega: ${addressInput.value}`);
  const phone = "5592982128930";

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

  cart = [];
  updateCartModal();
});

// Função para adicionar bebidas ao carrinho (sem tamanho)
document.querySelectorAll(".drink-add-to-cart-btn").forEach(button => {
  button.addEventListener("click", function() {
    const name = button.getAttribute("data-name");
    const price = parseFloat(button.getAttribute("data-price"));

    addDrinkToCart(name, price);  // Chama a função específica para bebidas
  });
});

// Função para adicionar a bebida no carrinho
function addDrinkToCart(name, price) {
  const existingDrink = cart.find(item => item.name === name && !item.size); // Procura sem o tamanho

  if (existingDrink) {
    existingDrink.quantity += 1;  // Aumenta a quantidade se a bebida já existir no carrinho
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }

  updateCartModal(); 
}




 //Atualiza o carrinho com a bebida

// Função para remover itens do carrinho


cartItemsContainer.addEventListener("click", function(event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
  
     removeDrinkFromCart(name);

    }
  });

function removeItemCart(name){
  const index = cart.findIndex(item => item.name === name);

  if(index !== -1){
    const item = cart[index];
    if(item.quantity > 1){
      item.quantity -= 1;
      updateCartModal();
      return;
    }

    cart.splice(index, 1);
    updateCartModal();

  }


}



addressInput.addEventListener("input", function(event){
  let inputValue = event.target.value;

  if(inputValue !== ""){
    addressInput.classList.remove("border-red-500")
    addressWarn.classList.add("hidden")
  }
})
  // Função para remover uma bebida do carrinho


  //function removeDrinkFromCart(name) {
   //const index = cart.findIndex(item => item.name === name && item.size === size);


  //if (index !== -1) {
    //const item = cart[index];
    //if (item.quantity > 1) {
      //item.quantity -= 1;
    //} else {
     // cart.splice(index, 1);
    //}
    //updateCartModal();
  //}
//}



//Verificar a hora e manipular o card e horário
 function checkRestaurantOpen(){
  const data = new Date();
  const hora = data.getHours();
  return hora  >= 17 && hora < 24; 
  //true = restaurante está aberto
}

const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();

if(isOpen){
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600")
}else{
  spanItem.classList.remove("bg-green-600")
  spanItem.classList.add("bg-red-500")
}