const PdfDocument = require("pdfkit"),
    PdfTable = require("voilab-pdf-table");

// // Membuat dokumen PDF menggunakan pdfkit
// const doc = new PDFDocument();
// var table = new PdfTable(doc, { bottomMargin: 30 });

// table
//     .addPlugin(
//         new (require("voilab-pdf-table/plugins/fitcolumn"))({
//             column: "description",
//         })
//     )
//     .setColumnsDefaults({ headerBorder: "B", align: "right" })
//     .addColumns([
//         { id: "description", header: "Product", align: "left" },
//         { id: "quantity", header: "Quality", width: 50 },
//         { id: "price", header: "Price", width: 40 },
//     ])
//     .onPageAdded(function (tb) {
//         tb.addHeader();
//     });

// doc.addPage();

// table.addBody([
//     { description: "Product 1", quantity: 1, price: 20.1, total: 20.1 },
//     { description: "Product 2", quantity: 4, price: 4.0, total: 16.0 },
//     { description: "Product 3", quantity: 2, price: 17.85, total: 35.7 },
// ]);

module.exports = {
    create: function () {
        // create a PDF from PDFKit, and a table from PDFTable
        var pdf = new PdfDocument({
            autoFirstPage: false,
        });
        var table = new PdfTable(pdf, {
            bottomMargin: 30,
        });

        table
            // add some plugins (here, a 'fit-to-width' for a column)
            .addPlugin(
                new (require("voilab-pdf-table/plugins/fitcolumn"))({
                    column: "description",
                })
            )
            // set defaults to your columns
            .setColumnsDefaults({
                headerBorder: "B",
                align: "right",
            })
            // add table columns
            .addColumns([
                {
                    id: "description",
                    header: "Product",
                    align: "left",
                },
                {
                    id: "quantity",
                    header: "Quantity",
                    width: 50,
                },
                {
                    id: "price",
                    header: "Price",
                    width: 40,
                },
                {
                    id: "total",
                    header: "Total",
                    width: 70,
                    renderer: function (tb, data) {
                        return "CHF " + data.total;
                    },
                },
            ])
            // add events (here, we draw headers on each new page)
            .onPageAdded(function (tb) {
                tb.addHeader();
            });

        // if no page already exists in your PDF, do not forget to add one
        pdf.addPage();
        pdf.text(
            "Halo, ini adalah contoh dokumen PDF yang dihasilkan menggunakan pdfkit."
        );
        pdf.font("fonts/PalatinoBold.ttf")
            .fontSize(25)
            .text("Some text with an embedded font!", 100, 100);
        pdf.text(
            "Halo, ini adalah contoh dokumen PDF yang dihasilkan menggunakan pdfkit."
        );
        pdf.text(
            "Halo, ini adalah contoh dokumen PDF yang dihasilkan menggunakan pdfkit."
        );

        // draw content, by passing data to the addBody method
        table.addBody([
            { description: "Product 1", quantity: 1, price: 20.1, total: 20.1 },
            { description: "Product 2", quantity: 4, price: 4.0, total: 16.0 },
            {
                description: "Product 3",
                quantity: 2,
                price: 17.85,
                total: 35.7,
            },
        ]);

        return pdf;
    },
};
