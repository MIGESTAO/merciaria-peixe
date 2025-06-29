function NotificationSystem() {
  React.useEffect(() => {
    // Verificar se emailjs está disponível antes de inicializar
    if (typeof emailjs !== 'undefined') {
      emailjs.init("your_emailjs_user_id");
    }
    checkLowStockAndExpiry();
  }, []);

  const checkLowStockAndExpiry = async () => {
    try {
      const snapshot = await firebaseDB.getProducts();
      const products = snapshot.val() || {};
      const productsList = Object.values(products);
      
      const lowStockProducts = productsList.filter(p => p.quantidade < 10);
      const expiringProducts = productsList.filter(p => {
        const expiryDate = new Date(p.dataValidade);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
      });

      if (lowStockProducts.length > 0) {
        sendLowStockNotification(lowStockProducts);
      }
      
      if (expiringProducts.length > 0) {
        sendExpiryNotification(expiringProducts);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const sendLowStockNotification = (products) => {
    // Verificar se emailjs está disponível
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS não disponível - simulando envio de notificação de estoque baixo');
      return;
    }

    const productList = products.map(p => `${p.nome}: ${p.quantidade} unidades`).join('\n');
    
    const templateParams = {
      to_email: 'admin@mercearamicten.co.mz',
      subject: 'Alerta: Produtos com Estoque Baixo',
      message: `Os seguintes produtos estão com estoque baixo:\n\n${productList}`,
      from_name: 'Sistema Mercearia Micten'
    };

    emailjs.send('your_service_id', 'your_template_id', templateParams)
      .then(() => console.log('Email de estoque baixo enviado'))
      .catch((error) => console.error('Erro ao enviar email:', error));
  };

  const sendExpiryNotification = (products) => {
    // Verificar se emailjs está disponível
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS não disponível - simulando envio de notificação de vencimento');
      return;
    }

    const productList = products.map(p => `${p.nome}: vence em ${helpers.formatDate(p.dataValidade)}`).join('\n');
    
    const templateParams = {
      to_email: 'admin@mercearamicten.co.mz',
      subject: 'Alerta: Produtos Próximos do Vencimento',
      message: `Os seguintes produtos estão próximos do vencimento:\n\n${productList}`,
      from_name: 'Sistema Mercearia Micten'
    };

    emailjs.send('your_service_id', 'your_template_id', templateParams)
      .then(() => console.log('Email de vencimento enviado'))
      .catch((error) => console.error('Erro ao enviar email:', error));
  };

  try {
    return null;
  } catch (error) {
    console.error('NotificationSystem component error:', error);
    return null;
  }
}
