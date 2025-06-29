function CustomerFeedback({ userType }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    customerName: '',
    productId: '',
    rating: 5,
    comment: ''
  });

  React.useEffect(() => {
    loadFeedbacks();
    loadProducts();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const snapshot = await firebaseDB.getFeedbacks();
      const feedbacksData = snapshot.val() || {};
      const feedbacksList = Object.keys(feedbacksData).map(key => ({
        id: key,
        ...feedbacksData[key]
      }));
      setFeedbacks(feedbacksList.reverse());
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

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
      const feedbackData = {
        ...formData,
        date: new Date().toISOString(),
        status: 'novo'
      };

      await firebaseDB.addFeedback(feedbackData);
      helpers.showAlert('Sucesso', 'Feedback registrado com sucesso!');
      resetForm();
      loadFeedbacks();
    } catch (error) {
      console.error('Error saving feedback:', error);
      helpers.showAlert('Erro', 'Erro ao salvar feedback', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      productId: '',
      rating: 5,
      comment: ''
    });
    setShowFeedbackForm(false);
  };

  const getAverageRating = (productId) => {
    const productFeedbacks = feedbacks.filter(f => f.productId === productId);
    if (productFeedbacks.length === 0) return 0;
    const sum = productFeedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / productFeedbacks.length).toFixed(1);
  };

  try {
    return (
      <div data-name="customer-feedback" data-file="components/CustomerFeedback.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Feedback dos Clientes</h2>
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="btn-primary flex items-center"
          >
            <div className="icon-message-circle mr-2"></div>
            Novo Feedback
          </button>
        </div>

        {showFeedbackForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Registrar Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do cliente"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <select
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">Selecionar produto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.nome}</option>
                ))}
              </select>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full p-3 border rounded-lg"
              >
                <option value={5}>5 Estrelas - Excelente</option>
                <option value={4}>4 Estrelas - Bom</option>
                <option value={3}>3 Estrelas - Regular</option>
                <option value={2}>2 Estrelas - Ruim</option>
                <option value={1}>1 Estrela - Péssimo</option>
              </select>
              <textarea
                placeholder="Comentários"
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">Salvar</button>
                <button type="button" onClick={resetForm} className="btn-danger">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Feedbacks Recentes</h3>
          <div className="space-y-4">
            {feedbacks.slice(0, 10).map(feedback => {
              const product = products.find(p => p.id === feedback.productId);
              return (
                <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{feedback.customerName}</h4>
                      <p className="text-sm text-gray-600">{product?.nome}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`icon-star text-sm ${
                          i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">{helpers.formatDate(feedback.date)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CustomerFeedback component error:', error);
    return null;
  }
}