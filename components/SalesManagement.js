function SalesManagement({ userType }) {
  const [products, setProducts] = React.useState([]);
  const [sales, setSales] = React.useState([]);
  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [showSaleForm, setShowSaleForm] = React.useState(false);

  React.useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const snapshot = await firebaseDB.getProducts();
      const productsData = snapshot.val() || {};
      const productsList = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      }));
      setProducts(productsList.filter(p => p.quantidade > 0));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadSales = async () => {
    try {
      const snapshot = await firebaseDB.getSales();
      const salesData = snapshot.val() || {};
      const salesList = Object.keys(salesData).map(key => ({
        id: key,
        ...salesData[key]
      }));
      setSales(salesList.reverse());
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const handleSale = async () => {
    try {
      if (!selectedProduct || !quantity) {
        helpers.showAlert('Erro', 'Selecione um produto e quantidade', 'error');
        return;
      }

      const product = products.find(p => p.id === selectedProduct);
      const saleQuantity = parseInt(quantity);

      if (saleQuantity > product.quantidade) {
        helpers.showAlert('Erro', 'Quantidade insuficiente em estoque', 'error');
        return;
      }

      const saleData = {
        productId: product.id,
        productName: product.nome,
        quantity: saleQuantity,
        unitPrice: product.precoVenda,
        total: product.precoVenda * saleQuantity,
        date: new Date().toISOString(),
        seller: userType
      };

      await firebaseDB.addSale(saleData);
      
      const newQuantity = product.quantidade - saleQuantity;
      await firebaseDB.updateProduct(product.id, { quantidade: newQuantity });

      helpers.showAlert('Sucesso', 'Venda registrada com sucesso!');
      setSelectedProduct('');
      setQuantity('');
      setShowSaleForm(false);
      loadProducts();
      loadSales();
    } catch (error) {
      console.error('Error processing sale:', error);
      helpers.showAlert('Erro', 'Erro ao processar venda', 'error');
    }
  };

  try {
    return (
      <div data-name="sales-management" data-file="components/SalesManagement.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Vendas</h2>
          <button
            onClick={() => setShowSaleForm(true)}
            className="btn-success flex items-center"
          >
            <div className="icon-plus mr-2"></div>
            Nova Venda
          </button>
        </div>

        {showSaleForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Registrar Venda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="p-3 border rounded-lg"
                required
              >
                <option value="">Selecionar produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.nome} - {helpers.formatCurrency(product.precoVenda)} (Estoque: {product.quantidade})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="p-3 border rounded-lg"
                min="1"
                required
              />
              <div className="flex space-x-2">
                <button onClick={handleSale} className="btn-success">
                  Vender
                </button>
                <button onClick={() => setShowSaleForm(false)} className="btn-danger">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Histórico de Vendas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Quantidade</th>
                  <th className="text-left p-3">Preço Unit.</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id} className="border-b">
                    <td className="p-3">{helpers.formatDateTime(sale.date)}</td>
                    <td className="p-3">{sale.productName}</td>
                    <td className="p-3">{sale.quantity}</td>
                    <td className="p-3">{helpers.formatCurrency(sale.unitPrice)}</td>
                    <td className="p-3">{helpers.formatCurrency(sale.total)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sale.seller === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.seller === 'admin' ? 'Admin' : 'Funcionário'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SalesManagement component error:', error);
    return null;
  }
}