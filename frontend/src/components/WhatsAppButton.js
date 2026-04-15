export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/553134225293"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 z-40 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      data-testid="whatsapp-btn"
      aria-label="Contato via WhatsApp"
    >
      <img src="/images/assets/whatsapp-logo.png" alt="WhatsApp" className="w-10 h-10 object-contain" />
    </a>
  );
}
