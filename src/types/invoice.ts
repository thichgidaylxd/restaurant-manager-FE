export interface Invoice {
    invoiceId: string;
    tableName: string;
    status: "paid" | "unpaid";
    userAccountId: string;
    userAccountName: string;
    invoiceDishResponses?: InvoiceDish[];
    createdAt: string;
}

export interface InvoiceDish {
    dishId: string;
    dishName: string;
    quantity: number;
    price: number;
    unit?: string | null;
    image?: string | null;
}