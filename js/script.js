import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
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
const app=initializeApp(firebaseConfig);
// Initialize Realtime Database
const db = getDatabase(app);
// Function to get categories from Firebase Realtime Database
const getCategories=()=>{
    const categoryRef = ref(db, 'category');
    onValue(categoryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            getfoodItems(Object.keys(data)[0]);
            Object.keys(data).forEach(key => {
                const categoryItem = document.createElement('button');
                categoryItem.textContent = data[key].name;
                categoryItem.addEventListener('click', (e) => {
                    getfoodItems(key);
                });
                const li=document.createElement('li')
                li.appendChild(categoryItem)
                document.querySelector('.categories-container ul').appendChild(li);
            });
        } else {
            console.log('No categories found');
        }
    }, (error) => {
        console.error('Error reading data:', error);
    });
}

const getfoodItems = (categoryKey) => {
  const foodItemsRef = ref(db, `food`);
  onValue(foodItemsRef, (snapshot) => {
    const data = snapshot.val();
    const container = document.querySelector('.menu-items-container');
    container.innerHTML = ''; // Clear existing items

    if (data) {
      const fragment = document.createDocumentFragment();
      Object.values(data).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        div.innerHTML = `
          <img src="${item.photo}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <span>Price: <strong>$${item.price}</strong></span>
        `;
        fragment.appendChild(div);
      });
      container.appendChild(fragment);
    }
  }, (error) => {
    console.error('Error reading data:', error);
  });
};
getCategories();
// return snapshot.payload.val() ? Object.values(snapshot.payload.val()) : [];
//         const snapshot = await firstValueFrom(
//             this.db.object(`schools/${schoolId}`).snapshotChanges()
//         );
//         const value = snapshot.payload.val() as Record<string, any> | null;
//         console.log(value)
//         return snapshot.payload.exists()
//             ? { ...value, key: snapshot.payload.key }
//             : null;