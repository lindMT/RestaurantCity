const Discarded         = require("../model/discardedSchema.js");
const DishCategory      = require("../model/dishCategorySchema.js");
const DishRecipe        = require("../model/dishRecipeSchema.js");
const Dish              = require("../model/dishSchema.js");
const FixedConversion   = require("../model/fixedConversionSchema.js");
const IngreConversion   = require("../model/ingreConversionSchema.js");
const Ingredient        = require("../model/ingredientsSchema.js");
const IngreVariation    = require("../model/ingreVariationsSchema.js");
const Mismatch          = require("../model/mismatchSchema.js");
const OrderItem         = require("../model/orderItemSchema.js");
const Order             = require("../model/orderSchema.js");
const Purchased         = require("../model/purchasedSchema.js");
const User              = require("../model/usersSchema.js");
const Unit              = require("../model/unitsSchema.js");

const bcrypt            = require('bcrypt');

const addSamples = async(req, res)=>{
    // Delete all local collections first
    await Discarded.deleteMany({});      
    await DishCategory.deleteMany({});     
    await DishRecipe.deleteMany({});       
    await Dish.deleteMany({});             
    await FixedConversion.deleteMany({});  
    await IngreConversion.deleteMany({});  
    await Ingredient.deleteMany({});       
    await IngreVariation.deleteMany({});   
    await Mismatch.deleteMany({});         
    await OrderItem.deleteMany({});        
    await Order.deleteMany({});            
    await Purchased.deleteMany({});        
    await User.deleteMany({});              
    await Unit.deleteMany({});  

    // For password hash
    var salt = bcrypt.genSaltSync(10)

    await User.insertMany([
        // Admin
        {
            _id: "64a3fc38e916ed6021b6a5f6",
            firstName: "Alain",
            lastName: "Encarnacion",
            userName: "alain",
            password:  bcrypt.hashSync("123", salt),
            position: "admin",
            status: "active"
        },

         // Stock Controller
         {
            _id: "64c53d9401ae199e43fb8b1d",
            firstName: "Juan",
            lastName: "Dela Cruz",
            userName: "juan",
            password:  bcrypt.hashSync("123", salt),
            position: "stockController",
            status: "active"
        },

        // Chef
        {
            _id: "64c53da201ae199e43fb8b1e",
            firstName: "Maria",
            lastName: "Clara",
            userName: "maria",
            password:  bcrypt.hashSync("123", salt),
            position: "chef",
            status: "active"
        },

        // Cashier
        {
            _id: "64c53dbe01ae199e43fb8b1f",
            firstName: "Jose",
            lastName: "Rizal",
            userName: "jose",
            password:  bcrypt.hashSync("123", salt),
            position: "cashier",
            status: "active"
        }
    ]);

    await Unit.insertMany([
        {
            "_id": "64a5804ea792248175d204e7",
            "unitName": "Gram",
            "unitSymbol": "g",
            "category": "Dry"
        },
        {
            "_id": "64a5804ea792248175d204e8",
            "unitName": "Kilogram",
            "unitSymbol": "kg",
            "category": "Dry"
        },
        {
            "_id": "64a5804ea792248175d204ea",
            "unitName": "Liter",
            "unitSymbol": "l",
            "category": "Wet"
        },
        {
            "_id": "64a451bb9a494ecb0fd7216b",
            "unitName": "Cup",
            "unitSymbol": "cup",
            "category": "Both"
        },
        {
            "_id": "64a4520d9a494ecb0fd7216c",
            "unitName": "Tablespoon",
            "unitSymbol": "tbsp",
            "category": "Both"
        },
        {
            "_id": "64a4526d9a494ecb0fd7216d",
            "unitName": "Teaspoon",
            "unitSymbol": "tsp",
            "category": "Both"
        },
        {
            "_id": "64a5804ea792248175d204eb",
            "unitName": "Ounce",
            "unitSymbol": "oz",
            "category": "Dry"
        },
        {
            "_id": "64a5804ea792248175d204ec",
            "unitName": "Pound",
            "unitSymbol": "lb",
            "category": "Dry"
        },
        {
            "_id": "64a5804ea792248175d204ed",
            "unitName": "Fluid Ounce",
            "unitSymbol": "fl oz",
            "category": "Wet"
        }
    ]);
 
    await FixedConversion.insertMany([
        {
            "_id": "64b6a2ed99f3be091ae21012",
            "initialUnitId": "64a5804ea792248175d204eb",
            "convertedUnitId": "64a5804ea792248175d204e7",
            "conversionFactor": 28.3495
        },
        {
            "_id": "64b6a2ed99f3be091ae21013",
            "initialUnitId": "64a5804ea792248175d204e7",
            "convertedUnitId": "64a5804ea792248175d204eb",
            "conversionFactor": 0.035
        },
        {
            "_id": "64b6a2ed99f3be091ae21014",
            "initialUnitId": "64a5804ea792248175d204e9",
            "convertedUnitId":"64a4520d9a494ecb0fd7216c",
            "conversionFactor": 0.067628
        },
        {
            "_id": "64b6a2ed99f3be091ae21015",
            "initialUnitId": "64a4520d9a494ecb0fd7216c",
            "convertedUnitId": "64a5804ea792248175d204e9",
            "conversionFactor": 14.7868
        },
        {
            "_id": "64b6a2ed99f3be091ae21016",
            "initialUnitId": "64a5804ea792248175d204e9",
            "convertedUnitId": "64a4526d9a494ecb0fd7216d",
            "conversionFactor": 0.202884
        },
        {
            "_id": "64b6a2ed99f3be091ae21017",
            "initialUnitId": "64a4526d9a494ecb0fd7216d",
            "convertedUnitId": "64a5804ea792248175d204e9",
            "conversionFactor": 4.9289
        },
        {
            "_id":"64b6a2ed99f3be091ae21018",
            "initialUnitId": "64a5804ea792248175d204ec",
            "convertedUnitId": "64a5804ea792248175d204eb",
            "conversionFactor": 16
        },
        {
            "_id": "64b6a2ed99f3be091ae21019",
            "initialUnitId": "64a5804ea792248175d204eb",
            "convertedUnitId": "64a5804ea792248175d204ec",
            "conversionFactor": 0.0625
        },
        {
            "_id": "64b6a2ed99f3be091ae2101a",
            "initialUnitId": "64a5804ea792248175d204ec",
            "convertedUnitId": "64a5804ea792248175d204e7",
            "conversionFactor": 453.592
        },
        {
            "_id": "64b6a2ed99f3be091ae2101b",
            "initialUnitId": "64a5804ea792248175d204e7",
            "convertedUnitId": "64a5804ea792248175d204ec",
            "conversionFactor": 0.0022
        },
        {
            "_id": "64b6a2ed99f3be091ae2101c",
            "initialUnitId": "64a5804ea792248175d204ea",
            "convertedUnitId": "64a4520d9a494ecb0fd7216c",
            "conversionFactor": 67.628
        },
        {
            "_id": "64b6a2ed99f3be091ae2101d",
            "initialUnitId": "64a4520d9a494ecb0fd7216c",
            "convertedUnitId": "64a5804ea792248175d204ea",
            "conversionFactor": 0.014786
        },
        {
            "_id": "64b6a2ed99f3be091ae2101e",
            "initialUnitId": "64a5804ea792248175d204ea",
            "convertedUnitId": "64a4526d9a494ecb0fd7216d",
            "conversionFactor": 202.884
        },
        {
            "_id": "64b6a2ed99f3be091ae2101f",
            "initialUnitId": "64a4526d9a494ecb0fd7216d",
            "convertedUnitId": "64a5804ea792248175d204ea",
            "conversionFactor": 0.0049289
        },
        {
            "_id": "64b6a2ed99f3be091ae21020",
            "initialUnitId": "64a5804ea792248175d204e8",
            "convertedUnitId": "64a5804ea792248175d204eb",
            "conversionFactor": 35.274
        },
        {
            "_id": "64b6a2ed99f3be091ae21021",
            "initialUnitId": "64a5804ea792248175d204eb",
            "convertedUnitId":"64a5804ea792248175d204e8",
            "conversionFactor": 0.0283495
        },
        {
            "_id": "64b6a2ed99f3be091ae21022",
            "initialUnitId": "64a5804ea792248175d204e8",
            "convertedUnitId": "64a5804ea792248175d204ec",
            "conversionFactor": 2.20462
        },
        {
            "_id":"64b6a2ed99f3be091ae21023",
            "initialUnitId": "64a5804ea792248175d204ec",
            "convertedUnitId": "64a5804ea792248175d204e8",
            "conversionFactor": 0.453592
        },
        {
            "_id": "64b6a2ed99f3be091ae21024",
            "initialUnitId": "64a5804ea792248175d204e7",
            "convertedUnitId": "64a5804ea792248175d204e8",
            "conversionFactor": 0.001
        },
        {
            "_id":"64b6a2ed99f3be091ae21025",
            "initialUnitId": "64a5804ea792248175d204e8",
            "convertedUnitId": "64a5804ea792248175d204e7",
            "conversionFactor": 1000
        }
    ]);

    await IngreConversion.insertMany([
        {
            "_id": "64c140ce85ed9a2c45c4d0dc",
            "ingredientId": "64c140ce85ed9a2c45c4d0d9",
            "initialUnitId": "64a5804ea792248175d204ea",
            "subUnit": [
              {
                "convertedUnitId": "64a4520d9a494ecb0fd7216c",
                "conversionFactor": 67.628,
                "_id": "64c140ce85ed9a2c45c4d0dd"
              },
              {
                "convertedUnitId": "64a4526d9a494ecb0fd7216d",
                "conversionFactor": 202.884,
                "_id": "64c140ce85ed9a2c45c4d0de"
              },
              {
                "convertedUnitId": "64a451bb9a494ecb0fd7216b",
                "conversionFactor": 4.22675,
                "_id": "64c140ce85ed9a2c45c4d0df"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204e9",
                "conversionFactor": 1000,
                "_id": "64c140ce85ed9a2c45c4d0e0"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204ed",
                "conversionFactor": 33.814,
                "_id": "64c140ce85ed9a2c45c4d0e1"
              }
            ],
            "__v": 0
        },
        {
            "_id": "64c140dd85ed9a2c45c4d0e8",
            "ingredientId": "64c140dd85ed9a2c45c4d0e5",
            "initialUnitId": "64a5804ea792248175d204e8",
            "subUnit": [
              {
                "convertedUnitId": "64a5804ea792248175d204eb",
                "conversionFactor": 35.274,
                "_id": "64c140dd85ed9a2c45c4d0e9"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204ec",
                "conversionFactor": 2.20462,
                "_id": "64c140dd85ed9a2c45c4d0ea"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204e7",
                "conversionFactor": 1000,
                "_id": "64c140dd85ed9a2c45c4d0eb"
              }
            ],
            "__v": 0
        },
        {
            "_id":"64c147d485ed9a2c45c4d1cc",
            "ingredientId": "64c147d485ed9a2c45c4d1c9",
            "initialUnitId": "64a5804ea792248175d204e7",
            "subUnit": [
              {
                "convertedUnitId": "64a5804ea792248175d204eb",
                "conversionFactor": 0.035,
                "_id": "64c147d485ed9a2c45c4d1cd"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204ec",
                "conversionFactor": 0.0022,
                "_id": "64c147d485ed9a2c45c4d1ce"
              },
              {
                "convertedUnitId": "64a5804ea792248175d204e8",
                "conversionFactor": 0.001,
                "_id": "64c147d485ed9a2c45c4d1cf"
              },
              {
                "convertedUnitId": "64c1488e85ed9a2c45c4d200",
                "conversionFactor": 0.3,
                "_id": "64c1488e85ed9a2c45c4d208"
              }
            ],
            "__v": 1
        }
    ]);

    await Ingredient.insertMany([
        {
            "_id": "64c140ce85ed9a2c45c4d0d9",
            "name": "Milk",
            "unitID": "64a5804ea792248175d204ea",
            "totalNetWeight": {
              "$numberDecimal": "4.25"
            },
            "reorderPoint": 0,
            "hasVariant": true,
            "__v": 0
        },
        {
            "_id": "64c140dd85ed9a2c45c4d0e5",
            "name": "Beef",
            "unitID": "64a5804ea792248175d204e8",
            "totalNetWeight": {
              "$numberDecimal": "1.2"
            },
            "reorderPoint": 0,
            "hasVariant": false,
            "__v": 0
        },
        {
            "_id": "64c147d485ed9a2c45c4d1c9",
            "name": "Salt",
            "unitID": "64a5804ea792248175d204e7",
            "totalNetWeight": {
              "$numberDecimal": "933.3333333333334"
            },
            "reorderPoint": 0,
            "hasVariant": true,
            "__v": 0
        },

    ]);

    await IngreVariation.insertMany([
        {
            "_id": "64c144a485ed9a2c45c4d0f4",
            "name": "Tetra Pack",
            "ingreID": "64c140ce85ed9a2c45c4d0d9",
            "unitID": "64a5804ea792248175d204ea",
            "netWeight": {
              "$numberDecimal": "1"
            },
            "__v": 0
        },
        {
            "_id": "64c145b985ed9a2c45c4d109",
            "name": "Half Liter",
            "ingreID": "64c140ce85ed9a2c45c4d0d9",
            "unitID": "64a5804ea792248175d204e9",
            "netWeight": {
              "$numberDecimal": "500"
            },
            "__v": 0
        },
        {
            "_id": "64c147e485ed9a2c45c4d1d9",
            "name": "1 kg",
            "ingreID": "64c147d485ed9a2c45c4d1c9",
            "unitID": "64a5804ea792248175d204e8",
            "netWeight": {
              "$numberDecimal": "1"
            },
            "__v": 0
        }
    ]);

    await Purchased.insertMany([
        {
            "_id": "64c144a485ed9a2c45c4d0f7",
            "ingreID": "64c140ce85ed9a2c45c4d0d9",
            "date": "Thu Jul 27 2023 00:07:00 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "varID": "64c144a485ed9a2c45c4d0f4",
            "qty": 4,
            "__v": 0
        },
        {
            "_id": "64c145b985ed9a2c45c4d10c",
            "ingreID": "64c140ce85ed9a2c45c4d0d9",
            "date": "Thu Jul 27 2023 00:11:37 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "varID": "64c145b985ed9a2c45c4d109",
            "qty": 1,
            "__v": 0
        },
        {
            "_id": "64c1460085ed9a2c45c4d118",
            "ingreID": "64c140dd85ed9a2c45c4d0e5",
            "date": "Thu Jul 27 2023 00:12:48 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "netWeight": {
              "$numberDecimal": "1"
            },
            "unitID": "64a5804ea792248175d204e8",
            "__v": 0
        },
        {
            "_id": "64c1466585ed9a2c45c4d124",
            "ingreID": "64c140dd85ed9a2c45c4d0e5",
            "date": "Thu Jul 27 2023 00:14:29 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "netWeight": {
              "$numberDecimal": "500"
            },
            "unitID": "64a5804ea792248175d204e7",
            "__v": 0
        },
        {
            "_id":"64c147e485ed9a2c45c4d1dc",
            "ingreID":"64c147d485ed9a2c45c4d1c9",
            "date": "Thu Jul 27 2023 00:20:52 GMT+0800 (Philippine Standard Time)",
            "doneBy":"64a3fc38e916ed6021b6a5f6",
            "varID": "64c147e485ed9a2c45c4d1d9",
            "qty": 1,
            "__v": 0
        }
    ]);
 
    await Dish.insertMany([
        {
            "_id": "64c1470685ed9a2c45c4d16e",
            "name": "Shawarma",
            "price": {
              "$numberDecimal": "100"
            },
            "categoryID": "64a825e585ad11ed4b260cd9",
            "isActive": true,
            "lastModified": "2023-07-26T16:17:10.000Z",
            "addedBy": "64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:17:10.000Z",
            "__v": 0
        },
        {
            "_id": "64c1474a85ed9a2c45c4d1b7",
            "name": "Milkshake",
            "price": {
              "$numberDecimal": "50"
            },
            "categoryID": "64a825e585ad11ed4b260cdc",
            "isActive": true,
            "lastModified": "2023-07-26T16:18:18.000Z",
            "addedBy": "64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:18:18.000Z",
            "__v": 0
        },
        {
            "_id": "64c148f785ed9a2c45c4d231",
            "name": "Salty Shawarma",
            "price": {
              "$numberDecimal": "110"
            },
            "categoryID": "64a825e585ad11ed4b260cd9",
            "isActive": true,
            "lastModified": "2023-07-26T16:25:27.000Z",
            "addedBy":"64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:25:27.000Z",
            "__v": 0
        }
    ]);

    await DishRecipe.insertMany([
        {
            "_id": "64c1470685ed9a2c45c4d173",
            "dishID": "64c1470685ed9a2c45c4d16e",
            "ingredients": [
              {
                "ingredient": "64c140dd85ed9a2c45c4d0e5",
                "chefWeight": {
                  "$numberDecimal": "100"
                },
                "chefUnitID": "64a5804ea792248175d204e7",
                "_id": "64c1470685ed9a2c45c4d174"
              }
            ],
            "isActive": true,
            "lastModified": "2023-07-26T16:17:10.000Z",
            "addedBy": "64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:17:10.000Z",
            "__v": 0
        },
        {
            "_id": "64c1474a85ed9a2c45c4d1bc",
            "dishID": "64c1474a85ed9a2c45c4d1b7",
            "ingredients": [
              {
                "ingredient": "64c140ce85ed9a2c45c4d0d9",
                "chefWeight": {
                  "$numberDecimal": "2"
                },
                "chefUnitID": "64a451bb9a494ecb0fd7216b",
                "_id": "64c1474a85ed9a2c45c4d1bd"
              }
            ],
            "isActive": true,
            "lastModified": "2023-07-26T16:18:18.000Z",
            "addedBy": "64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:18:18.000Z",
            "__v": 0
        },
        {
            "_id": "64c148f785ed9a2c45c4d238",
            "dishID": "64c148f785ed9a2c45c4d231",
            "ingredients": [
              {
                "ingredient": "64c140dd85ed9a2c45c4d0e5",
                "chefWeight": {
                  "$numberDecimal": "100"
                },
                "chefUnitID": "64a5804ea792248175d204e7",
                "_id": "64c148f785ed9a2c45c4d239"
              },
              {
                "ingredient": "64c147d485ed9a2c45c4d1c9",
                "chefWeight": {
                  "$numberDecimal": "5"
                },
                "chefUnitID": "64c1488e85ed9a2c45c4d200",
                "_id": "64c148f785ed9a2c45c4d23a"
              }
            ],
            "isActive": true,
            "lastModified": "2023-07-26T16:25:27.000Z",
            "addedBy": "64a3fc38e916ed6021b6a5f6",
            "isApproved": "approved",
            "approvedOn": "2023-07-26T16:25:27.000Z",
            "__v": 0
        }
    ]);

    await Order.insertMany([
        {
            "_id": "64c1490585ed9a2c45c4d24c",
            "totalPrice": {
              "$numberDecimal": "150"
            },
            "date": "Thu Jul 27 2023 00:25:41 GMT+0800 (Philippine Standard Time)",
            "takenBy": "alain",
            "__v": 0
        },
        {
            "_id": "64c1490c85ed9a2c45c4d278",
            "totalPrice": {
              "$numberDecimal": "220"
            },
            "date": "Thu Jul 27 2023 00:25:48 GMT+0800 (Philippine Standard Time)",
            "takenBy": "alain",
            "__v": 0
        }
    ]);

    await OrderItem.insertMany([
        {
            "_id": "64c1490585ed9a2c45c4d24e",
            "orderID": "64c1490585ed9a2c45c4d24c",
            "dishID": "64c1474a85ed9a2c45c4d1b7",
            "qty": 1,
            "__v": 0
        },
        {
            "_id": "64c1490585ed9a2c45c4d250",
            "orderID": "64c1490585ed9a2c45c4d24c",
            "dishID": "64c1470685ed9a2c45c4d16e",
            "qty": 1,
            "__v": 0
        },
        {
            "_id": "64c1490c85ed9a2c45c4d27b",
            "orderID": "64c1490c85ed9a2c45c4d278",
            "dishID": "64c148f785ed9a2c45c4d231",
            "qty": 2,
            "__v": 0
        }
    ]);

    await Discarded.insertMany([
        {
            "_id": "64c1468185ed9a2c45c4d136",
            "ingreID": "64c140dd85ed9a2c45c4d0e5",
            "date": "Thu Jul 27 2023 00:14:57 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "netWeight": {
              "$numberDecimal": "100"
            },
            "unitID": "64a5804ea792248175d204e7",
            "__v": 0
        },
        {
            "_id": "64c1469085ed9a2c45c4d145",
            "ingreID": "64c140ce85ed9a2c45c4d0d9",
            "date": "Thu Jul 27 2023 00:15:12 GMT+0800 (Philippine Standard Time)",
            "doneBy": "64a3fc38e916ed6021b6a5f6",
            "netWeight": {
              "$numberDecimal": "250"
            },
            "unitID": "64a5804ea792248175d204e9",
            "__v": 0
        }
    ]);



    
}
module.exports =  {addSamples};
