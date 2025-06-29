function SeasonalEvents({ userType }) {
  const [events, setEvents] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: '',
    dataEvento: '',
    categoria: '',
    demandaEsperada: '',
    produtosSugeridos: ''
  });

  React.useEffect(() => {
    loadEvents();
    checkUpcomingEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const snapshot = await firebaseDB.getSeasonalEvents();
      const eventsData = snapshot.val() || {};
      const eventsList = Object.keys(eventsData).map(key => ({
        id: key,
        ...eventsData[key]
      }));
      setEvents(eventsList.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento)));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const checkUpcomingEvents = () => {
    const today = new Date();
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.dataEvento);
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    });

    if (upcomingEvents.length > 0) {
      console.log(`${upcomingEvents.length} eventos próximos detectados`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        demandaEsperada: parseInt(formData.demandaEsperada),
        status: 'planejado',
        dataCriacao: new Date().toISOString()
      };

      await firebaseDB.addSeasonalEvent(eventData);
      helpers.showAlert('Sucesso', 'Evento adicionado com sucesso!');
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      helpers.showAlert('Erro', 'Erro ao adicionar evento', 'error');
    }
  };

  const generatePurchasePlan = async (event) => {
    try {
      const planData = {
        eventoId: event.id,
        nomeEvento: event.nome,
        produtos: event.produtosSugeridos.split(',').map(p => p.trim()),
        quantidadeSugerida: event.demandaEsperada,
        dataCompraRecomendada: new Date(new Date(event.dataEvento).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente'
      };

      await firebaseDB.addPurchasePlan(planData);
      helpers.showAlert('Sucesso', 'Plano de compras gerado!');
    } catch (error) {
      console.error('Error generating purchase plan:', error);
    }
  };

  const getEventStatus = (event) => {
    const today = new Date();
    const eventDate = new Date(event.dataEvento);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'passado', color: 'gray' };
    if (diffDays <= 7) return { status: 'próximo', color: 'red' };
    if (diffDays <= 30) return { status: 'em breve', color: 'yellow' };
    return { status: 'futuro', color: 'green' };
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      dataEvento: '',
      categoria: '',
      demandaEsperada: '',
      produtosSugeridos: ''
    });
    setShowAddForm(false);
  };

  try {
    return (
      <div data-name="seasonal-events" data-file="components/SeasonalEvents.js">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Eventos Sazonais</h2>
          {userType === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <div className="icon-plus mr-2"></div>
              Novo Evento
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Evento Sazonal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do evento"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.dataEvento}
                  onChange={(e) => setFormData({...formData, dataEvento: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                >
                  <option value="">Selecionar categoria</option>
                  <option value="feriado">Feriado Nacional</option>
                  <option value="religioso">Evento Religioso</option>
                  <option value="comercial">Data Comercial</option>
                  <option value="local">Evento Local</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="Aumento esperado na demanda (%)"
                value={formData.demandaEsperada}
                onChange={(e) => setFormData({...formData, demandaEsperada: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Produtos sugeridos (separados por vírgula)"
                value={formData.produtosSugeridos}
                onChange={(e) => setFormData({...formData, produtosSugeridos: e.target.value})}
                className="w-full p-3 border rounded-lg h-20"
                required
              />
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">Adicionar Evento</button>
                <button type="button" onClick={resetForm} className="btn-danger">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map(event => {
            const eventStatus = getEventStatus(event);
            return (
              <div key={event.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">{event.nome}</h3>
                  <span className={`px-2 py-1 rounded text-xs bg-${eventStatus.color}-100 text-${eventStatus.color}-800`}>
                    {eventStatus.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Data: {helpers.formatDate(event.dataEvento)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Categoria: {event.categoria}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Demanda esperada: +{event.demandaEsperada}%
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Produtos: {event.produtosSugeridos}
                </p>
                {userType === 'admin' && eventStatus.status !== 'passado' && (
                  <button
                    onClick={() => generatePurchasePlan(event)}
                    className="btn-success flex items-center"
                  >
                    <div className="icon-calendar mr-2"></div>
                    Gerar Plano de Compras
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error('SeasonalEvents component error:', error);
    return null;
  }
}