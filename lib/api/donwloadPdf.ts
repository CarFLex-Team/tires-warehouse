import { Invoice } from "./customers";

export function downloadPdf(
  invoice: { title: string } & Invoice,
  setIsDownloading: (downloading: boolean) => void,
) {
  setIsDownloading(true);

  const TIMEOUT = 5000; // 5 seconds timeout for opening new tab
  let timeoutId: NodeJS.Timeout;

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
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl); // Try to open PDF in a new tab

      const fallbackDownload = () => {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${invoice.title || "invoice"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // If the tab opened, try to print after loading
      if (newWindow) {
        timeoutId = setTimeout(() => {
          console.warn("PDF tab taking too long, fallback to download.");
          newWindow.close();
          fallbackDownload();
        }, TIMEOUT);

        newWindow.onload = () => {
          clearTimeout(timeoutId);
          newWindow.focus();
          newWindow.print();
        };
      } else {
        alert("Pop-ups are blocked. Downloading PDF instead.");
        fallbackDownload();
      }
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    })
    .finally(() => {
      setIsDownloading(false);
    });
}
