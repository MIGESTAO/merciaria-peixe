function ProductManagement({ userType }) {
  const [products, setProducts] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [formData, setFormData] = React.useState({
    nome: '',
    categoria: '',
    quantidade: '',
    precoCompra: '',
    precoVenda: '',
    dataValidade: '',
    imagem: ''
  });

  React.useEffect(() => {
    loadProducts();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        quantidade: parseInt(formData.quantidade),
        precoCompra: parseFloat(formData.precoCompra),
        precoVenda: parseFloat(formData.precoVenda),
        dataAtualizacao: helpers.formatDateTime()
      };

      if (editingProduct) {
        await firebaseDB.updateProduct(editingProduct.id, productData);
        helpers.showAlert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        await firebaseDB.addProduct(productData);
        helpers.showAlert('Sucesso', 'Produto adicionado com sucesso!');
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      helpers.showAlert('Erro', 'Erro ao salvar produto', 'error');
    }
  };

  const handleDelete = async (product) => {
    try {
      const result = await helpers.showConfirm(
        'Confirmar exclusão',
        `Deseja realmente excluir o produto "${product.nome}"?`
      );
      
      if (result.isConfirmed) {
        await firebaseDB.deleteProduct(product.id);
        helpers.showAlert('Sucesso', 'Produto excluído com sucesso!');
        loadProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      helpers.showAlert('Erro', 'Erro ao excluir produto', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      quantidade: '',
      precoCompra: '',
      precoVenda: '',
      dataValidade: '',
      imagem: ''
    });
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const startEdit = (product) => {
    setFormData({
      nome: product.nome,
      categoria: product.categoria,
      quantidade: product.quantidade.toString(),
      precoCompra: product.precoCompra.toString(),
      precoVenda: product.precoVenda.toString(),
      dataValidade: product.dataValidade,
      imagem: product.imagem || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  try {
    return (
      <div data-name="product-management" data-file="components/ProductManagement.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Produtos</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-plus mr-2"></div>
              Adicionar Produto
            </button>
          )}
        </div>

        {showAddForm && userType === 'admin' && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do produto"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço de compra (MT)"
                value={formData.precoCompra}
                onChange={(e) => setFormData({...formData, precoCompra: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço de venda (MT)"
                value={formData.precoVenda}
                onChange={(e) => setFormData({...formData, precoVenda: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="date"
                placeholder="Data de validade"
                value={formData.dataValidade}
                onChange={(e) => setFormData({...formData, dataValidade: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="url"
                placeholder="URL da imagem (opcional)"
                value={formData.imagem}
                onChange={(e) => setFormData({...formData, imagem: e.target.value})}
                className="p-3 border rounded-lg md:col-span-2"
              />
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Atualizar' : 'Adicionar'}
                </button>
                <button type="button" onClick={resetForm} className="btn-danger">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Quantidade</th>
                  <th className="text-left p-3">Preço Venda</th>
                  <th className="text-left p-3">Validade</th>
                  {userType === 'admin' && <th className="text-left p-3">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b">
                    <td className="p-3">{product.nome}</td>
                    <td className="p-3">{product.categoria}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded ${
                        product.quantidade < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantidade}
                      </span>
                    </td>
                    <td className="p-3">{helpers.formatCurrency(product.precoVenda)}</td>
                    <td className="p-3">{helpers.formatDate(product.dataValidade)}</td>
                    {userType === 'admin' && (
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <div className="icon-edit"></div>
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <div className="icon-trash"></div>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProductManagement component error:', error);
    return null;
  }
}