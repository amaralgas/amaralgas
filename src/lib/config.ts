// Store settings. Phase 2: load these from the admin panel.
export const STORE = {
  name: "Amaral Gás",
  slogan: "Agilidade e confiança",
  tagline: "Pediu, chegou!",
  // Placeholder: replace with the real WhatsApp number (DDI+DDD+número, só dígitos).
  whatsappNumber: "5500000000000",
  deliveryFee: 5,
  deliveryEstimate: "30 a 50 min",
  hours: "Seg a Sáb, 7h às 20h · Dom, 8h às 13h",
};

export const whatsappLink = (text = "Olá, Amaral Gás! Gostaria de fazer um pedido.") =>
  `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
