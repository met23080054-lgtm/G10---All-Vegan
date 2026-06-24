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
  { id: "buffet", label: "Buffet" },
  { id: "khai-vi", label: "Khai vị" },
  { id: "met-cuon", label: "Mẹt cuốn" },
  { id: "lau", label: "Lẩu" },
  { id: "chinh", label: "Món chính" },
  { id: "best-seller", label: "Best seller" },
  { id: "pizza", label: "Pizza" },
  { id: "an-choi", label: "Ăn chơi" },
  { id: "xanh", label: "Rau xanh" },
  { id: "nuoc-troi", label: "Món nước" },
  { id: "canh", label: "Canh" },
  { id: "no-ne", label: "No nê" },
];
