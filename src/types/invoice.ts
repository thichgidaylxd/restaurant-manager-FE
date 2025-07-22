export interface Invoice {
    invoiceId: string;
    tableName: string;
    status: "paid" | "unpaid";
    payMethod: string;
    userAccountId: string;
    userAccountName: string;
    invoiceDishResponses?: InvoiceDish[];
    createdAt: string;
    sum: number;
}

export interface InvoiceDish {
    dishId: string;
    dishName: string;
    quantity: number;
    price: number;
    unit?: string | null;
    image?: string | null;
}