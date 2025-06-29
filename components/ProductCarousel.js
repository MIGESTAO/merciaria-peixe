function ProductCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  const productImages = [
    {
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
      title: 'Produtos Frescos',
      description: 'Frutas e vegetais da mais alta qualidade'
    },
    {
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop',
      title: 'Mercearia Completa',
      description: 'Tudo que você precisa em um só lugar'
    },
    {
      url: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800&h=400&fit=crop',
      title: 'Produtos de Qualidade',
      description: 'Marcas confiáveis e preços justos'
    },
    {
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop',
      title: 'Atendimento Especial',
      description: 'Sua satisfação é nossa prioridade'
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % productImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  try {
    return (
      <div 
        className="carousel-container h-64 mb-8" 
        data-name="product-carousel" 
        data-file="components/ProductCarousel.js"
        data-aos="fade-up"
      >
        {productImages.map((image, index) => (
          <div
            key={index}
            className={`carousel-slide ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="flex items-center justify-center h-full text-white text-center p-8">
              <div className="glass-effect rounded-2xl p-6 max-w-md">
                <h3 className="text-2xl font-bold mb-2 text-white">{image.title}</h3>
                <p className="text-gray-100">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {productImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProductCarousel component error:', error);
    return null;
  }
}