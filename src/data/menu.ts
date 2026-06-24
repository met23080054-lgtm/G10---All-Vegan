export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  popular?: boolean;
  new?: boolean;
}

export const categories = [
  { id: "all", label: "Tất cả" },
  { id: "com", label: "Cơm chay" },
  { id: "bun", label: "Bún & Phở" },
  { id: "banh", label: "Bánh & Cuốn" },
  { id: "mon-phu", label: "Món phụ" },
  { id: "nuoc", label: "Đồ uống" },
  { id: "trang-miem", label: "Tráng miệng" },
];
