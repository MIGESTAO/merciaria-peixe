const firebaseConfig = {
  apiKey: "AIzaSyA1Fefo19PT7dap3J0z4ohE2BVhub7U9N4",
  authDomain: "mercearia-e1e8e.firebaseapp.com",
  databaseURL: "https://mercearia-e1e8e-default-rtdb.firebaseio.com",
  projectId: "mercearia-e1e8e",
  storageBucket: "mercearia-e1e8e.firebasestorage.app",
  messagingSenderId: "211104638560",
  appId: "1:211104638560:web:0f2cd09b00e5f572bb0505",
  measurementId: "G-LC5BMXZXEE"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

window.firebaseDB = {
  // Produtos
  addProduct: (product) => database.ref('produtos').push(product),
  getProducts: () => database.ref('produtos').once('value'),
  updateProduct: (id, product) => database.ref(`produtos/${id}`).update(product),
  deleteProduct: (id) => database.ref(`produtos/${id}`).remove(),
  
  // Vendas
  addSale: (sale) => database.ref('vendas').push(sale),
  getSales: () => database.ref('vendas').once('value'),
  
  // Funcionários
  addEmployee: (employee) => database.ref('funcionarios').push(employee),
  getEmployees: () => database.ref('funcionarios').once('value'),
  
  // Usuários
  addUser: (user) => database.ref('usuarios').push(user),
  getUsers: () => database.ref('usuarios').once('value'),
  
  // Fornecedores
  addSupplier: (supplier) => database.ref('fornecedores').push(supplier),
  getSuppliers: () => database.ref('fornecedores').once('value'),
  updateSupplier: (id, supplier) => database.ref(`fornecedores/${id}`).update(supplier),
  deleteSupplier: (id) => database.ref(`fornecedores/${id}`).remove(),
  
  // Clientes
  addCustomer: (customer) => database.ref('clientes').push(customer),
  getCustomers: () => database.ref('clientes').once('value'),
  updateCustomer: (id, customer) => database.ref(`clientes/${id}`).update(customer),
  
  // Compras
  addPurchase: (purchase) => database.ref('compras').push(purchase),
  getPurchases: () => database.ref('compras').once('value')
};
