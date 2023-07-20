import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = mongoose.Schema({
    "title": {
        type: String,
        required:true
    },
    "description": {
        type: String,
        required:true
    },
    "code": {
        type: String,
        required:true,
        unique: true
    },
    "price": {
        type: Number,
        required:true
    },
    "status": {
        type: Boolean,
        required:true
    },
    "stock": {
        type: Number,
        required:true
    },
    "category": {
        type: String,
        required:true
    },
    "thumbnail": String
})

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model("products", productSchema);
