import type { Product } from "../types/product";

export const mockProducts: Product[] = [
  {
    id: "demo-1",
    title: "Sofá de canto 3 lugares",
    description:
      "Sofá com tecido premium, ótimo para sala moderna e muito conforto diário.",
    price: 1299,
    status: "DISPONIVEL",
    condition: "USADO",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    seller: { id: "seller-1", name: "Lia Fernandes" },
    categories: [{ id: "cat-1", name: "Móveis" }],
  },
  {
    id: "demo-2",
    title: "Notebook Gamer 15.6",
    description:
      "Performance para estudo, trabalho e diversão com boa placa de vídeo e SSD rápido.",
    price: 2899,
    status: "RESERVADO",
    condition: "SEMINOVO",
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    seller: { id: "seller-2", name: "Arthur Silva" },
    categories: [{ id: "cat-2", name: "Eletrônicos" }],
  },
  {
    id: "demo-3",
    title: "Bicicleta urbana feminina",
    description:
      "Modelo leve, confortável e ideal para deslocamentos diários com estilo urbano.",
    price: 899,
    status: "DISPONIVEL",
    condition: "USADO",
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80",
    seller: { id: "seller-3", name: "Beatriz Costa" },
    categories: [{ id: "cat-3", name: "Esporte" }],
  },
];
