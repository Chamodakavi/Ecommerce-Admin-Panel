interface InvoiceItem {
  product_id?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Product {
  id: string;
  name: string;
  cost_price: number | null;
}

function calculateMonthProfit(invoices: any[], products: Product[]) {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalProfit = 0;

  invoices.forEach((inv) => {
    const items = inv.items || [];
    items.forEach((item: InvoiceItem) => {
      if (item.product_id) {
        const product = productMap.get(item.product_id);
        if (product && product.cost_price !== null) {
          totalProfit += (item.unitPrice - product.cost_price) * item.quantity;
        }
      }
    });
  });
  return totalProfit;
}

describe("Profit Calculation", () => {
  test("calculates profit correctly excluding services", () => {
    const products = [{ id: "p1", name: "Laptop", cost_price: 500 }];
    const invoices = [
      {
        items: [
          { product_id: "p1", name: "Laptop", quantity: 1, unitPrice: 800 },
          { product_id: null, name: "Service Fee", quantity: 1, unitPrice: 50 },
        ],
      },
    ];
    // Profit = (800 - 500) * 1 = 300. Service fee ignored.
    expect(calculateMonthProfit(invoices, products)).toBe(300);
  });
});
