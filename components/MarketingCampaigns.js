function MarketingCampaigns({ userType }) {
  const [campaigns, setCampaigns] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    descricao: '',
    desconto: '',
    dataInicio: '',
    dataFim: '',
    tipoCliente: 'todos'
  });

  React.useEffect(() => {
    loadCampaigns();
    loadCustomers();
  }, []);

  const loadCampaigns = async () => {
    try {
      const snapshot = await firebaseDB.getCampaigns();
      const campaignsData = snapshot.val() || {};
      const campaignsList = Object.keys(campaignsData).map(key => ({
        id: key,
        ...campaignsData[key]
      }));
      setCampaigns(campaignsList);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const snapshot = await firebaseDB.getCustomers();
      const customersData = snapshot.val() || {};
      setCustomers(Object.values(customersData));
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const campaignData = {
        ...formData,
        desconto: parseFloat(formData.desconto),
        status: 'ativa',
        dataCriacao: new Date().toISOString(),
        clientesEnviados: 0
      };

      await firebaseDB.addCampaign(campaignData);
      helpers.showAlert('Sucesso', 'Campanha criada com sucesso!');
      resetForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      helpers.showAlert('Erro', 'Erro ao criar campanha', 'error');
    }
  };

  const sendCampaign = async (campaign) => {
    try {
      const targetCustomers = getTargetCustomers(campaign.tipoCliente);
      const message = `🛒 ${campaign.nome}\n${campaign.descricao}\n💰 ${campaign.desconto}% de desconto\nVálido até ${helpers.formatDate(campaign.dataFim)}`;
      
      console.log(`Enviando campanha para ${targetCustomers.length} clientes: ${message}`);
      
      await firebaseDB.updateCampaign(campaign.id, { 
        clientesEnviados: targetCustomers.length,
        dataEnvio: new Date().toISOString()
      });
      
      helpers.showAlert('Sucesso', `Campanha enviada para ${targetCustomers.length} clientes!`);
      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      helpers.showAlert('Erro', 'Erro ao enviar campanha', 'error');
    }
  };

  const getTargetCustomers = (tipo) => {
    switch (tipo) {
      case 'vip': return customers.filter(c => c.pontos >= 1000);
      case 'gold': return customers.filter(c => c.pontos >= 500 && c.pontos < 1000);
      case 'silver': return customers.filter(c => c.pontos >= 100 && c.pontos < 500);
      default: return customers;
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      desconto: '',
      dataInicio: '',
      dataFim: '',
      tipoCliente: 'todos'
    });
    setShowCreateForm(false);
  };

  try {
    return (
      <div data-name="marketing-campaigns" data-file="components/MarketingCampaigns.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Campanhas de Marketing</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-plus mr-2"></div>
              Nova Campanha
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Criar Campanha</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome da campanha"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Descrição da promoção"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="w-full p-3 border rounded-lg h-20"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Desconto (%)"
                  value={formData.desconto}
                  onChange={(e) => setFormData({...formData, desconto: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
              </div>
              <select
                value={formData.tipoCliente}
                onChange={(e) => setFormData({...formData, tipoCliente: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="todos">Todos os Clientes</option>
                <option value="vip">Clientes VIP</option>
                <option value="gold">Clientes Gold</option>
                <option value="silver">Clientes Silver</option>
              </select>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">Criar Campanha</button>
                <button type="button" onClick={resetForm} className="btn-danger">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{campaign.nome}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  campaign.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{campaign.descricao}</p>
              <p className="text-sm text-gray-500 mb-4">
                Desconto: {campaign.desconto}% | 
                Válido: {helpers.formatDate(campaign.dataInicio)} - {helpers.formatDate(campaign.dataFim)}
              </p>
              {campaign.clientesEnviados > 0 && (
                <p className="text-sm text-blue-600 mb-4">
                  Enviado para {campaign.clientesEnviados} clientes
                </p>
              )}
              {userType === 'admin' && !campaign.dataEnvio && (
                <button
                  onClick={() => sendCampaign(campaign)}
                  className="btn-success flex items-center"
                >
                  <div className="icon-send mr-2"></div>
                  Enviar Campanha
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('MarketingCampaigns component error:', error);
    return null;
  }
}