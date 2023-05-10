// console.log(POSDataBuilder);
let { remote } = require("electron");
// console.log(process.versions.electron);

const { PosPrinter } = remote.require("electron-pos-printer");
// const {PosPrinter} = require("electron-pos-printer"); //dont work in production (??)

const path = require("path");

const { order, store } = require("./dataSource.js");

const { POSDataBuilder } = require("./dataBuilder.js");

const { URL } = require("url");
const moment = require("moment/moment.js");

let webContents = remote.getCurrentWebContents();
let printers = webContents.getPrinters(); //list the printers
console.log(printers);

// write in the screen the printers for choose
printers.map((item, index) => {
  document.getElementById("list_printers").innerHTML +=
    ' <input type="radio" id="printer_' +
    index +
    '" name="printer" value="' +
    item.name +
    '"><label for="printer_' +
    index +
    '">' +
    item.name +
    "</label><br>";
});

function populateDataObject() {
  // this function creates a data object compatible with the format of the printer module

  // store related info fields
  const store_name = store.business_name ? store.business_name : store.name;
  const store_street = store.street ? store.street + ", " + store.street2 : "";
  const store_city = store.city
    ? store.city + ", " + store.state + " - " + store.pincode
    : "";
  const store_phone = store.phone ? "Phone : " + store.phone : "";
  const store_email = store.email ? "<br>Email : " + store.email : "";
  const store_pan = store.pan ? "<br>pan : " + store.pan : "";
  const store_gstin = store.gstin ? "<br>GSTIN : " + store.gstin : "";
  const store_fssai = store.fssai ? "<br>FSSAI licence No: " + store.fssai : "";

  // customer related fields
  const order_address = order.order_address;
  const customer_mobile = order.org_customer_mobile
    ? [
        { type: "text", value: "Mobile", style: { "text-align": "left" } },
        {
          type: "text",
          value: order.org_customer_mobile,
          style: { "text-align": "right" },
        },
      ]
    : [];

  const customer_street =
    order_address.street1 +
    (order_address.street2 ? ", " + order_address.street2 : "");

  const customer_state = order_address.state
    ? order_address.state + " - " + order_address.pincode
    : order_address.pincode
    ? " - " + order_address.pincode
    : "";

  const customer_address = order_address.street1
    ? [
        { type: "text", value: "Address", style: { "text-align": "left" } },
        {
          type: "text",
          value: customer_street + ", " + customer_state,
          style: { "text-align": "right" },
        },
      ]
    : [];

  // amount related fields
  const tax_amount = order.tax_amount
    ? [
        {
          type: "text",
          value: "Tax",
          style: { "text-align": "right", width: "60%" },
        },
        {
          type: "text",
          value: "₹" + order.tax_amount.toFixed(2),
          style: { "text-align": "right", "font-weight": "bold", width: "40%" },
        },
      ]
    : [];
  const sub_total = [
    order.tax_amount
      ? {
          type: "text",
          value: "Taxable Amount",
          style: { "text-align": "right", width: "60%" },
        }
      : {
          type: "text",
          value: "Sub Total",
          style: { "text-align": "right", width: "60%" },
        },
    {
      type: "text",
      value: "₹" + order.sub_total.toFixed(2),
      style: { "text-align": "right", "font-weight": "bold", width: "40%" },
    },
  ];
  const packaging_amount = order.packaging_amount
    ? [
        {
          type: "text",
          value: "Packaging",
          style: { "text-align": "right", width: "60%" },
        },
        {
          type: "text",
          value: "₹" + order.packaging_amount.toFixed(2),
          style: { "text-align": "right", "font-weight": "bold", width: "40%" },
        },
      ]
    : [];
  const shipping_amount = order.shipping_amount
    ? [
        {
          type: "text",
          value: "Delivery",
          style: { "text-align": "right", width: "60%" },
        },
        {
          type: "text",
          value: "₹" + order.shipping_amount.toFixed(2),
          style: { "text-align": "right", "font-weight": "bold", width: "40%" },
        },
      ]
    : [];
  const discount_amount = order.discount_amount
    ? [
        {
          type: "text",
          value: "Discount",
          style: { "text-align": "right", width: "60%" },
        },
        {
          type: "text",
          value: "₹" + order.discount_amount.toFixed(2),
          style: { "text-align": "right", "font-weight": "bold", width: "40%" },
        },
      ]
    : [];
  const round_value = order.round_value
    ? [
        {
          type: "text",
          value: "Round Off",
          style: { "text-align": "right", width: "60%" },
        },
        {
          type: "text",
          value: "₹" + order.round_value.toFixed(2),
          style: { "text-align": "right", "font-weight": "bold", width: "40%" },
        },
      ]
    : [];
  const total_payable = [
    {
      type: "text",
      value: "Total Payable",
      style: { "text-align": "right", width: "60%" },
    },
    {
      type: "text",
      value: "₹" + order.amount.toFixed(2),
      style: { "text-align": "right", width: "40%" },
    },
  ];
  const received = [
    {
      type: "text",
      value: "Received",
      style: { "text-align": "right", width: "60%" },
    },
    {
      type: "text",
      value: "₹" + (order.amount - order.due_amount).toFixed(2),
      style: { "text-align": "right", width: "40%" },
    },
  ];
  const balance = [
    {
      type: "text",
      value: "Balance",
      style: { "text-align": "right", width: "60%" },
    },
    {
      type: "text",
      value: "₹" + order.due_amount.toFixed(2),
      style: { "text-align": "right", width: "40%", "font-weight": "bold" },
    },
  ];

  // wallet points
  const earned_wallet_points = order.earn_points
    ? [
        {
          type: "text",
          value: "Earned Wallet Points",
          style: { "text-align": "left" },
        },
        {
          type: "text",
          value: order.earn_points,
          style: { "text-align": "right", "font-weight": "bold" },
        },
      ]
    : [];
  const used_wallet_points = [
    {
      type: "text",
      value: "Used Wallet Points",
      style: { "text-align": "left" },
    },
    {
      type: "text",
      value: order.redeem_points,
      style: { "text-align": "right", "font-weight": "bold" },
    },
  ];
  const wallet_points = order.redeem_points
    ? [used_wallet_points, earned_wallet_points]
    : earned_wallet_points;

  // other info
  const savings = order.savings
    ? "You have saved <br>" + "₹" + order.savings + " in this visit"
    : "";

  const notes = order.notes ? "Notes : " + order.notes : "";

  const qr_link =
    order.due_amount > 0 && store.upi_address ? QR_link(order, store) : "";
  // console.log(qr_link);

  const signature = store.signature_url ? store.signature_url : "";
  const bill_notes = order.bill_notes ? order.bill_notes : "";
  const disputes = store.city
    ? "<br> All Disputes will be settled in " + store.city
    : "<br> All Disputes will be handled locally";
  const tos = order.tos ? order.tos : "Bill inclusive of tax" + disputes;

  // invoice Id, order Id and customer details
  const invoice_details = [
    [
      { type: "text", value: "Invoice #", style: { "text-align": "left" } },
      {
        type: "text",
        value: order.invoice_id,
        style: { "text-align": "right" },
      },
    ],
    [
      {
        type: "text",
        value: "Order #",
        style: { "text-align": "left", border: "none" },
      },
      {
        type: "text",
        value: order.display_id,
        style: { "text-align": "right", border: "none" },
      },
    ],
    [
      { type: "text", value: "Date", style: { "text-align": "left" } },
      {
        type: "text",
        value: moment(order.invoice_date).format("DD/MM/YYYY"),
        style: { "text-align": "right" },
      },
    ],
    [
      { type: "text", value: "Customer", style: { "text-align": "left" } },
      {
        type: "text",
        value: order.org_customer_name,
        style: { "text-align": "right" },
      },
    ],
    customer_mobile,
    customer_address,
  ];

  const invoice_items_header = [
    { type: "text", value: "#" },
    {
      type: "text",
      value: "Product",
      style: { "text-align": "left" },
    },
    { type: "text", value: "Qty", style: { "text-align": "center" } },
    { type: "text", value: "Mrp", style: { "text-align": "center" } },
    { type: "text", value: "Price", style: { "text-align": "center" } },
    { type: "text", value: "Amt", style: { "text-align": "center" } },
  ];

  const invoice_items = order.order_items.map((item, index) => {
    const table_item = [
      { type: "text", value: ++index },
      {
        type: "text",
        value: item.display_name,
        style: { "text-align": "left", "max-width": "75px" },
      },
      {
        type: "text",
        value: item.qty.toFixed(1),
        style: { "text-align": "center" },
      },
      {
        type: "text",
        value: item.mrp.toFixed(1),
        style: { "text-align": "center" },
      },
      {
        type: "text",
        value: item.sale_price.toFixed(1),
        style: { "text-align": "center" },
      },
      {
        type: "text",
        value: (item.sale_price * item.qty).toFixed(1),
        style: { "text-align": "center" },
      },
    ];
    return table_item;
  });

  const data = POSDataBuilder.textLine(store_name, "14px", "center", "bold")
    .textLine(store_street + store_city)
    .textLine(store_phone + store_email + store_pan + store_gstin + store_fssai)
    .textLine("SALE INVOICE", "18px", "center", "bold")
    .table([], invoice_details)
    .table(invoice_items_header, invoice_items)
    .table(
      [],
      [
        sub_total,
        tax_amount,
        packaging_amount,
        shipping_amount,
        discount_amount,
        round_value,
        total_payable,
        received,
        balance,
      ]
    )
    .table([], wallet_points)
    .text(savings, {
      "text-align": "center",
      "font-weight": "bold",
      "border-top": "1px dashed black",
      "border-bottom": "1px dashed black",
      "padding-top": "2px",
      "padding-bottom": "2px",
    })
    // .QR(qr_link, 55, 55, {
    //   margin: "10 20px 20 20px",
    // })
    .image(signature, "right", "100px", "55px")
    .textLine("For " + store.name + "<br> (Signatory)", "12px", "center")
    .text(bill_notes, { margin: "4px", "text-align": "center" })
    .textLine("Terms and Conditions", "12px", "center", "bold")
    .textLine(tos, "12px", "center")
    .build();
  console.log(data);

  return data;
}

//(order.due_amount>0 && store.upi_address)
function QR_link(order, store) {
  params = new URLSearchParams({
    pa: store.upi_address,
    pn: store.name,
    tn:
      "Against invoice " +
      order.invoice_id +
      ", on " +
      moment(order.created_at).format("DD/MM/YYYY HH:mm"),
    tr: order.invoice_id,
    am: order.due_amount,
    cu: "INR",
    purpose:
      "Against purchase on " +
      moment(order.created_at).format("DD/MM/YYYY HH:mm"),
  });
  const query = params.toString();
  const url = `upi://pay/?${query}`;
  return url;
}

function print() {
  let printerName;
  let widthPage;

  var p = document.getElementsByName("printer");
  var w = document.getElementsByName("width");

  for (var i = 0, length = p.length; i < length; i++) {
    if (p[i].checked) {
      printerName = p[i].value;
      break;
    }
  }

  for (var i = 0, length = w.length; i < length; i++) {
    if (w[i].checked) {
      widthPage = w[i].value;
      break;
    }
  }

  console.log(printerName, widthPage);

  const options = {
    preview: false, // Preview in window or print
    width: widthPage, //  width of content body
    margin: "0 0 0 0", // margin of content body
    copies: 1, // Number of copies to print
    printerName: printerName, // printerName: string, check it at webContent.getPrinters()
    timeOutPerLine: 400,
    silent: true,
  };

  const data = populateDataObject();

  if (printerName && widthPage) {
    PosPrinter.print(data, options)
      .then(() => {})
      .catch(function (error) {
        console.error(error);
      });
  } else {
    alert("Select the printer and the width");
  }
}
