// ===============================
// FIREBASE CONFIG
// ===============================
var firebaseConfig = {
  apiKey: "AIzaSyBI4Ool-ny1Dqo943oCdftedpGttRpujFg",
  authDomain: "lost-and-found-system-sj.firebaseapp.com",
  projectId: "lost-and-found-system-sj",
  storageBucket: "lost-and-found-system-sj.firebasestorage.app",
  messagingSenderId: "795011842008",
  appId: "1:795011842008:web:bb2e32c886b98f17eb3cad"
};

// ===============================
// INITIALIZE FIREBASE
// ===============================
firebase.initializeApp(firebaseConfig);

// ===============================
// SERVICES
// ===============================
var auth = firebase.auth();
var db = firebase.firestore();

// ===============================
// ELEMENTS
// ===============================
var email = document.getElementById("email");
var password = document.getElementById("password");
var loginBtn = document.getElementById("loginBtn");
var registerBtn = document.getElementById("registerBtn");
var logoutBtn = document.getElementById("logoutBtn");
var authDiv = document.getElementById("auth");
var appDiv = document.getElementById("app");
var form = document.getElementById("itemForm");
var itemsDiv = document.getElementById("items");
var imageInput = document.getElementById("image");

// ===============================
// REGISTER
// ===============================
registerBtn.onclick = function () {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Account created 🎉"))
    .catch(err => alert(err.message));
};

// ===============================
// LOGIN
// ===============================
loginBtn.onclick = function () {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .catch(err => alert(err.message));
};

// ===============================
// LOGOUT
// ===============================
logoutBtn.onclick = function () {
  auth.signOut();
};

// ===============================
// AUTH STATE
// ===============================
auth.onAuthStateChanged(function (user) {
  if (user) {
    authDiv.style.display = "none";
    appDiv.style.display = "block";
    loadItems();
  } else {
    authDiv.style.display = "block";
    appDiv.style.display = "none";
  }
});

// ===============================
// IMAGE COMPARISON (SIMPLE)
// ===============================
function compareImages(img1, img2) {
  return Math.abs(img1.length - img2.length) < 5000;
}

// ===============================
// MATCH CHECK
// ===============================
function checkMatches(newItem) {
  db.collection("items").get().then(snapshot => {
    snapshot.forEach(doc => {
      var item = doc.data();

      if (item.type === newItem.type) return;
      if (!item.image || !newItem.image) return;

      var textMatch =
        item.name.includes(newItem.name) ||
        newItem.name.includes(item.name) ||
        item.description.includes(newItem.description);

      var imageMatch = compareImages(item.image, newItem.image);

      if (textMatch || imageMatch) {
        alert(
          "🤖 MATCH FOUND!\n\n" +
          "Lost ↔ Found item detected\n\n" +
          "Item: " + item.name
        );
      }
    });
  });
}

// ===============================
// SUBMIT ITEM
// ===============================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  var type = document.getElementById("type").value;
  var name = document.getElementById("name").value.toLowerCase();
  var desc = document.getElementById("desc").value.toLowerCase();
  var imageFile = imageInput.files[0];

  if (!imageFile) {
    alert("Please select an image 📸");
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    var itemData = {
      type: type,
      name: name,
      description: desc,
      image: reader.result,
      userEmail: auth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("items").add(itemData).then(() => {
      alert("Item saved 🎉");
      checkMatches(itemData);
      form.reset();
      loadItems();
    });
  };

  reader.readAsDataURL(imageFile);
});

// ===============================
// LOAD ITEMS
// ===============================
function loadItems() {
  itemsDiv.innerHTML = "";

  db.collection("items")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        var d = doc.data();
        itemsDiv.innerHTML += `
          <hr>
          <h3>${d.type}: ${d.name}</h3>
          <p>${d.description}</p>
          <img src="${d.image}">
        `;
      });
    });
}
