function Dashboard({ userType, onLogout, currentView, setCurrentView }) {
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    totalSales: 0,
    todaySales: 0,
    lowStock: 0
  });

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const productsSnapshot = await firebaseDB.getProducts();
      const salesSnapshot = await firebaseDB.getSales();
      
      const products = productsSnapshot.val() || {};
      const sales = salesSnapshot.val() || {};
      
      const today = new Date().toDateString();
      const todaySales = Object.values(sales).filter(sale => 
        new Date(sale.date).toDateString() === today
      ).reduce((total, sale) => total + sale.total, 0);

      const lowStockCount = Object.values(products).filter(product => 
        product.quantidade < 10
      ).length;

      setStats({
        totalProducts: Object.keys(products).length,
        totalSales: Object.values(sales).reduce((total, sale) => total + sale.total, 0),
        todaySales,
        lowStock: lowStockCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const menuItems = userType === 'admin' ? [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'products', icon: 'package', label: 'Produtos' },
    { id: 'sales', icon: 'shopping-cart', label: 'Vendas' },
    { id: 'suppliers', icon: 'truck', label: 'Fornecedores' },
    { id: 'customers', icon: 'users', label: 'Fidelidade' },
    { id: 'analytics', icon: 'chart-bar', label: 'Analytics' },
    { id: 'reports', icon: 'file-text', label: 'Relatórios' }
  ] : [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'products', icon: 'package', label: 'Produtos' },
    { id: 'sales', icon: 'shopping-cart', label: 'Vendas' },
    { id: 'customers', icon: 'users', label: 'Fidelidade' }
  ];

  try {
    return (
      <div className="min-h-screen product-grid" data-name="dashboard" data-file="components/Dashboard.js">
        <NotificationSystem />
        {/* Header */}
        <header className="glass-effect shadow-lg border-b border-white/20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="icon-store text-2xl text-blue-600 mr-3"></div>
              <h1 className="text-xl font-bold text-gray-800">Mercearia Micten</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                userType === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {userType === 'admin' ? 'Administrador' : 'Funcionário'}
              </span>
              <button
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 flex items-center"
              >
                <div className="icon-log-out mr-1"></div>
                Sair
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 glass-effect shadow-xl h-screen border-r border-white/20">
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map(item => (
                  <li key={item.id}>
                    <div
                      onClick={() => setCurrentView(item.id)}
                      className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                    >
                      <div className={`icon-${item.icon} mr-3`}></div>
                      {item.label}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {currentView === 'dashboard' && (
              <div>
                <ProductCarousel />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8" data-aos="fade-right">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="icon-package text-xl text-white"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 font-medium">Total de Produtos</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalProducts}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card" data-aos="fade-up" data-aos-delay="200">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="icon-trending-up text-xl text-white"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 font-medium">Vendas Hoje</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{helpers.formatCurrency(stats.todaySales)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card" data-aos="fade-up" data-aos-delay="300">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="icon-dollar-sign text-xl text-white"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 font-medium">Total de Vendas</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{helpers.formatCurrency(stats.totalSales)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card" data-aos="fade-up" data-aos-delay="400">
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="icon-alert-triangle text-xl text-white"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-600 font-medium">Estoque Baixo</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{stats.lowStock}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentView === 'products' && <ProductManagement userType={userType} />}
            {currentView === 'sales' && <SalesManagement userType={userType} />}
            {currentView === 'suppliers' && userType === 'admin' && <SupplierManagement userType={userType} />}
            {currentView === 'customers' && <CustomerLoyalty userType={userType} />}
            {currentView === 'analytics' && userType === 'admin' && <Analytics />}
            {currentView === 'reports' && userType === 'admin' && <Reports />}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard component error:', error);
    return null;
  }
}