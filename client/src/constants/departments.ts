export interface Department {
  id: string;
  name: string;
  description: string;
  services: string[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: "cardio",
    name: "Khoa Tim mạch",
    description: "Chẩn đoán và điều trị bệnh mạch vành, tăng huyết áp, suy tim, rối loạn nhịp.",
    services: ["Siêu âm tim 4D", "Can thiệp mạch vành", "Theo dõi Holter 24h"],
  },
  {
    id: "pediatrics",
    name: "Khoa Nhi tổng hợp",
    description: "Chăm sóc sức khỏe trẻ em từ sơ sinh đến 16 tuổi với chương trình tầm soát sớm.",
    services: ["Khám phát triển", "Tiêm chủng mở rộng", "Tư vấn dinh dưỡng"],
  },
  {
    id: "neuro",
    name: "Khoa Thần kinh",
    description: "Điều trị tai biến mạch máu não, động kinh, đau đầu, rối loạn giấc ngủ.",
    services: ["MRI não bộ", "Điện não đồ", "Phục hồi chức năng sau đột quỵ"],
  },
  {
    id: "ortho",
    name: "Khoa Cơ xương khớp",
    description: "Thay khớp, phẫu thuật chấn thương thể thao và phục hồi hậu phẫu.",
    services: ["Thay khớp toàn phần", "Nội soi tái tạo dây chằng", "Vật lý trị liệu"],
  },
  {
    id: "obgyn",
    name: "Sản - Phụ khoa",
    description: "Theo dõi thai kỳ nguy cơ cao, phẫu thuật nội soi và chăm sóc sức khỏe sinh sản.",
    services: ["Sinh không đau", "Sàng lọc trước sinh NIPT", "Nội soi tử cung"],
  },
];
