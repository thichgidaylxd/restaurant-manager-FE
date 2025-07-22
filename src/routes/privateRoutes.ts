// Private routes that require authentication
export const privateRoutes = [
  {
    path: "/",
    name: "Home",
  },
  {
    path: "/table",
    name: "Tables",
  },
  {
    path: "/table/:id",
    name: "Table Detail",
  },
  {
    path: "/hoadon",
    name: "Invoices",
  },
  {
    path: "/thucdon",
    name: "Menu",
  },
  {
    path: "/doanhthu",
    name: "Revenue",
  },
  {
    path: "/nhanvien",
    name: "Staff",
  },
  {
    path: "/taikhoan",
    name: "Account",
  },
];
