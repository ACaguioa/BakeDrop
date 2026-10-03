import banana from "../assets/products/banana.jpg";
import cheesebread from "../assets/products/cheesebread.jpg";
import cheesedesal from "../assets/products/cheesedesal.jpg";
import chocoroll from "../assets/products/chocoroll.jpg";
import customize from "../assets/products/customize.jpg";
import donuts from "../assets/products/donuts.jpg";
import eggpie from "../assets/products/eggpie.jpg";
import ensaymada from "../assets/products/ensaymada.jpg";
import garlic from "../assets/products/garlic.jpg";
import kababayan from "../assets/products/kababayan.jpg";
import loaf from "../assets/products/loaf.jpg";
import mangoroll from "../assets/products/mangoroll.jpg";
import mocharoll from "../assets/products/mocharoll.jpg";
import pandecoco from "../assets/products/pandecoco.jpg";
import pandesal from "../assets/products/pandesal.jpg";
import pianono from "../assets/products/pianono.jpg";
import raisin from "../assets/products/raisin.jpg";
import spanish from "../assets/products/spanish.jpg";
import ubedesal from "../assets/products/ubedesal.jpg";
import ubeensaymada from "../assets/products/ubeensaymada.jpg";
import assorted from "../assets/products/assorted.jpg";

const products = [
  {
    id: 1,
    name: "Banana Bread",
    image: banana,
    category: "Breads",
    price: 180,
    description:
      "Soft and moist banana bread made with ripe bananas, perfect for breakfast or an afternoon treat.",
  },

  {
    id: 2,
    name: "Cheese Bread",
    image: cheesebread,
    category: "Filipino Breads",
    price: 180,
    description:
      "Soft Filipino bread filled and topped with delicious cheese. Sold by the box of 6.",
  },

  {
    id: 3,
    name: "Cheese Pandesal",
    image: cheesedesal,
    category: "Filipino Breads",
    price: 150,
    description:
      "Soft and fluffy pandesal with a delicious cheesy center. Sold by the box of 12.",
  },

  {
    id: 4,
    name: "Chocolate Cake Roll",
    image: chocoroll,
    category: "Cakes",
    price: 380,
    description:
      "Soft chocolate sponge cake rolled with a smooth and creamy filling.",
  },

  {
    id: 5,
    name: "Customizable Cake",
    image: customize,
    category: "Cakes",
    price: 650,
    description:
      "Create your own special cake with your preferred design, flavor, message, and decorations.",
    customizable: true,
  },

  {
    id: 6,
    name: "Donuts",
    image: donuts,
    category: "Pastries",
    price: 300,
    description:
      "Freshly baked soft donuts with delicious toppings. Sold by the box of 12.",
  },

  {
    id: 7,
    name: "Egg Pie",
    image: eggpie,
    category: "Pastries",
    price: 350,
    description:
      "Classic Filipino egg pie with a rich, creamy, and smooth custard filling. One whole pie with 8 slices.",
  },

  {
    id: 8,
    name: "Ensaymada",
    image: ensaymada,
    category: "Filipino Breads",
    price: 240,
    description:
      "Soft and buttery Filipino ensaymada topped with creamy butter, sugar, and cheese. Sold by the box of 7.",
  },

  {
    id: 9,
    name: "Garlic Bread with Pork Floss",
    image: garlic,
    category: "Breads",
    price: 280,
    description:
      "Soft garlic bread topped with savory pork floss. Sold by the box of 2.",
  },

  {
    id: 10,
    name: "Kababayan",
    image: kababayan,
    category: "Filipino Breads",
    price: 180,
    description:
      "Traditional Filipino kababayan bread with a soft and slightly sweet texture. Sold by the box of 12.",
  },

  {
    id: 11,
    name: "Loaf Bread",
    image: loaf,
    category: "Breads",
    price: 120,
    description:
      "Freshly baked soft white loaf bread, perfect for breakfast and sandwiches.",
  },

  {
    id: 12,
    name: "Mango Cake Roll",
    image: mangoroll,
    category: "Cakes",
    price: 400,
    description:
      "Light and fluffy cake roll with a creamy mango filling.",
  },

  {
    id: 13,
    name: "Mocha Cake Roll",
    image: mocharoll,
    category: "Cakes",
    price: 400,
    description:
      "Soft cake roll filled with smooth and flavorful mocha cream.",
  },

  {
    id: 14,
    name: "Pande Coco",
    image: pandecoco,
    category: "Filipino Breads",
    price: 180,
    description:
      "Classic Filipino bread filled with sweet and delicious coconut filling. Sold by the box of 6.",
  },

  {
    id: 15,
    name: "Pandesal",
    image: pandesal,
    category: "Filipino Breads",
    price: 100,
    description:
      "Freshly baked classic Filipino pandesal with a soft and fluffy center. Sold by the box of 12.",
  },

  {
    id: 16,
    name: "Pianono",
    image: pianono,
    category: "Filipino Breads",
    price: 180,
    description:
      "Soft Filipino sponge roll filled with a sweet and creamy filling. Sold by the box of 6.",
  },

  {
    id: 17,
    name: "Raisin Bread",
    image: raisin,
    category: "Breads",
    price: 180,
    description:
      "Soft and lightly sweet bread generously filled with juicy raisins.",
  },

  {
    id: 18,
    name: "Spanish Bread",
    image: spanish,
    category: "Filipino Breads",
    price: 180,
    description:
      "Classic Filipino Spanish bread with a soft texture and sweet buttery filling. Sold by the box of 6.",
  },

  {
    id: 19,
    name: "Ube Pandesal",
    image: ubedesal,
    category: "Filipino Breads",
    price: 220,
    description:
      "Soft purple ube pandesal with a delicious sweet ube filling. Sold by the box of 12.",
  },

  {
    id: 20,
    name: "Ube Cheese Ensaymada",
    image: ubeensaymada,
    category: "Filipino Breads",
    price: 280,
    description:
      "Soft ube-flavored ensaymada topped with creamy butter and cheese. Box of 7",
  }, 

  {
    id: 21,
    name: "Assorted Filipino Favorites",
    image: assorted,
    category: "Assorted",
    price: 180,
    description:
      "Assorted all-time Filipino Favorites. Box of 6",
  },
];

export default products;