function CompetitorAnalysis({ userType }) {
  const [products, setProducts] = React.useState([]);
  const [competitors, setCompetitors] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    localizacao: '',
    telefone: ''
  });

  React.useEffect(() => {
    loadProducts();
    loadCompetitors();
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

  const loadCompetitors = async () => {
    try {
      const snapshot = await firebaseDB.getCompetitors();
      const competitorsData = snapshot.val() || {};
      const competitorsList = Object.keys(competitorsData).map(key => ({
        id: key,
        ...competitorsData[key]
      }));
      setCompetitors(competitorsList);
    } catch (error) {
      console.error('Error loading competitors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const competitorData = {
        ...formData,
        dataRegistro: new Date().toISOString(),
        produtos: {}
      };

      await firebaseDB.addCompetitor(competitorData);
      helpers.showAlert('Sucesso', 'Concorrente adicionado com sucesso!');
      resetForm();
      loadCompetitors();
    } catch (error) {
      console.error('Error adding competitor:', error);
      helpers.showAlert('Erro', 'Erro ao adicionar concorrente', 'error');
    }
  };

  const updateCompetitorPrice = async (competitorId, productId, price) => {
    try {
      await firebaseDB.updateCompetitorPrice(competitorId, productId, price);
      helpers.showAlert('Sucesso', 'Preço atualizado!');
      loadCompetitors();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const suggestPriceAdjustment = (product) => {
    const competitorPrices = competitors.map(comp => 
      comp.produtos && comp.produtos[product.id] ? comp.produtos[product.id].preco : null
    ).filter(price => price !== null);

    if (competitorPrices.length === 0) return null;

    const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
    const minCompetitorPrice = Math.min(...competitorPrices);
    
    if (product.precoVenda > avgCompetitorPrice * 1.1) {
      return { type: 'reduce', suggestion: avgCompetitorPrice * 0.95 };
    } else if (product.precoVenda < minCompetitorPrice * 0.9) {
      return { type: 'increase', suggestion: minCompetitorPrice * 0.98 };
    }
    return null;
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      localizacao: '',
      telefone: ''
    });
    setShowAddForm(false);
  };

  try {
    return (
      <div data-name="competitor-analysis" data-file="components/CompetitorAnalysis.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Análise da Concorrência</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-plus mr-2"></div>
              Adicionar Concorrente
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Concorrente</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome do estabelecimento"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Localização"
                value={formData.localizacao}
                onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                className="p-3 border rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="p-3 border rounded-lg md:col-span-2"
              />
              <div className="md:col-span-2 flex space-x-4">
                <button type="submit" className="btn-primary">Adicionar</button>
                <button type="button" onClick={resetForm} className="btn-danger">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Sugestões de Ajuste de Preços</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map(product => {
              const suggestion = suggestPriceAdjustment(product);
              if (!suggestion) return null;
              
              return (
                <div key={product.id} className={`p-3 rounded ${
                  suggestion.type === 'reduce' ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{product.nome}</span>
                    <div className="text-sm">
                      <span className="text-gray-600">Atual: {helpers.formatCurrency(product.precoVenda)}</span>
                      <span className={`ml-2 ${
                        suggestion.type === 'reduce' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Sugestão: {helpers.formatCurrency(suggestion.suggestion)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitors.map(competitor => (
            <div key={competitor.id} className="card">
              <h3 className="text-lg font-semibold mb-2">{competitor.nome}</h3>
              <p className="text-sm text-gray-600 mb-4">{competitor.localizacao}</p>
              <div className="text-xs text-gray-500">
                Registrado em {helpers.formatDate(competitor.dataRegistro)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('CompetitorAnalysis component error:', error);
    return null;
  }
}