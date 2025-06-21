import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
const firebaseConfig = {
  apiKey: "AIzaSyArQxe4gqsD1AjQjQ50bqeNHcnpbcwVQIQ",
  authDomain: "resturant-62854.firebaseapp.com",
  databaseURL: "https://resturant-62854-default-rtdb.firebaseio.com",
  projectId: "resturant-62854",
  storageBucket: "resturant-62854.appspot.com",
  messagingSenderId: "719599328677",
  appId: "1:719599328677:web:7cd8a54b9658716f81dc4c",
  measurementId: "G-ZNC81CREWE"
};
var currentOrderId = Math.floor(Math.random() * 1000000000000);

var currentOrder = null;
const app = initializeApp(firebaseConfig);
// Initialize Realtime Database
const db = getDatabase(app);
// Function to get categories from Firebase Realtime Database
const getCategories = () => {
  const categories = document.querySelector('.categories-container')
  categories.innerHTML = '<img src="./assets/loader.avif" alt="Loading..." class="loading">';
  const categoryRef = ref(db, 'category');
  onValue(categoryRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      getfoodItems(Object.keys(data)[0]);
      const categoriesListContainer = document.createElement('ul')
      Object.keys(data).forEach(key => {
        const categoryItem = document.createElement('div');
        categoryItem.innerHTML = `
        <div class="category-image">
          <img src="${data[key].image}" alt="category - ${data[key].name}">
        </div>
        <div class="category-name">
        <p>${data[key].name}</p>
        <p>${data[key].items}</p>
        </div>`
        categoryItem.addEventListener('click', () => {
          getfoodItems(key);
        });
        const categoryItemContainer = document.createElement('li')
        categoryItemContainer.appendChild(categoryItem)
        categoriesListContainer.appendChild(categoryItemContainer);
      });
      categories.innerHTML = '';
      categories.appendChild(categoriesListContainer);
    } else {
      console.log('No categories found');
    }
  }, (error) => {
    console.error('Error reading data:', error);
  });
}
// Function to set item order to Firebase Realtime Database
const setItemToOrder = (item) => {
  let key = item.id
  currentOrder = currentOrder ? { ...currentOrder } : {}
  currentOrder[key] = item;

}
const addItemToOrderView = (item) => {
  const container = document.querySelector('.order-items')
  const itemContainer = document.createElement('div')
  itemContainer.setAttribute('data-order-item', `order-item-${item.id}`)
  itemContainer.innerHTML = `
  <div class='order-item-image'>
    <img src=${item.photo} alt=${item.name}/>
  </div>
  <div class='order-item-details'>
    <span>${item.name}</span>
    <strong>${item.price}</strong>
  </div>
  `
  itemContainer.classList.add('order-item');
  itemContainer.appendChild(numberinput(item))
  container.appendChild(itemContainer)
}
function confirmOrder() {
  const orderRef = ref(db, `orders/${currentOrderId}`);
  set(orderRef, currentOrder).then(() => {
    document.querySelector('.order-items').innerHTML = '';
    for (let key in currentOrder.items) {
      const x = document.querySelector(`#${CSS.escape(key)}`)
      x.replaceChild(createOrderButton(currentOrder.items[key]), x.lastElementChild);
    }
    currentOrder = null;
    currentOrderId = Math.floor(Math.random() * 1000000000000);
    closeOrderView()
  })
    .catch((error) => {
      console.error("Error writing data:", error);
    });
}

const numberinput = (item) => {
  const container = document.createElement('div')
  container.classList.add('numberInput')
  const addButton = document.createElement('button')
  addButton.innerHTML = '+'
  const number = document.createElement('span')
  number.setAttribute('data-order-numeric', `numeric-${item.id}`);
  number.innerHTML = item?.count ?? 1;
  const minusButton = document.createElement('button')
  minusButton.innerHTML = '-'
  item.count = item?.count ?? 1;
  addButton.addEventListener('click', () => {
    if (number.innerHTML < 50) {
      const x = document.querySelectorAll(`[data-order-numeric='numeric-${item.id}']`)
      x.forEach(y => y.innerHTML = `${++y.innerHTML}`);
      item.count = number.innerHTML;
    }
  })
  minusButton.addEventListener('click', () => {
    if (number.innerHTML > 1) {
      const x = document.querySelectorAll(`[data-order-numeric='numeric-${item.id}']`)
      x.forEach(y => y.innerHTML = `${--y.innerHTML}`);
      item.count = number.innerHTML;
    } else {
      const itemcontainer = document.getElementById(`${item.id}`);
      const lastNode = Array.from(itemcontainer.childNodes)[itemcontainer.childNodes.length - 1]
      if (lastNode) {
        itemcontainer.removeChild(lastNode)
        itemcontainer.appendChild(createOrderButton(item));
        removeFromOrder(item)
      }
    }

  })
  container.appendChild(addButton)
  container.appendChild(number)
  container.appendChild(minusButton)
  container.classList.add('numberInput')
  return container;
}
const removeFromOrder = (item) => {
  delete currentOrder[item.id]
  console.log(currentOrder)
  document.querySelector('.order-items').removeChild(
    document.querySelector(`[data-order-item='order-item-${item.id}']`)
  )

}
const createOrderButton = (item) => {
  const orderButton = document.createElement('button');
  orderButton.innerHTML = 'order'
  orderButton.addEventListener('click', () => {
    const itemcontainer = document.getElementById(`${item.id}`);
    const buttonNode = Array.from(itemcontainer.childNodes).find(node =>
      node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BUTTON'
    );
    if (buttonNode)
      itemcontainer.removeChild(buttonNode)
    itemcontainer.appendChild(numberinput(item))
    setItemToOrder(item);
    addItemToOrderView(item);
  })

  return orderButton;
}

const getfoodItems = (categoryKey) => {
  const container = document.querySelector('.menu-items-container');
  container.innerHTML = '<img src="./assets/loader.avif" alt="Loading..." class="loading">';

  const db = getDatabase(); // Ensure this is correctly initialized
  const foodRef = ref(db, `food`); // Point to user's food items

  const foodQuery = query(foodRef, orderByChild('category'), equalTo(categoryKey));
  onValue(foodQuery, (snapshot) => {
    const data = snapshot.val();
    container.innerHTML = '';

    if (data) {
      const fragment = document.createDocumentFragment();
      Object.values(data).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        div.setAttribute('id', item.id)
        div.innerHTML = `
          <div class="food-image">
            <img src="${item.photo}" alt="${item.name}">
          </div>
          <div class="food-details">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span class="price">$${item.price}</span>
          </div>
        `;
        if (currentOrder && currentOrder[item.id]) {
          div.appendChild(numberinput(currentOrder[item.id]))
        } else
          div.appendChild(createOrderButton(item))
        fragment.appendChild(div);
      });
      container.appendChild(fragment);
    }
  }, (error) => {
    console.error('Error reading data:', error);
  });
};
const toggleOrderView = () => {
  document.querySelector('.order-button').addEventListener('click', () => {
    const orderButton = document.querySelector('.order-button');
    if (orderButton) {
      orderButton.style.display = 'none';
      document.querySelector('.close-order-button').classList.add('active-close-order-button');
      document.querySelector('.order-container').classList.add('active-order-container');
      document.querySelector('.order-section').classList.add('active-order-section');
    }
  });
  document.querySelector('.close-order-button').addEventListener('click', () => {

      closeOrderView()
    
  });
}
const closeOrderView = () => {
      const closeOrderButton = document.querySelector('.close-order-button');
    if (closeOrderButton) {
      document.querySelector('.order-button').style.display = 'block';
      document.querySelector('.close-order-button').classList.remove('active-close-order-button');
      document.querySelector('.order-container').classList.remove('active-order-container');
      document.querySelector('.order-section').classList.remove('active-order-section');
    }
}
const getlogo = () => {
  const logoRef = ref(db, `logo`);
  onValue(logoRef, (snapshot) => {
    const data = snapshot.val();
    const image = document.querySelector('#logo');
    image.setAttribute('src', data);
    image.setAttribute('alt', 'logo-image');
  }, (error) => {
    console.error('Error reading data:', error);
  });
};
const getsocialMedia = () => {
  const logoRef = ref(db, `socialMedia`);
  onValue(logoRef, (snapshot) => {
    const data = snapshot.val();
    document.querySelector('#whatApp-link').setAttribute('href', data.whatsapp);
    document.querySelector('#youtube-link').setAttribute('href', data.youtube);
    document.querySelector('#facebook-link').setAttribute('href', data.facebook);
    document.querySelector('#instagram-link').setAttribute('href', data.instagram);

  }, (error) => {
    console.error('Error reading data:', error);
  });
};
document.getElementById('order-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (currentOrder) {
    currentOrder = { ...Object.fromEntries(new FormData(event.target).entries()), items: currentOrder }
  }
  confirmOrder()
})
toggleOrderView();
getlogo();
getsocialMedia();
getCategories();