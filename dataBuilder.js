const POSDataBuilder = {
    data : [],
    
    text: function(value,style){ // adds a new text row to the data object
        let new_text = {
            type: 'text',
            value: value,
            style: style,
        }
        this.data.push(new_text);
        return this;
    },

    textLine: function(value, size = '12px', align = 'center', weight = 'normal') {
       return this.text(value, { 'font-size' : size, 'text-align' : align, 'font-weight' : weight });
    },

    image: function(path, position, width , height) {

        let new_image = {
            type: "image",
            url: path, // file path
            position: position, // position of image: 'left' | 'center' | 'right'
            width: width, // width of image in px; default: auto
            height: height, // width of image in px; default: 50 or '50px'
        }
        this.data.push(new_image);
        return this;
    },

    table: function(header=[],body,footer=[],table_style={},header_style={},body_style={},footer_style={}){
        let new_table = {
            type: 'table',
            style: table_style,  // style the table
            tableHeader: header, // list of the columns to be rendered in the table header
            tableBody: body,  // multi-dimensional array depicting the rows and columns of the table body
            tableFooter: footer,  // list of columns to be rendered in the table footer
            tableHeaderStyle: header_style, // custom style for the table header
            tableBodyStyle: body_style, // custom style for the table body
            tableFooterStyle: footer_style, // custom style for the table footer
        }
        this.data.push(new_table);
        return this;
    },

    QR: function(url,height,width,style){
        let qr = {
            type: 'qrCode',
            value: url,
            height: height,
            width: width,
            style: style
        }
        this.data.push(qr);
        return this;
    },


    build: function(){
        return this.data
    }

}
module.exports = {POSDataBuilder};

