function InventoryManagement({ userType }) {
  const [products, setProducts] = React.useState([]);
  const [reorderPoints, setReorderPoints] = React.useState({});
  const [showReorderForm, setShowReorderForm] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState('');

  React.useEffect(() => {
    loadProducts();
    loadReorderPoints();
  }, []);

  const loadProducts = async () => {
    try {
      const snapshot = await firebaseDB.getProducts();
      const productsData = snapshot.val() || {};
      const productsList = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      }));
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadReorderPoints = async () => {
    try {
      const snapshot = await firebaseDB.getReorderPoints();
      const reorderData = snapshot.val() || {};
      setReorderPoints(reorderData);
    } catch (error) {
      console.error('Error loading reorder points:', error);
    }
  };

  const setReorderPoint = async (productId, point) => {
    try {
      await firebaseDB.setReorderPoint(productId, { point, dateSet: new Date().toISOString() });
      helpers.showAlert('Sucesso', 'Ponto de reposição definido!');
      loadReorderPoints();
    } catch (error) {
      console.error('Error setting reorder point:', error);
    }
  };

  const generatePurchaseOrder = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const orderData = {
        productId,
        productName: product.nome,
        currentStock: product.quantidade,
        recommendedOrder: Math.max(50 - product.quantidade, 10),
        status: 'pendente',
        dateCreated: new Date().toISOString()
      };

      await firebaseDB.addPurchaseOrder(orderData);
      helpers.showAlert('Sucesso', 'Ordem de compra gerada!');
    } catch (error) {
      console.error('Error generating purchase order:', error);
    }
  };

  const getProductsNeedingReorder = () => {
    return products.filter(product => {
      const reorderPoint = reorderPoints[product.id]?.point || 10;
      return product.quantidade <= reorderPoint;
    });
  };

  try {
    return (
      <div data-name="inventory-management" data-file="components/InventoryManagement.js">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Inventário</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card" data-aos="fade-up">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="icon-alert-triangle text-xl text-orange-600"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Produtos para Repor</p>
                <p className="text-2xl font-bold text-gray-800">{getProductsNeedingReorder().length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Estoque Atual</th>
                  <th className="text-left p-3">Ponto de Reposição</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {getProductsNeedingReorder().map(product => (
                  <tr key={product.id} className="border-b">
                    <td className="p-3">{product.nome}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                        {product.quantidade}
                      </span>
                    </td>
                    <td className="p-3">{reorderPoints[product.id]?.point || 10}</td>
                    <td className="p-3">
                      <button
                        onClick={() => generatePurchaseOrder(product.id)}
                        className="text-blue-600 hover:text-blue-700 mr-2"
                      >
                        <div className="icon-shopping-cart"></div>
                      </button>
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
    console.error('InventoryManagement component error:', error);
    return null;
  }
}