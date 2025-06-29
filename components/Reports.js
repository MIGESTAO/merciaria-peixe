function Reports() {
  const [salesData, setSalesData] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [dateFilter, setDateFilter] = React.useState('today');
  const [customDate, setCustomDate] = React.useState('');

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const salesSnapshot = await firebaseDB.getSales();
      const productsSnapshot = await firebaseDB.getProducts();
      
      const sales = salesSnapshot.val() || {};
      const products = productsSnapshot.val() || {};
      
      setSalesData(Object.values(sales));
      setProducts(Object.values(products));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getFilteredSales = () => {
    const now = new Date();
    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      
      switch (dateFilter) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case 'custom':
          return customDate ? saleDate.toDateString() === new Date(customDate).toDateString() : true;
        default:
          return true;
      }
    });
  };

  const getSalesStats = () => {
    const filtered = getFilteredSales();
    const totalSales = filtered.reduce((sum, sale) => sum + sale.total, 0);
    const totalQuantity = filtered.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const productSales = {};
    filtered.forEach(sale => {
      if (productSales[sale.productName]) {
        productSales[sale.productName] += sale.quantity;
      } else {
        productSales[sale.productName] = sale.quantity;
      }
    });
    
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return { totalSales, totalQuantity, topProducts };
  };

  const calculateProfit = () => {
    const filtered = getFilteredSales();
    let totalProfit = 0;
    
    filtered.forEach(sale => {
      const product = products.find(p => p.nome === sale.productName);
      if (product) {
        const profit = (sale.unitPrice - product.precoCompra) * sale.quantity;
        totalProfit += profit;
      }
    });
    
    return totalProfit;
  };

  const stats = getSalesStats();
  const profit = calculateProfit();

  try {
    return (
      <div data-name="reports" data-file="components/Reports.js">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h2>
        
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="flex flex-wrap gap-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Este Mês</option>
              <option value="custom">Data Específica</option>
            </select>
            
            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="p-2 border rounded"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-dollar-sign text-xl text-green-600"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-800">{helpers.formatCurrency(stats.totalSales)}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-trending-up text-xl text-blue-600"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Lucro Total</p>
                <p className="text-2xl font-bold text-gray-800">{helpers.formatCurrency(profit)}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="icon-package text-xl text-purple-600"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Produtos Vendidos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalQuantity}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
            <div className="space-y-3">
              {stats.topProducts.map(([product, quantity], index) => (
                <div key={product} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{product}</span>
                  </div>
                  <span className="text-gray-600">{quantity} unidades</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Exportar Relatórios</h3>
            <ExportSystem salesData={getFilteredSales()} products={products} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Reports component error:', error);
    return null;
  }
}