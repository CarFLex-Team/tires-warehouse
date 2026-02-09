import { Invoice } from "./customers";

// const invoice = {
//   id: "INV12345",
//   created_at: "2026-02-01",
//   transactions: [
//     {
//       category_name: "Software",
//       description: "Software License",
//       amount: 499.99,
//     },
//     {
//       category_name: "Service",
//       description: "Consulting",
//       amount: 299.99,
//     },
//   ],
//   total_amount: 799.98,
// };
export function downloadPdf(invoice: Invoice) {
  console.log("Downloading PDF for invoice:", invoice);
  fetch("https://pdf-service-production-92e8.up.railway.app/invoice", {
    method: "POST",
    headers: {
      Authorization: `Bearer 7aa87bab58486383675737f82e3a2f301864c8ad20c20e8ffb7fc47355f868fe`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoice),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${invoice.id}.pdf`;
      link.click();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
